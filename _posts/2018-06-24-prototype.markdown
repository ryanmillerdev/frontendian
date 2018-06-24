---
layout: post
title:  "The Prototype"
date:   2018-06-17 08:00:00 -0700
dateString: "June 17th, 2018"
categories: ['technologies', 'javascript']
hero: /public/svg/prototype/beaker.svg
ogShareImage: /public/img/prototype_og_image.png
permalink: /prototype
comments: true
syntaxHighlighting: ['javascript']
excerpt: <p>Amongst JavaScript arcana, the prototype stands alone for its ability to baffle developers and invite misuse. With the introduction of classes in ECMAScript 6, you might be tempted to dismiss the JavaScript prototype once and for all–but as this post seeks to demonstrate, it is, and will remain, a fundamental aspect of the JavaScript language that you can ignore only at your own peril.</p>
---
Amongst JavaScript arcana, the `prototype` stands alone for its ability to baffle developers and invite misuse. With the introduction of classes in ECMAScript 6, you might be tempted to dismiss the JavaScript `prototype` once and for all–but as this post seeks to demonstrate, it is, and will remain, a fundamental aspect of the JavaScript language that you can ignore only at your own peril. 

What follows is intended to be a simple, unassuming introduction to both the JavaScript `prototype` and the prototypal inheritance it faciliates. Our survey will take us from an overview inheritance as a concept to an in-depth introduction to three different ways of leveraging prototypal inheritance in your code, with a short postscript on the continued relevance of the `prototype`.

<figure>
  <img src="/public/svg/prototype/dna.svg" width="100%" style="max-width: 10rem"/>
</figure>

## Understanding Inheritance

One of the primary means by which object-oriented languages help developers reuse code is via _inheritance_. Inheritence allows you to specify how certain properties and methods ought to be shared across objects, and has become a staple feature in many languages, including JavaScript.

The most common inheritance pattern is _classical inheritance_, and it involves the creation of _classes_, which serve as schematics for objects. Objects are created by _instantiating_ a given class, and classes can extend a _superclass_, or be extended by a _subclass_, permitting the resuse of a class's properties and methods. The result is a taxonomy of objects, each possessing a superclass and potentially subclasses. Below is an example of classical inheritance in ECMAScript 6:

<pre><code>class Dog {
  woof() {
    console.log('Woof!')
  }
}

class Collie extends Dog {}

const lassie = new Collie()
lassie.woof() // => 'Woof!'</code></pre>

JavaScript breaks from pack in its usage of _prototypal inheritance_. One way to understand prototypal inheritance is that it is simply inheritance without classes. Objects inherit from living, breathing objects, not schematics. This allows for a dynamic taxonomy of objects, which you might say pairs appropriately with another notorious JavaScript feature, dynamic typing. Below you'll find the same example given above, save it now uses prototypal inheritance:

<pre><code>const Dog = function () {}

Dog.prototype.woof = function () {
  console.log('Woof!')
}

const Collie = function () {}
Collie.prototype = Object.create(Dog.prototype)

const lassie = new Collie()

lassie.woof() // => "Woof!"</code></pre>

To better make sense of the above code, we'll first examine the `prototype` itself, then discuss how it facilitates inheritance in JavaScript.  

<figure>
  <img src="/public/svg/prototype/cell.svg" width="100%" style="max-width: 20rem"/>
</figure>

## Meet The Prototype

At its simplest, an object's `prototype` property is just another object reference. Every JavaScript object has a prototype, and since everything in JavaScript is an object (with the exception of `undefined` and `null`), the result is that you'll find prototypes everywhere.

You can access the prototype of any object in Javascript by simply calling `Object.getPrototypeOf` and passing the object as a parameter. For example:

<pre><code>Object.getPrototypeOf(Number)</code></pre>

When you attempt to access a property on an object, or call one of its methods, the JavaScript runtime will first check if the object itself possesses the property or method you desire. If it is unable to find either on the object itself, it will then turn to the object's prototype and look for the property or method there.

<pre><code>const fido = new Dog()

fido.name = 'Fido'

fido.name // => 'Fido', accessed a property of the object itself.
fido.woof() // => 'Woof!', accessed via the Dog prototype, which this object shares.
fido.valueOf() // => Dog { ... }, accessed by traversing the prototype chain to reach Object.prototype.</code></pre>

If the runtime is still not able to find what we're looking for, it's going to begin traversing the _prototype chain_. Remember how we said every object possesses a prototype in JavaScript? Well, prototypes have prototypes too! And so the same logic repeats itself on the prototype itself, i.e. JavaScript then turns to its prototype to try to find the property or method you're after.

There is one object in JavaScript that lacks a prototype, and that's `Object.prototype`, the progenitor of all objects you interact with.

<pre><code>Object.getPrototypeOf(Object) // => Object.prototype
Object.getPrototypeOf(Object.prototype) // => null</code></pre>

It is the single exception to the "every object has a prototype" rule just mentioned. 

To summarize, the `prototype` is an object that another object can reference, via an internal `prototype` property, to expand the properties and methods available to it and its callers. In nearly all cases, these same prototype objects will possess prototype objects of their own, creating what is termed the _prototype chain_. Objects need have no prior special relationship with another object before deciding to use it as its prototype. 

<figure>
  <img src="/public/svg/prototype/sprout.svg" width="100%" style="max-width: 15rem"/>
</figure>

## Using Prototypal Inheritance

Now that we've taken a brief survey on what exactly a prototype is, let's observe prototypal inheritance in action.

One of the reasons the `prototype`, and prototypal inheritance, leave developers feeling anxious is that JavaScript offers a few different ways to facilitate prototypal inheritance without providing much guidance. You've likely become accustomed to seeing JavaScript object instantiated via the `new` keyword, but it is in fact one of the most controversial means of creating new objects. 

Outlined below are three different means by which you can manipulate the `prototype` and, in so doing, leverage the reuse mechanism that prototypal inheritance provides.

### Object.create

The simplest way to create an object that shares a prototype with another object is via `Object.create`:

<pre><code>const Person = Object.create({
  sayHi: function () { console.log('Hi!') }
})

const Mary = Object.create(Object.getPrototypeOf(Person))

Brunhilda.sayHi() => "Hi!"</code></pre>

`Object.create` takes a two parameters: the first of which is the desired prototype for your newly created object. You may also pass `null` and create an object with no prototype at all! The second parameter is an object defining the properties you wish for object to possess, and is neatly described in this [article](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Parameters){:target="_blank"}.

### Object.setPrototypeOf

We mentioned above that JavaScript's inheritance mechanism is highly dynamic, and we can demonstrate that here via `Object.setPrototypeOf`. Be advised, using `Object.setPrototypeOf` is something that be done with great care, and you should likely take gander through the [warnings on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf). An example of the method's usage:

<pre><code>const Creature = Object.create({
  yowl: function () { console.log('Yowl!' )}
})

Creature.yowl() // => "Yowl!"

Object.setPrototypeOf(Creature, null)

Creature.yowl() // => Error: Creature.yowl is not a function
</code></pre>

Changes made to a prototype object will affect every object that shares said prototype. Note that substituting a new object for a particular prototype will _not_ result in other objects also sharing the new prototype. It will only affect the object which was the target of the replacement.

### Constructors and `new`

While you may be most familiar with using the `new` keyword to instantiate object in JavaScript, it's nevertheless a controversial practice. [Aadit Shah](http://aaditmshah.github.io/why-prototypal-inheritance-matters/#toc_1){:target="_blank"} has an excellent explanation, and provides the following quote from [Douglas Crockford's own article on the prototype](http://crockford.com/javascript/prototypal.html){:target="_blank"}:

> [The `new` prototype] was intended to make the language seem more familiar to classically trained programmers, but failed to do that, as we can see from the very low opinion Java programmers have of JavaScript. JavaScript's constructor pattern did not appeal to the classical crowd. It also obscured JavaScript's true prototypal nature. As a result, there are very few programmers who know how to use the language effectively.

Constructors hail from the land of classical inheritance. They describe how a class would like to handle instantiating objects, and it's a rather awkward transplant into the world of prototypal inheritance. which eschews the idea of formalizing when and how objects should be created. Such things are largely left to the preference of the developer, but the `new` keyword still gives cause for hesitation.

Nevertheless, a familiarity with the `new` keyword is important. When placed directly prior to a function call, the following things occur:

- A fresh object is created.
- The object is given the same prototype as the instantiating function.
- The instantiating function is called as a constructor, with any passed parameters. Additionally, the function's `this` context is bound to the new object.
- The new object is returned from the constructor, with any modifications made by the constructor.

A code sample is in order:

<pre><code>
const Telephone = function (phoneNumber) {
  this.phoneNumber = phoneNumber
}

Telephone.prototype.sendMessage = function (address, message) {
  return `Sending message "${message}" from ${this.phoneNumber} to ${address}!`
}

const myPhone = new Telephone('1234567890')
myPhone.phoneNumber // => "1234567890"
myPhone.sendMessage('Ryan') // => "Sending message "Hello" from 1234567890 to Ryan!"
</code></pre>

As you can see, we use the `Telephone` function itself to initialize the `phoneNumber` property on our new `myPhone` object. This is what is meant when we say the function is used as a _constructor_. 

<figure>
  <img src="/public/svg/prototype/tree.svg" width="100%" style="max-width: 15rem"/>
</figure>

## Closing Thoughts

JavaScript's implementation of prototypal inheritance, while perhaps a tad awkward, has given the language a great deal of flexibility. And it has been this exact malleability that has allowed JavaScript to adapt its myriad use cases. If you're interested in continuing your own deep dive into the JavaScript prototype, a study of the language [Self](http://www.selflanguage.org/){:target="_blank"} is highly recommended, which was original inspiration to Brendan Eich when JavaScript was created. Also, if you've spotted an error in this post, be it factual or syntactical, let me know in the comments below! 

<figure>
  <img src="/public/svg/prototype/bust.svg" width="100%" style="max-width: 20rem"/>
</figure>

## Afterword: Why Not Classical Inheritance?

You might still be wondering what the relevance of all this is when JavaScript now offers a perfectly good [implementation of classical inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes){:target="_blank"}. After all, though the `prototype` will continue to exist in the JavaScript language, this post still didn't give a good reason _why_ not to keep just using classes regardless.

 This post wasn't written to propound the merits of prototypal inheritance over classical inheritance–Eric Elliott [has done a fine job of that](https://youtu.be/lKCCZTUx0sI){:target="_blank"}–but it must be stressed that the latter is built atop the former. 
 
 When you uses classes in JavaScript, you _are not_ sidestepping prototypal inheritance. You are simply using more familiar keywords to interact with the prototype, which is a testament to the adaptability of prototypal inheritance. To show how JavaScript classes end up using the prototype, let's reuse an example from the beginning of this post:

<pre><code>class Dog {
  woof() {
    console.log('Woof!')
  }
}

class Collie extends Dog {}

const lassie = new Collie()
lassie.woof() // => 'Woof!'

Object.getPrototypeOf(lassie).woof() // => 'Woof!'</code></pre>

Every aspect of the ECMASCript class specification is reducible to usage of the `prototype` in one way or another, including `static` methods and `super` calls. You can learn more about how prototypal inheritance and classes are related in the [EMCAScript specification](https://www.ecma-international.org/ecma-262/8.0/index.html#sec-ecmascript-language-functions-and-classes){:target="_blank"}.

## Resources & References

[MDN Documentation on `Object.prototype`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype){:target="_blank"}

[MDN Documentation on the `new` Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new){:target="_blank"}

[Douglas Crockford On the Prototype](http://crockford.com/javascript/prototypal.html){:target="_blank"}

[Eric Elliott On Prototypcal vs. Classical Inheritance](https://medium.com/javascript-scene/master-the-javascript-interview-what-s-the-difference-between-class-prototypal-inheritance-e4cd0a7562e9){:target="_blank"}