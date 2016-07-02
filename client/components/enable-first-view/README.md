Enable First View
=================

A higher order React component that provides support for showing an introductory overlay when a component is first viewed.

Wrap your component by calling `enableFirstView`.

### Basic Usage

```js
import enableFirstView from 'components/enable-first-view';

const MyComponent = React.createClass({});
const MyFirstView = React.createClass({});

const MyFirstViewableComponent = enableFirstView( MyComponent, MyFirstView );
```
