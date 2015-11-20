Interpolate-Components
======================

The Interpolate-Components module takes an options object that includes:

### translation
A string that contains component tokens to be interpolated
### components
An object with components assigned to named attributes
### throwErrors
Whether errors should be thrown (as in pre-production environments) or we should more gracefully return the un-interpolated original string (as in production). This option is optional and is false by default.

The Interpolate-Components module takes these input options and returns a child object containing a mix of strings and components that can be injected into a React element. This allows us to mix markup and content in a string without having to inject that markup using `_dangerouslySetInnerHTML()`. This is particularly useful for i18n purposes.

Component tokens are strings (containing letters, numbers, or underscores only) wrapped inside double-curly braces and have an opening, closing, and self-closing syntax, similar to html.

```js
var example = '{{link}}opening and closing syntax example{{/link}}',
    example2 = 'Here is a self-closing example: {{input/}}';
```

Example usage:

```js
/** @jsx React.DOM */

var interpolateComponents = require( 'lib/interpolate-components' ),
    example = 'This is a {{em}}fine{{/em}} example.',
    components = {
        em: <em />
    },
    children = interpolateComponents( {
        translation: example,
        components; components
    } ),
    jsxExample = <p>{ children }</p>;

// will render as:
// <p>This is a <em>fine</em> example.</p>
```
