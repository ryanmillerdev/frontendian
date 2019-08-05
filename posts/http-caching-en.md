---
author_name: Ryan Miller
author_twitter: andryanmiller
comments: true
excerpt: Of all the bytes scurrying around on the internet at any given moment, the vast majority of them are static, or are unlikely to change over time. Images, videos, and fonts all fall into this category, and a great many of the modern internet's performance woes can be attributed to these resources.
hero: /svg/wizard_bookshelf.svg
language: en
og_image: /img/http_caching_og_image.png
published_at: 2019-04-14T15:00:00.754Z
slug: http-caching
title: "HTTP Caching"
---
Of all the bytes scurrying around on the internet at any given moment, the [vast majority of them](https://httparchive.org/reports/page-weight?start=2014_03_01&end=latest&view=list) are _static_, or unlikely to change over time. Images, videos, and fonts all fall into this category, and a great many of the modern internet's performance woes can be attributed to these resources. 

The issue isn't necessarily that these resources are large, or that they tend to be unoptimized, but that many web applications need to fetch them with every page refresh. If users could spend less time downloading your gorgeous [Unsplash](https://unsplash.com/) hero image, and more time rendering HTML and parsing JavaScript, they would experience a snappier application. 

Thankfully, HTTP offers a powerful solution: _caching_. This post is going to explain how HTTP can instruct browsers to reuse expensive resources, saving bandwidth and time. We'll begin with an overview of caching concepts, then describe how the HTTP's caching mechanism evolved between HTTP/1.0 and HTTP/1.1.

<figure>
  <img src="/svg/wizard_librarian.svg" width="100%" style="max-width: 18rem; margin:4rem 0;"/>
</figure>

## Caching Basics

In its simplest form, a _cache_ simply allows a system to hold onto a resource if it knows that said resource isn't likely to change over a certain period of time. Before that time period expires a resource is said to be _fresh_, and afterwards it is said to be _stale_. These two terms are central to an understanding of caching.

The perfect cache would allow a client, such as a browser, to hold onto a resource for as long as possible before discarding it for a newer version when appropriate. Easily stated, but one of the ["two hard problems"](https://martinfowler.com/bliki/TwoHardThings.html) in computer science.

In order for a cache to function you need a way to convey how long a resource will be fresh, which is an impossible task for a server given that it cannot predict with absolute certainty when (if ever) a resource will be updated. That's knowledge only you, as the developer, possess. And so it's up to you to guide the cache.

How to accomplish that? HTTP offers two primary means, the first of which we'll dive into now.

<figure>
  <img src="/svg/wizard_skull.svg" width="100%" style="max-width: 18rem; margin:4rem 0;"/>
</figure>

## `Expires` & the Origins of HTTP Caching

`Expires` was introduced in [HTTP/1.0](https://tools.ietf.org/html/rfc1945#section-10.7), and, alongside `Pragma`, `Last-Modified`, and `If-Modified-Since`, comprised HTTP's first caching system. It's the simplest of the HTTP caching headers at your disposal, indicating the date at which a given resource will become stale:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 200
Content-Type: image/jpeg
Last-Modified: Fri, 12 Apr 2019 08:00:00 GMT
Expires: Sun, 14 Apr 2019 08:00:00 GMT</code></pre> 

Once the date specified by `Expires` is in the past, the browser will attempt to re-fetch the resource in question. Simple as that! Until then, the browser is free to hold onto the resource and reuse it at will.

<figure>
  <img src="/svg/wizard_telescope.svg" width="100%" style="max-width: 25rem; margin:4rem 0;"/>
</figure>

### Revalidation with `Last-Modified` & `If-Modified-Since`

Remember how we mentioned the perfect cache would only fetch a new resource when it was 100% certain one was available? One way to achieve that is to allow browsers to interrogate servers as per whether such a resource is indeed available. But how can a browser indicate which version of a resource it currently has?

Enter `If-Modified-Since`. Extending our example above, imagine if a browser wanted to fetch `image.jpeg` on April 15th, a day after the date specified by the `Expires` header. You'll notice that the code snippet above contains `Last-Modified` header, which indicates the last time the server believes that the image was updated.

Given that the browser already has `image.jpeg` in its cache, it can tell the server that it already has a copy of the image that was last modified on April 12th:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
If-Modified-Since: Fri, 12 Apr 2019 08:00:00 GMT
</code></pre>

If the image has changed, the server will simply respond with a full response containing the new image. Otherwise, it can respond with a `304 Not Modified` response:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 304
Expires: Sun, 14 Apr 2019 08:00:00 GMT
Last-Modified: Fri, 12 Apr 2019 08:00:00 GMT</code></pre>

Upon receipt of such a response, the browser is free to release its cached copy. This result is win/win for both the server and client: the server ensures the most up-to-date version of a resourse is in use, and the client doesn't need to redownload the image.

### Ensuring Freshness with `Pragma`

While HTTP/1.0 lacked any way for servers to instruct clients not to cache particular resources, there did exist a somewhat ungainly way for clients to request that servers not serve them a cached resource, called `Pragma`:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Pragma: no-cache</code></pre>

The utility of `Pragma` (which was originally designed as something of a [grab-bag header](https://tools.ietf.org/html/rfc7234#section-5.4)) is dubious, and is retained in HTTP/1.1 strictly for backwards compatibility. I mention it here only to round-out our discussion of caching in HTTP/1.0, but don't feel bad if you forget about it.

<figure>
  <img src="/svg/wizard_quill_and_scroll.svg" width="100%" style="max-width: 25rem; margin:4rem 0;"/>
</figure>

## `cache-control` & the Evolution of HTTP Caching

The limitations of `Expires` led to the introduction of `cache-control` in HTTP/1.1, which greatly augmented the flexibility with which developers could cache resources. Instead of relying stricly on dates, `cache-control` accepts a number of directives, a couple of which we'll discuss now, with the remainder being folded into discussions of revalidation, security, and more.

### Enter the `max-age` Directive

Think of the `max-age` directive as a simpler alternative to `Expires`. Should you wish to specify that a resource expires in a single day, you could respond with a `cache-control` header crafted as follows:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 200
Cache-Control: max-age=86400</code></pre>

Note that `max-age` is relative to the time of the request, so the timer begins ticking down the moment the resource enters the cache. You might ask, "Why switch to seconds over dates?"

Mark Nottingham [has a nice explanation](https://www.mnot.net/blog/2007/05/15/expires_max-age), and highlights the simplicity that `max-age` brings to the table. Consider the following:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 200
Expires: Mon, 15 Apr 2019 08:00:00 GMT
Cache-Control: max-age=86400</code></pre>

Not only can be it difficult to map the `Expires` date to your local timezone, many server implementations simply bungled the date format, which resulted in confusion. `max-age`, being a simple integer representing seconds since the response was generated, is far easier to grok.

The longest duration that the `max-age` directive can support is a year, which satisfies most use-cases. But if you communicate to a browser that a certain resource will never change, you can also leverage the newer `immutable` directive, which accomplishes exactly that. Be forewarned that its adoption isn't yet wholly consistent across browsers, so its worthwhile to throw in `max-age` alongside it. 

### Revalidation with `Etag` & `If-None-Match`

HTTP/1.1 also introduced a new revalidation strategy to complement `If-Modified-Since`, centered around what are termed "entity tags".

You can think of entity tags as a way for servers to uniquely identify a version of a resource with an alphanumeric ID, supplied in the `ETag` response header:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 200
Content-Type: image/jpeg
ETag: abc</code></pre>

If a client wants to tell the server that it has a specific version of a resource, it supplies the `If-None-Match` request header the next time it asks for the resource:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
If-None-Match: abc</code></pre>

Should the latest version of the resource not match the entity tag "abc", the server will respond with the new version. Otherwise, it will respond with a `304 Not Modified` response.

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 304
Content-Type: image/jpeg
ETag: abc</code></pre>

As you may have surmised, "abc" is an overly simple ID to use for a resource. How would you ensure a specific entity tag matches one version of a resource and not another?

It's this specific problem that leads popular storage serves like S3 to use [hashing algorithms like `md5`](https://stackoverflow.com/a/19896823/2356100) to generate entity tags. By using entity tags tied to the actual digest of the bytes comprising the resources, you obtain an identifier that is unique to that file.

Sidenote: you can specify the `must-revalidate` directive within `cache-control` to inform clients that they must use a validation mechanism, be it entity tags or `If-Modified-Since`, before releasing a stale copy of a resource from the cache (in the case that the server is unreachable).

<figure>
  <img src="/svg/wizard_chained_book.svg" width="100%" style="max-width: 25rem; margin:4rem 0;"/>
</figure>

### Ensuring Cache Privacy with `private` & `public` 

Till this point we've focused on the cache that exists within your browser, which caches resources as you download them. But the reality is that resources often pass through one or more intermediary, or "shared", caches before they make their way to your browser. These might be caches operated by your ISP or your corporate IT department. 

Before HTTPS was widespread, many intermediary caches took to holding onto resources in the off chance that another user might find it useful. It doesn't take much imagination to see how that could go awry. 

To mitigate this, HTTP/1.1 introduced the `public` and `private` `cache-control` directives, which, though still imperfect, allow you to instruct such shared caches that you don't want them to hold onto a copy of the resource. 

These directives are still useful. If you share a PC with multiple people, and your browser shares a cache between them all, then there's still the potential that it might share downloaded resources with them. If a resource specifies the `private` directive, then the browser should do its best to ensure only you, the user that downloaded it, can reuse it.

### Supressing Caching with `no-cache` & `no-store`

HTTP/1.1 corrected the insufficiency of HTTP/1.0's `Pragma` header and supplied web developers with a means by which caching could be completely disabled.

The first directive, `no-cache`, forces a cache to revalidate a resource before reuse. Unlike `must-revalidate`, `no-cache` means that the browser much revalidate in all cases, not just when the resource has become stale.

The second directive, `no-store`, is the hammer: it signals that the resource must not enter the cache under any circumstances. 

### Specifying Request-Specifc Caching Constraints

What if, as a client, you want to request an asset that will be fresh for at least a certain amount of time? The good news is that `cache-control` isn't only a tool for servers to specify caching constraints to clients–it's also available for clients to use to ensure they get a resource that meets certain caching qualifications.

The `max-age`, `no-cache`, and `no-store` directives can all be used in client requests. Their meaning tends to be the inverse of what it means for the client; for example, specifying a `max-age` header on a request tells any intermediate servers that they can't use any cached responses older than the duration specified in the directive.

In addition to the above directives, there are four request-only `cache-control` directives at your disposal. 

The `min-fresh` is straightforward–it allows clients to ask for resources that will be fresh for at least a certain period in seconds:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Cache-Control: min-fresh=3600
</code></pre>

The `max-stale` directive tells any intermediate caches that the client is willing to accept a stale response that hasn't been stale for more than a certain period of time in seconds:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Cache-Control: max-stale=3600
</code></pre>

The `no-transform` directive tells intermediate caches that the client doesn't want any version of the resource that said caches might have modified. This is applicable in cases where a cache like [Cloudflare](https://www.cloudflare.com/) might have applied `gzip` compression.

And lastly, the `only-if-cached` directive tells intermediate caches that the client only wants a cached response, and that they shouldn't otherwise bother with talking to the server for a fresh copy. If the cache is unable to satisfy the request, it should return a `504 Gateway Timeout` response.

<figure>
  <img src="/svg/wizard_dragon.svg" width="100%" style="max-width: 25rem; margin:4rem 0;"/>
</figure>

## `Vary` and Server-Negotiated Responses

Our final topic dives into how browsers actually identify resources, and how server negotiation plays into things.

At a high-level, a browser cache really just looks at the URL and the method, though since virtually all cacheable requests are GET requests the practical reality is that the URL is generally sufficient for browsers to identify resources.

This starts to break down when we realize that two responses served for the same URL could differ based on the user agent, or leverage different compression strategies.

To that end, caches pay close attention to which headers a server uses to negotiate an appropriate response, which is conveyed to the client via the `Vary` header. For example, imagine we made the following request for an image:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Accept-Encoding: gzip
</code></pre>

The `Accept-Encoding` header indicates that the server is permitted to respond with a `gzip` compressed version of the resource, if it's capable of doing so. If the server takes this header into account when deciding which response to send us, it would list it in the `Vary` header appended to its response:

<pre><code>GET https://www.example.com/image.jpeg HTTP/1.1
Status: 200
Cache-Control: max-age: 3600
Content-Encoding: gzip
Vary: Accept-Encoding
</code></pre> 

The ultimate result of this should be that the cache should not only use the value of the URL to cache the response, but that it should also use the value of the request's `Accept-Encoding` header to further qualify the cache key. Thus, if another request were made with a different value for the `Accept-Encoding` header, such as `deflate`, its response would not be substitutable for the request that specified `gzip`.

<figure>
  <img src="/svg/wizard_spell.svg" width="100%" style="max-width: 25rem; margin:4rem 0;"/>
</figure>

## Conclusion

Caching is a remarkably powerful way to augment the performance of your application, and I recommend diving into [MDN's full guide on cache-control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) if you want to explore its many nooks and crannies. I hope this post has given you a reason to be excited about HTTP caching, and if you've spotted an error in this post, be it factual or syntactical, let me know in the comments below!

## Resources

[MDN - Expires](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires)  
[MDN - Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)  
[Google Developer - HTTP Caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)  
[Mark Nottingham - Web Caching Tutorial](https://www.mnot.net/cache_docs/)  

## Illustrations

Thank you again to [Dmitry Venevtsev](https://creativemarket.com/WINS) for his wonderful work on the illustrations for this post!
