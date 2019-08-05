---
author_name: "Ryan Miller"
author_twitter: andryanmiller
excerpt: "It's a common refrain amongst frontend developers: \"The web changes so quickly, I can barely keep pace!\" New frameworks come into vogue, tooling trends come and go, and browsers implement (and deprecate) scores of features, all in the span of weeks and months. It can feel like you're building on quicksand.\n"
hero: /svg/the-tectonics-of-the-web/hero.svg
language: en
og_image: /img/tectonics_og_image.png
published_at: 2018-06-10T15:00:00.754Z
slug: the-tectonics-of-the-web
title: "The Tectonics of the Web"
---
It's a common refrain amongst frontend developers: "The web changes so quickly, I can barely keep pace!" New frameworks come into vogue, tooling trends come and go, and browsers implement (and deprecate) scores of features, all in the span of weeks and months. It can feel like you're building on quicksand.

Yet when you look past the frothy surface, and observe how core web technologies such as HTTP, HTML, and ECMAScript progress, you find metered, well-orchestrated organizations surrounding each. These organizations are called _standards organizations_, and the aim of this post is to introduce you to three standards organizations that have an outsized impact on you as a frontend developer: the IETF, the W3C, and ECMA International. 

We'll discuss the value of standardization as a practice, then explore each organization, focusing on their history, which technologies they steward, and how they deliver standards that shape the web.

<figure>
  <img src="/svg/the-tectonics-of-the-web/stack.svg" width="100%" style="max-width: 20rem"/>
</figure>

### Why Standardization?

You interact with standardized products and processes on a daily basis. From power outlets to USB ports to the roads you drive on, there is an organization out there somewhere, at a national or international level, defining how that particular thing should be produced. This is typically done through the creation and dissemination of written documents called, unsurprisingly, _standards_.

Of all the standards organizations you might encounter, [ISO](https://www.iso.org/home.html) is by far the most widely-known. ISO, or the International Organization for Standardization, defines standards for a whole slew of industries. As a developer, you may already be (painfully) aware of one particular specification: [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html), which defines a universal formatting system for dates, and what you see when you call as the result of calling `new Date()` in JavaScript.

Standards advantage both businesses and consumers when executed well (though you [can read about](https://quod.lib.umich.edu/j/jep/3336451.0014.103?view=text;rgn=main) all the reasons they can also worsen things). Businesses can grow their respective industries collectively, and consumers can enjoy less frustration when attempting to use products and system created by different vendors.

The web, and the internet as a whole, are driven by protocols, and protocols depend upon rigorous definitions for their survival. Thus, standardization and the web have gone hand-in-hand from the very beginning. We'll turn our attention now to the first of our standards organizations, the IETF, and explain how the work that it did provided the foundation for the work that the W3C and ECMA would eventually contribute to the web.

<figure>
  <img src="/svg/the-tectonics-of-the-web/dots.svg" width="100%" style="max-width: 40rem"/>
</figure>

### The IETF

It bears repeating that though they often blend together, the terms _"web"_ (or "world wide web") and _"internet"_ are not synonymous. The former is predicated upon the latter, and the technologies that comprise the internet serve vastly more applications than those you access through your browser. So the organization responsible for defining and advancing internet standards is a fitting first stop in our tour of standards organizations. Its name is the Internet Engineering Task Force, or IETF.

The first IETF meeting was held [in 1986](https://www.ietf.org/about/participate/tao/), and it was the successor to a handful of loose groups that attempted to bring order to the inchoate internet, such as the [NWG](https://tools.ietf.org/html/rfc3) and [ICCB](https://www.ietf.org/rfc/rfc1160.txt). Its [unofficial motto](https://www.ietf.org/how/runningcode/), "We believe in rough consensus and running code", evinces the slightly nontraditional bent to the IETF. They invite anyone to attend their tri-yearly gatherings, unlike the other two organizations you'll meet, and they also discourage anyone to dress up at said gatherings.

Though the IETF accomplishes a great many things and generates some documents that aren't meant to become standards, you could define the product of the IETF as _standards-track RFCs_, or [STDs](https://www.rfc-editor.org/standards). Technologies such as TCP, IP, and HTTP are all defined by the IETF via RFCs, though many such protocols have multiple RFCs defining different aspects.

An RFC is advanced by a group of individuals called a _working group_, which is chartered within a specific IETF _area_, or subject domain. For example, within the IETF's [_Internet Area_](https://datatracker.ietf.org/wg/#int) you'll find working groups such as the [_Host Identity Protocol_](https://datatracker.ietf.org/wg/hip/about/) working group and the [_Dynamic Host Configuration_](https://datatracker.ietf.org/wg/dhc/documents/) working group.

As pertains to you as a frontend developer, the IETF's work affects in a similar way that tectonic plates affect cities. You don't notice the direction they're moving, but you're very likely to be moving in that direction too. Certain technologies, such as [HTTP/2](https://tools.ietf.org/html/rfc7540), do have a rapid and visible impact on how web applications are built.

There is a great deal about the IETF left undiscussed here, such as its inclusion in the Internet Society and its relationship to the Internet Engineering Steering Group. If you want to get the pulse of the IETF at any given time, their [Datatracker tool](https://datatracker.ietf.org/) is immensely useful, and provides tons of information about in-process RFCs and the latest working groups and areas. 

<figure>
  <img src="/svg/the-tectonics-of-the-web/sun.svg" width="100%" style="max-width: 40rem"/>
</figure>

### The W3C

Shortly after [CERN made Tim Berners-Lee's WorldWideWeb (_sic_) public domain in 1993](https://home.cern/topics/birth-web), the World Wide Web Consortium, or W3C, was formed to standardize how browser developers ought to go about implementing things like [HTML](https://www.w3.org/TR/html51/), the [DOM](https://www.w3.org/TR/REC-DOM-Level-1/), and more. At the time of writing, the W3C offers [nearly three-hundred standards](https://www.w3.org/TR/?status=rec), or _recommendations_, for use by companies like Google, Mozilla, and Microsoft as they develop and release their web browsers.

The W3C was founded just prior to what has been remembered as [the browser wars](https://www.w3.org/wiki/The_history_of_the_Web#The_browser_wars), and during that period Microsoft and Netscape battled to attract developers and users to their browsers, and did so by building out their own, idiosyncratic browser features. The result was that a webpage which functioned properly in Netscape might look completely broken in Internet Explorer, and vice-versa.

Even as the W3C began to produce recommendations in an attempt to guide the future of the web, Microsoft and Netscape continued to implement non-standard features in their browsers. In 1998, the [Web Standards Project](https://www.webstandards.org/){:target="_blank} was formed to advocate for the W3C's work and to encourage both developers and browser manufacturers to begin following standards. You might consider WaSP an unsung band of heroes, as the work they did led to many companies, such as Microsoft and Adobe, changing course and implementing the W3C's standards.

W3C membership is open to any organization, though depending on your company's revenues [it may get pricy](https://www.w3.org/Consortium/fees). Membership earns your organization a right to sit on the advisory committee, which reviews every _proposed recommendation_, as well as the opportunity to participate in working groups and W3C meetings.

Similar to the IETF, the W3C is organized into working groups, and the goal of many W3C working groups is to produce a _recommendation_. A recommendation starts as a working draft within a working group, then advances to _candidate recommendation_ if certain criteria are met. Once the W3C director thinks the draft is ready, it advances to the _proposed recommendation_ stage, during which every member of the W3C has a chance to review the proposal. If consensus is reached in favor, the document is then published as a full _recommendation_. You can review [the full process here](https://www.w3.org/2018/Process-20180201/#recs-and-notes).

Of the three organizations introduced in this post, the W3C has likely the most direct impact on you as a frontend developer. They steward nearly all core building blocks of the web, including CSS, CORS, and HTML. A good way to keep abreast of new recommendations is simply by following the [W3C's news blog](https://www.w3.org/blog/news/), and within the last half-decade the W3C has made available [a public discourse group], via its Web Platform Incubator Group, in order to solicit ideas from the developer community.

<figure>
  <img src="/svg/the-tectonics-of-the-web/wat.svg" width="100%" style="max-width: 40rem"/>
</figure>

### ECMA International

Yet if you were to page through the W3C's recommendations, you might notice some glaring absences. Where's JavaScript? Where's JSON? Well, it's an interesting story, and the telling of it will introduce our last standards organization of this post: ECMA International.

The day is November 15th, 1996. Nearly two years prior, an engineer at Netscape, Brendan Eich, had thrown together (in about ten days) a language tenatively called JavaScript. In the intervening time, JavaScript had exploded in popularity, and Microsoft's own implementation was beginning to become incompatible with Netscape, and gaining traction. So Netscape announces that it is transitioning the responsibility of standardizing JavaScript (formally called ECMAScript) to ECMA International. The W3C was originally offered this responsiblility, but declined, as described in [this Quora thread](https://www.quora.com/Why-was-JavaScript-standardized-by-ECMA-and-not-W3C) by [long-time W3C member Dan Connolly](https://www.w3.org/People/Connolly/).

ECMA International existed well before the internet achieved its ascendancy. Originally, ECMA stood for "European Computer Manufacturers Association", but in 1994 the name was changed to the heftier "Ecma International - European association for standardizing information and communication systems". ECMA is responsible for standardizing a number of technologies, including [C#](https://www.ecma-international.org/publications/the-tectonics-of-the-web/Ecma-334.htm) and our dearest [JSON](https://www.ecma-international.org/publications/the-tectonics-of-the-web/Ecma-404.htm).

Striking a balance between both the IETF and W3C's membership models, ECMA International is funded by membership dues from organizations but also allows individuals to join as [royalty-free task group members](https://tc39.github.io/agreements/contributor/). ECMA International allocates a _technical committee_ to oversee the advancement of a standard, and it is that committee which is responsible for intaking new contributions and publishing updated editions of the standard. The technical committee tasked with overseeing ECMAScript is [TC39](https://github.com/tc39).

By far an away, ECMA International's biggest impact on you as a frontend developer is via its stewardship of the ECMAScript language. You can learn more about how TC39 process [here](http://2ality.com/2015/11/tc39-process.html). Something to bear in mind is that, until rather recently, editions of ECMAScript were few and far between. We're now on the eighth edition of the standard, but between the third and fifth versions of the standards (the fourth was abandoned), a decade passed (1999-2009). Another six years passed between the fifth edition and sixth (2009-2015). 

<figure>
  <img src="/svg/the-tectonics-of-the-web/closing.svg" width="100%" style="max-width: 40rem"/>
</figure>

### Closing Thoughts

My hope in writing this is that you gain a high-level understanding of how these three standards organizations affect you as a frontend developer. Note that, taken within the whole context of the web's evolution, they're not the entire picture. Browser manufactureres, like Google and Mozilla, can and will continue to author features independent of any recommendation or standard, and developers will continue to push the envelope with frameworks and tools like jQuery, React, and CoffeeScript, which in turn have an affect on future web standards.

I find myself in awe of the massive, intricate apparatus that is the web, and am grateful for the hundreds of individuals at work behind the scenes ensuring that the web remains a healthy, vibrant platform. I'd also like to thank [Lera Efremova](https://creativemarket.com/lera_efremova) for her wonderful illustrations, and if you've spotted an error, be it factual or syntactical, let me know in the comments below!

### References & Resources

Here are few links and resources you might find useful as you explore the organizations dicussed above.

#### IETF

- [The History of the IETF and ISOC](https://www.internetsociety.org/internet/history-of-the-internet/ietf-internet-society/)
- [The IETF Process](https://www.ietf.org/the-tectonics-of-the-web/process/informal/ )
- [The Tao of the IETF](https://www.ietf.org/about/participate/tao/)
- [IETF Newcomers Overview](https://datatracker.ietf.org/meeting/101/materials/slides-101-edu-sessb-newcomers-overview-02)
- [Datatracker](https://datatracker.ietf.org/)

#### W3C

- [The History of the Web](https://www.w3.org/wiki/The_history_of_the_Web)
- [The W3C Process](https://www.w3.org/2018/Process-20180201/)
- [Dan Connolly On Why The W3C Doesn't Standardize JavaScript](https://www.quora.com/Why-was-JavaScript-standardized-by-ECMA-and-not-W3C)
- [Web Platform Incubator Group](https://www.w3.org/blog/2015/07/wicg/)
- [Three Challenges For The Web](https://webfoundation.org/2017/03/web-turns-28-letter/)

#### ECMA

- [The History of the ECMA](https://www.ecma-international.org/memento/history.htm)
- [Press Release Announcing Netscape's Submission of JavaScript to the ECMA](https://web.archive.org/web/19981203070212/http://cgi.netscape.com/newsref/pr/newsrelease289.html)
- [ECMA-262 Standard (8th Edition)](https://www.ecma-international.org/ecma-262/8.0/index.html)
- [Technical Committee 39 Github Organization](https://github.com/tc39) 
- [Great Blog Post On The TC39 Process](http://2ality.com/2015/11/tc39-process.html)

#### Wonderful Things

- [Move The Web Forward](https://movethewebforward.org/)
- [RICG](http://ricg.io/)
- [Where Wizards Stay Up Late: The Origins Of The Internet](https://amzn.to/2LzpGzM)
