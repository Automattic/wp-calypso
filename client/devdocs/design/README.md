Devdocs/Design
==============

### Component Example

Make a example component for each component is a very good idea if we think that it's useful. Let's talk about some rules by convention.

#### File and location

The file of the example component should reside into a `/docs` folder in the same folder where the component is defined and its name should be `example.jsx`. For instance for `<Popover />` component:

```
// component definition
- client/component/popover/index.jsx 

// example component
- client/component/popover/docs/example.jsx 
```

#### Component name convention

By convention the name of example component should ends with the `Example` word so for in the Popover case the name should be `PopoverExample`. The Devdocs-design component will take over to clean and show the right name in the web page.

If the example component is created using `React.createClass` then uses `displayName` to define its name:

```js
module.exports = React.createClass( {
	displayName: 'PopoverExample',

	// ...
} );
```

If you use ES6 `class` the name will be defined in function of the class name:

```es6
class PopoverExample extends PureComponent {
	// ...
}
```