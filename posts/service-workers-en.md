---
author_name: "Ryan Miller"
author_twitter: andryanmiller
excerpt: "When authoring JavaScript for the browser, you don't think twice about embedding that JavaScript within an HTML document. Perhaps you load your script via a resource request, or embed it directly within a script tag, but in either scenario the lifecycle of your JavaScript is irrevocably married to its parent document."
hero: /svg/train.svg
language: en
og_image: /img/service_worker_og_image.png
published_at: 2018-08-26T15:00:00.754Z
slug: service-workers
title: "Service Workers"
---
When authoring JavaScript for the browser, you don't think twice about embedding that JavaScript within an HTML document. Perhaps you load your script via a resource request, or embed it directly within a script tag, but in either scenario the lifecycle of your JavaScript is irrevocably married to its parent document.

Yet what if you could break that mold and instead associate your scripts not with documents, but with _application events_? Imagine being able to respond to push notifications, intercept resource requests, and schedule background syncronization, all without the need for a user to actively have your website open in front of them. __Enter service workers__.

Service workers allow you to respond to a myriad of events, such as `fetch` (for network requests) and `push` (for push notifications), by authoring special-purpose JavaScript which you register with the browser. Whenever an event your service worker cares about occurs, your script will be loaded and the relevant handler executed, no matter if a user is currently browsing your app.

This post aims to give you a crash course on service workers and their promise for the future of web development. We'll start with a bit of history, then explain how you can register a service worker in your app. We'll also cover the most common use case for service workers, making apps offline-capable, and discuss what the future might hold for service workers.

## A Brief History

The possibility of a resilient, offline-capable web has allured developers for decades. HTML5Rocks has [a wonderful overview](https://www.html5rocks.com/en/tutorials/offline/whats-offline/) of the various tools and technologies that have been built to bridge the connectivity gap over the years. Yet it remained difficult to cobble these technologies together to assemble a truly coherent offline experience. One of the first attempts to really solve this problem was [ApplicationCache](https://webplatform.github.io/docs/apis/appcache/ApplicationCache/), which allowed websites to specify which resources could be made available to users when connectivity failed.

Yet ApplicationCache, [for a myriad of reasons](https://alistapart.com/article/application-cache-is-a-douchebag), fell out of favor amongst web developers. Chief amongst the gripes against ApplicationCache was the relative ease with which you could [permanently cripple your website](https://alistapart.com/article/application-cache-is-a-douchebag#section6). A solution was needed.

The service worker spec was borne out of these frustrations. As will be discussed in a following section, service workers enable offline-resilient websites through the covergence of two technologies: service workers themselves, and a new API (outlined within the service worker spec) called [Cache Storage](https://developer.mozilla.org/en-US/docs/Web/API/Cache). 

Nevertheless, the core value proposition for service workers remains their ability to execute JavaScript in response to application events.

## Installing A Service Worker

Let's dive into how you can install a service worker on your site. It all starts with authoring a smidgeon of JavaScript that tells the browser you want to register a service worker for a given origin. Here's an example:

<pre><code>// register-my-service-worker.js

navigator.serviceWorker.register('sw.js'.then(() => {
  console.info('Success!')
}).catch((err) => {
  console.error('Registration has gone awry!')
})</code></pre>

You might wonder if there's a way to register a service worker directly in JavaScript, rather than requesting an external asset. There isn't–and the reason for this stems from the service worker security model.

One of the central security considerations for service workers is ensuring malicous actors can't assign a service worker to your domain and wreak havoc. Google [experimented with cross-origin service workers](https://developers.google.com/web/updates/2016/09/foreign-fetch), but eventually abandoned the idea. At the end of the day, one of the surest means of indicating that you own an origin is to request an asset from it. Thus, if a webpage loads from `https://example.com`, and said webpage requests `https://example.com/sw.js`, a user can be virtually certain that service worker is blessed by the webpage's author. 

Not only do you need to load service worker scripts from your origin, but you also need to do so via HTTPS. Given the incredible damage a malicious service worker could do to a webpage, the authors of the service workers spec made it a requirement that all service worker be resilient to man-in-the-middle attacks.

Upon registration, a service worker will attempt to _install_ itself. This persists your service worker and also gives you an opportunity to do some housekeeping, such as precaching assets. Here is an example of a basic service worker that simply writes to the console upon successful installation:

<pre><code>// sw.js

self.addEventListener('install', event => {

  // waitUntil allows you to perform actions after the installation has completed.
  event.waitUntil(() => console.info('Installed!'))
})
</code></pre>

## Activating A Service Worker

Upon successful installation your service worker will then _activate_. This means that it is now ready to listen to events beyond its own lifecycle and react, such as `fetch`, `push`, etc... . However, there is a caveat. Service workers don't immediately "claim" the sessions that load them, meaning that until your user refreshes the page your service worker will be inactive.

The reason for this is consistency, given that you might otherwise end up with half of your webpage's assets cached and half uncached if a service worker were to come alive partway through your webpage's initialization. If you don't need this safeguard, you can call `clients.claim` and force your service worker to begin receiving events:

<pre><code>// sw.js

self.addEventListener('activate', event => {
  clients.claim() // Forces the recently loaded service worker to take over
})
</code></pre>

## Updating Your Service Worker

Given that service workers live outside the traditional DOM lifecycle, how can you ensure that your service worker receives updates that it might need? 

Out of the gate, you're given two guarantees by the service worker spec that should put your mind at ease. Firstly, service worker scripts are automatically fetched with [`no-cache`](https://w3c.github.io/ServiceWorker/#importscripts) by default, meaning that you won't run the risk of broken scripts getting cached unless you explicitely enable caching for them.

Secondly, service worker scripts are automatically refreshed [after twenty-four hours](https://www.w3.org/TR/service-workers/#handle-functional-event-algorithm) irregardless of whether you call `register` again or not. This ensures that, if for some reason you fail to author proper update logic for your service worker, your users will still see an update after twenty-four hours.

Now, it is crucial to understand that service workers are only updated if the hash of the incoming script is different than the currently installed script. If they are the same, the update will be aborted. 

## Going Offline

Chances are, even before you stumbled across this post you had heard something about service workers in connection with their ability to make websites offline-capable. While it's true that the service worker specification plays heavily into this, given that it was a reaction to the awkwardness of ApplicationCache, it's remain important to realize that service workers _aren't_ exclusively designed to provide offline capabilities.

The truth is that service workers make web apps offline-capable by firstly allowing them to intercept network requests and secondly by providing a cache for said requests that service workers can leverage. The former falls squarely within the server worker scope of responsibility, the latter (though it appears in the service worker spec) stands apart and can be used by any sort of script, be it a service worker or not. 

Here's an example of a service worker that caches the root of a site, but only uses the cached response when it detects the user is offline:

<pre><code>const CACHE_NAME = 'my_test_cache'
const URLS_TO_CACHE = [
  '/'
]

self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(URLS_TO_CACHE) 
  }))
})

self.addEventListener('fetch', function (ev) {
  if (navigator.onLine) {
    return fetch(ev.request.clone()).then(function (response) {
      if (!response || response.status !== 200) {
        return response
      }

      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(ev.request, response.clone())
      })

      return response
    }).catch(function (err) {
      console.log(err)
    })
  } else {
    ev.respondWith(caches.match(ev.request).then(function (response) {
      if (response) {
        // A cached response has been found!
        return response
      } else {
        // We don't have a cached response, initiate a fetch...
        return fetch(event.request)
      }
    }))
  }
})</code></pre>

There are sublties regarding the cloning of request and response streams which can be ignored for the moment. What is important to note is the interaction of the service worker with the cache, via the `caches` global, and the interception of `fetch` events, which provides us with an opportunity to use cached responses if we detect a user has lost their data connection.

As a sidenote, the path from which your service worker was requested plays into which `fetch` requests it can intercept. Given that I originally registered my service worker from the url `/sw.js`, I am allowed to intercept any and all `fetch` events originating from the root path. However, had I requested my service worker from the path `/foo/sw.js`, it would only be able to intercept requests beneath `/foo`. This is one of the sharper edges to the service worker spec, and is a common reason why you may not see the `fetch` events you expect.

## The Future of Service Workers 

As mentioned, service workers currently most notable for their ability to support offline-first scenarios. But there are a couple additional features that merit discussion.

The first is push notifications. Push notifications are tough for web applications because they need to be handled irregardless of whether a user has the relevant website open or not. Service workers allow us to respond to push notification event in just such scenarios:

<pre><code>self.addEventListener('push', function (ev) {
  ev.waitUntil(
    self.registration.showNotification('My Title', {
      body: 'Hello world!'
    })
  );
})</code></pre>

Push notifications on the web are beginning to become more common, though I expect that as more and more applications become [Progressive Web Applications](https://developers.google.com/web/progressive-web-apps/) we will see this trend start to accelerate.

The second is [background synchronization](https://github.com/WICG/BackgroundSync). Imagine a subscription news application that wants to ensure users have access to all of the latest content irregardless of their connectivity. Such an application could use the sync API to proactively obtain content when connectivity is strong, thereby decreasing subsequent load times for the application and making it even more resilient to network failures. 

## Conclusion

Over the past decades we've watched the web evolve from a home for static content to a full-blown application layer. Service workers are a leap in that direction, and will give web apps functionality that their native peers have had for quite some time. 

Expect to see service workers become a foundational layer for future web technologies, and I hope this post has given you a reason to be excited about them. If you've spotted an error, be it factual or syntactical, let me know in the comments below!

## References & Resources

[HTML5Rocks & The History of the Offline Web](https://www.html5rocks.com/en/tutorials/offline/whats-offline/)  
[W3C Service Worker Spec](https://www.w3.org/TR/service-workers)  
[MDN Service Worker API Article](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)  
[Ponyfoo On the Service Worker Revolution](https://ponyfoo.com/articles/serviceworker-revolution)
