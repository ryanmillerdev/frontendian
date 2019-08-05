---
author_name: Ryan Miller
author_twitter: andryanmiller
excerpt: "In any good heist movie, it's ultimately the little details that make the difference between prison and payday. Much the same could be said of web security: it's the small oversights that pose the most risk to our applications, as few of us will ever stand against DDOS attacks the size of which recently hit GitHub, just as most heists won't be conducted with bazookas. They'll sneak in through the vents instead."
hero: /svg/safe-cracking.svg
language: en
og_image: /img/hsts_og_image.png
published_at: 2018-09-23T15:00:00.754Z
slug: hsts
title: HSTS
---
In any good heist movie, it's ultimately the little details that make the difference between prison and payday. Much the same could be said of web security: it's the small oversights that pose the most risk to our applications, as few of us will ever stand against DDOS attacks the size of which [recently hit GitHub](https://www.wired.com/story/github-ddos-memcached/), just as most heists won't be conducted with grenades. They'll sneak in through the vents instead. 

Insecure HTTP connections are to web apps as vent systems are to casinos. Most web developers know that HTTP has its risks, and so obtain TLS certificates and enable HTTPS, perhaps even redirecting insecure traffic to HTTPS before serving their applications. Yet a crucial vulnerability remains: the initial HTTP connection that is made prior to redirection.

Thankfully, there exists a means to ensure that virtually all connections to your app, even the first one, are made via HTTPS: HTTP Strict Transport Security, or HSTS. This post is going to explain HSTS in depth, and will also offer a short primer on the dangers even a single HTTP request can pose to your application. We'll also cover a few gotchas and risks associated with HSTS.

<figure>
  <img src="/svg/poker-table.svg" width="100%" style="max-width: 40rem; margin: 5rem 0;"/>
</figure>

## The Dangers of HTTP

With the advent of resources and tools like [Let's Encrypt](https://letsencrypt.org/) and [Amazon Certificate Manager](https://aws.amazon.com/certificate-manager/), HTTPS is slowly becoming the standard means of facilitating web traffic. One tell-tale sign of this is the Chrome team's decision [to mark apps as "Not Secure"](https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html) if they fail to employ HTTPS, versus marking sites that do as "Secure".

While many web developers understand why secure HTTP connections are a good thing, fewer understand why insecure HTTP connections _are a bad thing_. This results in a fundamental underestimation of the danger that even a single HTTP connection can pose to user security. To highlight these dangers, let's consider two vectors that an attacker might pursue were they to have access to your unencrypted HTTP sessions.

The first vector is simply sniffing your packets and using the data they contain malicously. Using tools like [Aircrack-ng](https://www.aircrack-ng.org/), an attacker could pull HTTP packets out of the air if you happen to be using a public WiFi access point. Even access points secured with WPA2 [are vulnerable to sniffing](https://askubuntu.com/questions/537739/how-can-i-encrypt-my-internet-traffic-so-i-can-use-public-wifi-securely). This data not only tells the attacker what you're browsing but may also contain cookies and other sensitive information. 

The second vector is via a man-in-the-middle (MITM) attack, whereby the attacker hijacks your insecure connection to return a crafted response. This does require the attacker to have control of either a router or other network device in order to intercept your sessions. Comcast, one of the largest network hardware operators in the US, [routinely uses this technique](https://www.privateinternetaccess.com/blog/2016/12/comcast-still-uses-mitm-javascript-injection-serve-unwanted-ads-messages/) to show ads and messages. This vector poses a far greater risk given that the browser has little means of knowing if scripts or other resources were tampered with (unless you leverage [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)).

In either of the scenarios above, it only takes a single HTTP request to make your users vulnerable. As was mentioned at the beginning of this post, the HTTP request made just before you redirect your users to HTTPS can still be hijacked to return a malicious site instead of the intended payload.

<figure>
  <img src="/svg/security-guard.svg" width="100%" style="margin: 3rem 0; max-width: 20rem"/>
</figure>

## Introducing HSTS

HSTS, or HTTP Strict Transport Security, is mechanism for instructing browsers that your application ought never be accessed over an insecure connection. Defined in [RFC 6797](https://tools.ietf.org/html/rfc6797), HSTS accomplishes its purpose via a header that tells browsers to load all future requests over HTTPS, and also a  means by which browsers can "preload" lists of apps that wish to leverage HSTS, thereby protecting against the [bootstrapping vulnerability](https://tools.ietf.org/html/rfc6797#page-36). HSTS also prevents browsers from connecting to your app [via suspicious HTTPS connections](https://tools.ietf.org/html/rfc6797#section-8.4), which would inevitably be the case if an attacker used a counterfeit TLS certificate.

The initial seed of the HSTS specification was put forth in a paper by Collin Jackson and Adam Barth called [ForceHTTPS](https://crypto.stanford.edu/forcehttps/forcehttps.pdf), published in 2008. Fast-forward to November 2012 and RFC 6797 is born, with both Jackson and Barth as editors.

To enable HSTS for your app, you only need to return the following header when loading your app:

<pre><code>GET https://mysecureapp.com HTTP/1.1
Strict-Transport-Security: max-age=86400</code></pre>

The above will inform the browser that all subsequent requests to `mysecureapp.com` should be made over HTTPS. Should a user happen to navigate `mysecureapp.com` in the future, without specifying a protocol, the browser will automatically forward them to `https://mysecureapp.com` without first initiating an HTTP request to your domain.

Let's now dig into a few of the directives you can use to craft your HSTS policy.

### The `max-age` Directive

The `max-age` directive also lets the browser know that it should cache this HSTS response for certain number of seconds. The above response of `max-age=86400` specifies a caching period of a single day. As will be discussed in a later section, you should avoid setting long `max-age` durations when first rolling out HSTS, lest you inadvertnatly affect some of your users and have no means of rolling back.

### The `includeSubdomains` Directive

The `includeSubdomains` directive tells the browser that the HSTS policy should be applied to all subdomains under the domain for which the policy was specified. It's used as follows:

<pre><code>GET https://mysecureapp.com HTTP/1.1
Strict-Transport-Security: max-age=86400; includeSubdomains</code></pre>

Were a user to initiate a session with `api.mysecureapp.com` after caching the above policy, that session would immediately be upgraded to HTTPS by the browser. 

You might wonder why such a powerful directive exists. Misapplied, it could render entire swaths of an application useless if they are unable to facilitate HTTPS connections. Yet the authors of RFC 6797 [offer a compelling justification](https://tools.ietf.org/html/rfc6797#section-14.4): if you use cookies that are accessible to subdomains, you need an ability to protect them.

Imagine the following scenario. You've applied HSTS to your top-level domain, `mysecureapp.com`, but not to subdomains. You have a cookie that is shared across `mysecureapp.com` as well as its subdomains, which you might argue is already a bad idea, but remains for legacy reasons. Nevertheless, it's been marked with the `Secure` flag, so it can't be transmitted over HTTP. 

A clever attacker might gain control of a DNS server and [inject a record](https://www.veracode.com/security/cache-poisoning) for a subdomain of `mysecureapp.com`, such as `buynow.mysecureapp.com`. They could then also supply a bogus TLS certificate for that subdomain, which would result in an HTTPS security warning presented to the user, but which nevertheless might be ignored. Should a user happen to find themselves on such a site, the secure cookie could still be comprimised. Were `includeSubdomains` active on `mysecureapp.com`, the HTTPS error would have resulted in the user being categorically blocked from the malicous site via HSTS, and would not have been permitted to click through a security warning.

### The `preload` Directive

The `preload` directive signals that you wish to permit your HSTS policy to be cached in browser "HSTS preload lists". HSTS preload lists are one of the most powerful components of the framework, and to better explain their utility, let's revisit the "bootstrapping vulnerability" mentioned above.

Imagine you operate a web application with critical security implications, such as a banking app. Even a single HTTP request to `chase.com` or `wellsfargo.com` could have dire consequences if that request is intercepted by an attacker. Yet even if you supply a strong HSTS policy on your origin, the browser will still allow HTTP requests to your origin until is has registered your HSTS policy, leaving a small window of opportunity for malicous actors.

The above vulnerability is called the "bootstrapping vulnerability", and is what HSTS preload lists aim to solve. By setting the `preload` directive in your policy, you give the green light for browsers to cache your HSTS policy ahead of time, thereby allowing them to redirect users to HTTPS even if they've never visited your app before.

Google Chrome was the first to advance such a list, and you can learn more by visiting its [registration portal](https://hstspreload.org/). Rather than require users to submit to multiple HSTS lists, the majority of modern browsers simply redownload the Chromium list (though Firefox [does revalidate entries](https://wiki.mozilla.org/SecurityEngineering/HTTP_Strict_Transport_Security_(HSTS)_Preload_List)). To qualify for inclusion in the Chromium list, your domain's HSTS policy must include:

1. A `max-age` directive of at least 31536000 seconds (roughly a year).
2. An `includeSubdomains` directive.
3. A `preload` directive.

Additionally, you must ensure that all of your origin's subdomains are in fact HTTS capable, and that you also redirect HTTP traffic to HTTPS. Once submitted, it may take a couple months before your policy is rolled out across the majority of users. Scott Helme [wrote about an interesting test he did](https://scotthelme.co.uk/hsts-preload-test/) tracking the amount of time for single HSTS policy to propagate.

Should you someday wish to remove your domain from Chromium's HSTS preload list, [there's a form for that](https://hstspreload.org/removal/). Be forewarned: a considerable amount of time might elapse between your removal and the deployment of the new list (and its propagation across the userbases of the browsers that employ it).

<figure>
  <img src="/svg/diamonds.svg" width="100%" style="margin: 3rem 0; max-width: 25rem"/>
</figure>

## Deploying HSTS

As you may have surmised, HSTS policies can be challenging to revert once deployed. In fact, the authors of RFC 6797 warn that HSTS would be an effective means by which to inflict [denial of service](https://tools.ietf.org/html/rfc6797#section-14.5) on site. Therefore, as we near the end of this post I wanted to share some thoughts on cautiously deploying a fledgling HSTS policy.

Firstly, avoid long `max-age` durations out of the gate. Once a browser has cached your policy, your only recourse is to wait until the browser dispenses with the policy, or begin telling your users to access a different part of your site. Thus, keeping `max-age` low will make it easier to rollback a poorly crafted policy.

Secondly, if you plan to employ `includeSubdomains`, double-check that you've accounted for each subdomain your application uses, then triple-check and quadruple-check. If you're rolling out a new policy, test `includeSubdomains` early to ensure you have time to revert its inclusion or make changes.

Thirdly, act as though submitting your site for inclusion in an HSTS preload list is like signing a blood pact. Only with great chagrin and trauma will you sever the oath you have made. Per testing by [Scott Helme](https://scotthelme.co.uk/hsts-preload-test/), you may face several months of limbo (or longer) before the majority of users no longer use your preloaded policy. 

<figure>
  <img src="/svg/roulette.svg" width="100%" style="margin: 3rem 0; max-width: 30rem"/>
</figure>

## Conclusion

As you strive to protect your users, tools like HSTS give you an edge. If we've learned anything from Ocean's 11, it's that the devil is in the details, both when planning a casino heist and designing your app's security stance. I hope this post has given you a reason to be excited about HSTS, and if you've spotted an error, be it factual or syntactical, let me know in the comments below!

## Resources & References

[RFC 6797](https://tools.ietf.org/html/rfc6797)  
[ForceHTTPS](https://crypto.stanford.edu/forcehttps/)  
[Preload Submission Site](https://hstspreload.org/)  
[OWASP HSTS Cheat Sheet](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security_Cheat_Sheet)  
[Scott Helme on HSTS Propagation Times](https://scotthelme.co.uk/hsts-preload-test/)

## Illustrations

Many thanks to [Dmitry Venevtsev](https://creativemarket.com/WINS) for this month's illustrations!
