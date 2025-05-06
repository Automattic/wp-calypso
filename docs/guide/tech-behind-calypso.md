# The Technology Behind Calypso

Understanding the technologies and abstractions on which Calypso is built can make for a much better learning and building experience. Even if you are a student of the “learning by doing” school, we would still encourage you spend some time with the resources in this document.

## Based on React

Calypso is composed of multiple applications that are all built using React. [React](http://facebook.github.io/react/) is a library by Facebook that implements a virtual DOM. Instead of carefully changing the DOM, we can just re-render whole components when the data changes. React radically simplified our code and allowed for an awesome composition of reusable components.

- [Official documentation](https://react.dev/learn)

## Important libraries used in Calypso

As Calypso evolved over time, we tried several approaches to both routing and data layers on top of React. These are some of the libraries commonly used in Calypso:

- [Redux](http://redux.js.org/) – a predictable state container for JavaScript apps. Perfect fit for complex centralized state management. It powers the data layer of most of the calypso sections, but in new calypso applications, we're moving towards lighter approaches.
- [TanStack Query](https://tanstack.com/query) – a powerful data-fetching library for React. It provides a simple API for fetching, caching, and synchronizing server state in your React applications. It is used as the main data layer of new Calypso sections (like the hosting dashboard) but is also commonly used in other parts of Calypso.
- [TanStack Router](https://tanstack.com/router) – a powerful routing library for React. It provides a simple API for managing routes and navigation in your React applications. It is used as the main routing layer of new Calypso sections (like the hosting dashboard).

For more Calypso-specific details, see the [Our Approach to Data](../our-approach-to-data.md) document

## Git

Calypso is developed on Github, and we use Git extensively. Git is extremely powerful, and understanding how it works and controlling it are an important part of our daily workflow.

Essential Git resources:

- The [Pro Git](http://git-scm.com/book/en/v2) book is online and free. It's a great resource, both for beginners and for intermediate users (few dare to call themselves advanced).
- [git ready](http://gitready.com) – byte-sized tips
- Several shorter articles with tips:
  - [A few git tips you didn't know about](http://mislav.uniqpath.com/2010/07/git-tips/)
  - [25 Tips for Intermediate Git Users](https://www.andyjeffries.co.uk/25-tips-for-intermediate-git-users/)
  - [Stupid Git Tricks](http://webchick.net/stupid-git-tricks)
  - [9 Awesome Git Tricks](http://www.tychoish.com/posts/9-awesome-git-tricks/)
- Some operations are easier using a GUI. [GitX](http://rowanj.github.io/gitx/) is a simple one for OS X. [Fugitive](https://github.com/tpope/vim-fugitive) is a must for `vim`. The GitHub app doesn’t entirely fit our workflow, but you can use it for pulling and committing. One caveat is that you will have to do all rebasing manually.

Key concepts checklist:

- How is Git different from Subversion?
- How does branching work? Why are branches cheap?
- What is rebasing? How is it different from merging?
- What happens when we run `git pull`?
- What’s a remote? What happens when we push to it?
- Which parts of the repository are kept locally and which remotely?
- What’s the staging area? Why is this extra step useful?
- What is squashing? How can we edit and reorder commits before pushing/merging?

The way we use Git with Calypso is described in the [Git Workflow document](../git-workflow.md).

## Other technologies used in Calypso, worth checking out

- [page.js](http://visionmedia.github.io/page.js/) – router used in most sections of Calypso. New sections are using other libraries like TanStack Router.
- [express.js](http://expressjs.com) – light server-side framework we use to serve the initial page
- [webpack](http://webpack.github.io) – building a JavaScript bundle of all of our modules and making sure loading them works just fine
- [Babel](https://babeljs.io) – for transpiling ES2015+ and JSX

## Other technologies used in Calypso that are now deprecated

- [lodash](https://lodash.com) – general purpose utility library; includes a ton of useful functions for dealing with arrays, objects, and collections; deprecated because of its lack of modularity and tendency to introduce code smells by implicitly converting different value types and handling nullish (`null` or `undefined`) values.

Previous: [Hello, World!](hello-world.md) Next: [Information Architecture](information-architecture.md)
