SingleChildCSSTransitionGroup
=============================

This component is basically a fork of React's original [`ReactCSSTransitionGroup`](https://facebook.github.io/react/docs/animation.html#high-level-api-reactcsstransitiongroup), adding some props that aren't part of `ReactCSSTransitionGroup` (at least as of React 0.13.3) to control its behavior in a more fine-grained fashion.

As `ReactCSSTransitionGroup` seems to support these props as of React 0.14, we hope to use that component and drop this one once we've upgrade Calypso to React 0.14.

### Props (in addition to `ReactCSSTransitionGroup`'s)

* `enterTimeout` (number) and `leaveTimeout` (number): timeouts (in milliseconds) for the `enter` and `leave` events, respectively.
* `onComponentDidLeave` (function): called when the `willLeave` callback is called (at the same time as `componentWillUnmount`).
