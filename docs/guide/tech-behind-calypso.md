# The Technology Behind Calypso

Understanding the technologies and abstractions on which Calypso is built can make for a much better learning and building experience. Even if you are a student of the “learning by doing” school, we would still encourage you spend some time with the resources in this document.

## No Big Famous Framework

Calypso is using neither Angular nor Ember; because we are building Calypso for the long haul, updating and improving a home-grown framework is a better long-term approach for us. Currently, we're using React and Flux/Redux; they're great, but knowing we have the control to use better technologies as they come along makes us feel more confident in our future. Calypso isn't a small startup project; we know it will need to scale and our technology will need to scale with it.

## Modern Modular JavaScript

Instead of a named framework, we decided to assemble our own out of small, focused JavaScript modules.

In the recent years, JavaScript went a long way from the language hidden behind jQuery selectors to the engine behind huge single-page applications and fast node.js async server-side daemons. ES6 is a confirmation the language is going in the right direction.

Here are few resources to get up to speed with “modern” JavaScript and ES6:

* [JavaScript Allongé, the "Six" Edition](https://leanpub.com/javascriptallongesix/read)
* [Exploring ES6](http://exploringjs.com/es6/)
* [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) – short presentation that sheds some light on how asynchronous operations are executed in JavaScript

Key concepts checklist:

* [Module pattern with CommonJS](http://darrenderidder.github.io/talks/ModulePatterns/) and [npm](https://docs.npmjs.com)
* Scope, context, and [function binding](http://dailyjs.com/2012/06/24/this-binding/)
* [Basic prototypes – creating new objects, inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
* Higher-level functions – [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
* Async primitives – [callbacks](https://docs.nodejitsu.com/articles/getting-started/control-flow/what-are-callbacks), [promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)

*Do you know any good videos and presentations on the subject? If yes, please send a pull request to add them here.*

## React

[React](http://facebook.github.io/react/) is a library by Facebook that implements a virtual DOM. Instead of carefully changing the DOM, we can just re-render whole components when the data changes. React radically simplified our code and allowed for an awesome composition of reusable components.

Here are some great React resources:

* [Official documentation](http://facebook.github.io/react/docs/getting-started.html)
* [React.js Introduction For People Who Know Just Enough jQuery To Get By](http://reactfordesigners.com/labs/reactjs-introduction-for-people-who-know-just-enough-jquery-to-get-by/)
* [Tutorial at Scotch.io](https://scotch.io/tutorials/learning-react-getting-started-and-concepts)
* [ReactJS For Stupid People](http://blog.andrewray.me/reactjs-for-stupid-people/)
* [Thinking in React](http://facebook.github.io/react/docs/thinking-in-react.html)
* [Official Tutorial](http://facebook.github.io/react/docs/tutorial.html)
* Presentation: [Rethinking Best Practices](https://www.youtube.com/watch?v=x7cQ3mrcKaY)
* Presentation: [Be Predictable, Not Correct](https://www.youtube.com/watch?v=h3KksH8gfcQ)
* Presentation: [Why does React Scale?](https://www.youtube.com/watch?v=D-ioDiacTm8)

Key concepts checklist:

* What is mounting of components?
* When are components rendered?
* What happens on render?
* [Differences between props and state](http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html)
* [Component lifecycle methods](http://facebook.github.io/react/docs/component-specs.html)
* [Mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins)
* [Why shouldn’t we touch the DOM the old way](http://facebook.github.io/react/docs/working-with-the-browser.html)

## Redux

All new code uses [Redux](http://redux.js.org/) to manage state in Calypso – making sure all components work with and react to the same data, living in a single place, instead of scattered between components’ state. Older code uses various [Flux](https://facebook.github.io/flux/) implementations or other data components.

Few, but solid Redux resources:

* [The official website](http://redux.js.org)
* Probably the best way to learn Redux is via the Egghead [Get Started with Redux](https://egghead.io/courses/getting-started-with-redux) video course
* When good with the basics, the [Building React Applications with Idiomatic Redux](https://egghead.io/courses/building-react-applications-with-idiomatic-redux) video course is also super useful (though we do few things differently in Calypso, like routing)
* The [Ecosystem](http://redux.js.org/docs/introduction/Ecosystem.html) page on the official site has a lot of links to tutorials and examples
* For more Calypso-specific details, see the [Our Approach to Data](../our-approach-to-data.md) document

## Git

Calypso is developed on Github, and we use Git extensively. Git is extremely powerful, and understanding how it works and controlling it are an important part of our daily workflow.

Essential Git resources:

* The [Pro Git](http://git-scm.com/book/en/v2) book is online and free. It's a great resource, both for beginners and for intermediate users (few dare to call themselves advanced).
* [git ready](http://gitready.com) – byte-sized tips
* Several shorter articles with tips:
	- [A few git tips you didn't know about](http://mislav.uniqpath.com/2010/07/git-tips/)
	- [25 Tips for Intermediate Git Users](https://www.andyjeffries.co.uk/25-tips-for-intermediate-git-users/)
	- [Stupid Git Tricks](http://webchick.net/stupid-git-tricks)
	- [9 Awesome Git Tricks](http://www.tychoish.com/posts/9-awesome-git-tricks/)
* Some operations are easier using a GUI. [GitX](http://rowanj.github.io/gitx/) is a simple one for OS X. [Fugitive](https://github.com/tpope/vim-fugitive) is a must for `vim`. The GitHub app doesn’t entirely fit our workflow, but you can use it for pulling and committing. One caveat is that you will have to do all rebasing manually.

Key concepts checklist:

* How is Git different from Subversion?
* How does branching work? Why are branches cheap?
* What is rebasing? How is it different from merging?
* What happens when we run `git pull`?
* What’s a remote? What happens when we push to it?
* Which parts of the repository are kept locally and which remotely?
* What’s the staging area? Why is this extra step useful?
* What is squashing? How can we edit and reorder commits before pushing/merging?

The way we use Git with Calypso is described in the [Git Workflow document](../git-workflow.md).

## Other technologies used in Calypso, worth checking out:

* [page.js](http://visionmedia.github.io/page.js/) – router
* [express.js](http://expressjs.com) – light server-side framework we use to serve the initial page
* [lodash](https://lodash.com) – general purpose utility library; includes a ton of useful functions for dealing with arrays, objects, and collections
* [webpack](http://webpack.github.io) – building a JavaScript bundle of all of our modules and making sure loading them works just fine
* [make](http://www.gnu.org/software/make/manual/make.html) – our build tool of choice

Previous: [Hello, World!](hello-world.md) Next: [Contributing to Calypso](../../.github/CONTRIBUTING.md)
