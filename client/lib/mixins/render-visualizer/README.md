Render Visualizer
============
A visual way to see what is (re)rendering and why.
Based on [react-render-visualizer](https://github.com/redsunsoft/react-render-visualizer).

Features
--------
- Shows when component is being mounted or updated by highlighting (red for mount, yellow for update)
- Shows render count for each component instance
- Shows individual render log for each component instance

Usage
-----
There are two ways of using this mixin:

1. Enable this per component by adding it to its `mixins`:
```js
var renderVisualizer = require("lib/mixins/render-visualizer");

app.TodoItem = React.createClass( {
    mixins: [ renderVisualizer ], 
```

2. Enable it globally using the `render-visualizer` feature.

Component will show up with a blue border box when being monitored.

