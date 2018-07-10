# @wordpress/element

Element is, quite simply, an abstraction layer atop [React](https://reactjs.org/).

You may find yourself asking, "Why an abstraction layer?". For a few reasons:

- In many applications, especially those extended by a rich plugin ecosystem as is the case with WordPress, it's wise to create interfaces to underlying third-party code. The thinking is that if ever a need arises to change or even replace the underlying implementation, it can be done without catastrophic rippling effects to dependent code, so long as the interface stays the same.
- It provides a mechanism to shield implementers by omitting features with uncertain futures (`createClass`, `PropTypes`).
- It helps avoid incompatibilities between versions by ensuring that every plugin operates on a single centralized version of the code.

On the `wp.element` global object, you will find the following, ordered roughly by the likelihood you'll encounter it in your code:

- [`createElement`](https://reactjs.org/docs/react-api.html#createelement)
- [`render`](https://reactjs.org/docs/react-dom.html#render)

## Installation

Install the module

```bash
npm install @wordpress/element --save
```

## Usage

Let's render a customized greeting into an empty element:

```html
<div id="greeting"></div>
<script>
function Greeting( props ) {
	return wp.element.createElement( 'span', null, 
		'Hello ' + props.toWhom + '!'
	);
}

wp.element.render(
	wp.element.createElement( Greeting, { toWhom: 'World' } ),
	document.getElementById( 'greeting' )
);
</script>
```

Refer to the [official React Quick Start guide](https://reactjs.org/docs/hello-world.html) for a more thorough walkthrough, in most cases substituting `React` and `ReactDOM` with `wp.element` in code examples.

## Why React?

At the risk of igniting debate surrounding any single "best" front-end framework, the choice to use any tool should be motivated specifically to serve the requirements of the system. In modeling the concept of a [block](../../blocks/README.md), we observe the following technical requirements:

- An understanding of a block in terms of its underlying values (in the [random image example](../../blocks/README.md#example), a category)
- A means to describe the UI of a block given these values

At its most basic, React provides a simple input / output mechanism. __Given a set of inputs ("props"), a developer describes the output to be shown on the page.__ This is most elegantly observed in its [function components](https://reactjs.org/docs/components-and-props.html#functional-and-class-components). React serves the role of reconciling the desired output with the current state of the page.

The offerings of any framework necessarily become more complex as these requirements increase; many front-end frameworks prescribe ideas around page routing, retrieving and updating data, and managing layout. React is not immune to this, but the introduced complexity is rarely caused by React itself, but instead managing an arrangement of supporting tools. By moving these concerns out of sight to the internals of the system (WordPress core code), we can minimize the responsibilities of plugin authors to a small, clear set of touch points.

## JSX

While not at all a requirement to use React, [JSX](https://reactjs.org/docs/introducing-jsx.html) is a recommended syntax extension to compose elements more expressively. Through a build process, JSX is converted back to the `createElement` syntax you see earlier in this document.

If you've configured [Babel](http://babeljs.io/) for your project, you can opt in to JSX syntax by specifying the `pragma` option of the [`transform-react-jsx` plugin](https://www.npmjs.com/package/babel-plugin-transform-react-jsx) in your [`.babelrc` configuration](http://babeljs.io/docs/usage/babelrc/).

```json
{
	"plugins": [
		[ "transform-react-jsx", {
			"pragma": "createElement"
		} ]
	]
}
```

This assumes that you will import the `createElement` function in any file where you use JSX. Alternatively, consider using the [`@wordpress/babel-plugin-import-jsx-pragma` Babel plugin](https://www.npmjs.com/package/@wordpress/babel-plugin-import-jsx-pragma) to automate the import of this function.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
