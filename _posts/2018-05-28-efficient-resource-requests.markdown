---
layout: post
title:  "Efficient Resource Requests"
date:   2018-05-28 07:50:24 -0700
categories: performance
---
Few users of the modern internet realize that a webpage isn't a single "thing" but a composition of scripts, stylesheets, HTML, and more. To an end user, a website is a website, though some are certainly slower than others, and some keep lagging even after the page has loaded. Much of what can be interpreted as a website's performance can be reduced to how quickly its various resources are obtained, and as users become accustomed to meticulously tuned web applications by the likes of Google and Facebook, it's important for every frontend developer to understand how to optimize their site's resource requests.

This post is going to walk through the aspects of an efficient resource request, from the actual proximity of the resource to its eventual receipt and caching. Leveraging efficient resource requests can not only make your site's initial page loads substanitally faster, but can also improve performance on subsequent page loads and boost your SEO, as [Google does take performance into account](https://webmasters.googleblog.com/2010/04/using-site-speed-in-web-search-ranking.html) when ranking. 

## What's a Resource Request?

When we talk about resource requests, we're talking about any request that your webpage makes to obtain something it needs to function, either now or at some point in the future. Common resources requested by a website are:

- __Scripts__: You'd be hard-pressed to find a website that doesn't leverage JavaScript, the bulk of which originates from third-party tooling (think Google Analytics, Intercom, etc...)
- __Stylesheets__: Stylesheets are responsible for delivering CSS to the browser, and instruct it how to style the page.
- __Media__: Images and video are by far the most intensive resources most pages utilize.
- __Fonts__: Gone are the days of Times New Roman and Arial! Many sites now require custom fonts.

A resource request starts with an HTTP request to the resource's URL and ends with the receipt of the resource by the user's browser.

Modern browsers have wonderful tooling that allows you to watch resource requests in action and gain a better understanding of their bottlenecks. Google Chrome offers [such tooling](https://developers.google.com/web/tools/chrome-devtools/network-performance/), as do [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor), [Safari](https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/Web_Inspector_Tutorial/EnhancingyourWebpagesPerformance/EnhancingyourWebpagesPerformance.html#//apple_ref/doc/uid/TP40017576-CH6-DontLinkElementID_17), and [Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/network).

## Our Hero Embarks 

Imagine we're authoring a website that needs three resources: a JavaScript file (script.js), a stylesheet (styles.css), and an image (welcome.jpg). All three assets are requested simultaneously when our website loads. Let us also say that this website is expected to receive tremendous, nay, _bonecrushing_, traffic from all over the globe, and users that view it once will very likely view it time and time again. People who have seen this site liken it to Buzzfeed's ["What Colors Are This Dress?"](https://www.buzzfeed.com/catesish/help-am-i-going-insane-its-definitely-blue?utm_term=.jsDQ78eDL#.ntvJMqmWL){:target="_blank"}.

How can we optimize our three simple resource requests in such a way that we both make the requests lightweight while also delivering the best experience? Our tale will follow Marceline, a potential user of the aforementioned site who lives in Croatia and is particularly excited to view our site. She types in its URL, https://example.com, and presses enter. And away we go.

## Optimizing DNS

Once the initial webpage markup loads in Marceline's browser, our resource requests are intiated via our inclusion of certain tags such as `<script>`, `<link>`, and `<img>`. Before the formal HTTP request can be sent for those resources, Marceline's browser needs to obtain an IP address for the servers possessing said resources. This process of converting human-readable URLs into IP addresses is a job for DNS, and though it's typically one of the least optimized aspects of a resource request, there a few things you can do to ensure users like Marceline get a speedy response to their DNS queries.

Firstly, ensure that any zone files for domains from which you serve assets set long TTLs on their A (or AAAA) records. TTL stands for time-to-live, and while it might be tempting to set a short TTL so that you can see updates to your DNS settings quickly, it means that any DNS resolvers which cache your records need to return to the source frequently. In the event that your authoritative nameserver goes down, this can actually take your site with it, whereas if you set a long TTL you can buy yourself days or even weeks.

Secondly, using record types like CNAMEs might have a negative impact on your load time, given that they too must resolve a domain name before returning an IP address to the requester. Using A records for IPv4, or AAAA records for IPv6, allow requesters to receive quick answers regarding the location of your server. A new feature that a handful of DNS providers offer is the `ALIAS` record, which functions similarly to a CNAME but will return A records to the requester and thus make overall resolution time shorter.

## Proximity

Now that Marceline has IP addresses for the various resources, and is ready to request to a specific resource, what occurs? Your browser will attempt to establish an HTTP connection with one or more of the servers supposedly listening at those IP addresses and retrieve the resources.

In order to make this phase of a resource request most efficient, nothing beats proximity (well, almost nothing). Serving your resources from servers near to a user will minimize latency and decrease the amount of time it takes to deliver them. 

Until this decade, the average web developer wasn't left with many options in this domain. It was expensive enough to operate a single server, and the idea of having dozens of servers all over the world seem ludicrous. Until companies like AWS and Cloudflare released pay-as-you-go CDN products.

CDN stands for Content Delivery Network and represents a system by which web resources can be propagated to "edge nodes" nearest users for maximum performance. In practice, many of these edge nodes live at peering facilities like our very own [Seattle Internet Exchange](https://www.seattleix.net/). Most CDNs offer multiple such nodes in large metropolitan areas, and given that nodes are typically linked via a high-speed connection, resources will likely transit across the globe more quickly via their network than they would if simply requested by your browser.

## Paralellization

Let's recap. From entering the URL to our site, to pressing enter, mere milliseconds have gone by for Marceline. Her browser has received an answer to its DNS queries, and has made a connection to the server designated by the responses to those queries: `https://cdn.example.com`.

I mentioned earlier that our simple site only needs three resources. Under the hood, when a browser makes an HTTP request to a server it's also initiating what's called a TCP connection to faciliate the data transfer. TCP stands for "Transfer Control Protocol", and while I won't get into the weeds on the topic here, be aware that browsers limit the number of open TCP connections you can have to a single domain. Google Chrome caps TCP connections at six, and so if you needed twelve resources, the first six would be established while the other six waited for their chance.

However, a new technology is here that lets us do away with limits to TCP connections. It's called HTTP/2, and put simply, it allows multiple, even hundreds, of HTTP connections to a single domain to share one TCP connection. This allows for massive _request parallelization_, and can improve the speed of your site dramatically.

If Marceline's browser was stingy about its TCP connections, giving us, say, two, HTTP/2 would come to our rescue and allow us to retrive all three resources at once via only a single TCP connection. Most CDN providers, such as Amazon Cloudfront and Cloudflare, offer HTTP/2 support by default, and so it's as simple as leveraging their products to gain this feature. A number of open source 
server libraries also offer support for HTTP/2.

## Minification & Compression

With our connections established, its time for data transfer to Marceline's browser to begin. In order to ensure our connection is only used to transfer bytes which are absolutely necessary, we ought to do what we can to minimize the size of the resources. There are two big levers we can move here: optimization and compression.

_Optimization_ (or _minification_) has to do with changing the underlying file as would exist *at rest* to something more compact. _Compression_ is a technique we use to decrease the size of the asset _in flight_, and doesn't attempt to change the actual underlying bits and bytes.

How a particular asset can be optimized depends on the type of asset that it is. Image compression software is widely available, and text based resources can be compacted via removal of comments, whitespace, etc... Chances are there is nearly always a way to make a given resource smaller.

In the world of compression, however, there is one technique that has risen above the rest: GZIP. Particularly for text resources, GZIP can save your users of thousands of kilobytes over a series of resource requests. Most modern browsers support GZIP by default, though you'll need to ensure your server is properly compressing the resources upon transmission.

Compression can be an expensive operation, so it's critical that you make sure to cache the results of the compression for static resources.

## Caching

Marceline has now downloaded all of our sites resources in their entirety. We might think our job is done, but there's one thing we can do to ensure that her subsequent requests to our site as as snappy as possible, and that's properly configure the `Cache-Control` headers returned with our resources.

By configuring our `Cache-Control` header, we can explicitly instruct Marceline's browser as per which resources might need to be re-requested in the future and which won't be likely to change. Setting the `Cache-Control` header means specifying one or more of its _directives_, each of which can be viewed [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). 

There are three directives of note for us in this instance. The first two, `public` and `private` designate whether a resource should be placed in a shared cache or retain only for the specific user requesting the page at that moment. The third, `max-age` tells the browser how long a given resource might be stored before being re-requested.

For most static assets, the `max-age` should be set to its maximum value, `31536000`, or one year. Though the question aries: what happens if you need to make a change to this file? Enter "cache-busting", or the practice of appending a string of random alphanumeric characters to a filename whenever publishing a new version. By doing this, the browser believes it's interacting with a new resource, and will fetch it anew. Thus, if your original filename was `script.js`, the cache-busted version might be titled `script.a8sd9f.js`. 

## That's All Folks!

To summarize, you can optimize your resource requests by:

- Tuning your __DNS__ settings to ensure quick, cacheable responses by your nameserver.
- Using a __CDN__ to ensure your resources are proximal to your users.
- Leverage __HTTP/2__ to parallelize requests.
- Ensuring you __optimize__ and __compress__ your resources.
- __Caching__ your resources upon receipt by end-users via the `Cache-Control` header.

Hopefully a few of these tips are of use to you, and if you have a question (or spot an error) don't hestitate to ping me on Twitter at [@andryanmiller](https://twitter.com/andryanmiller){:target="blank"}.