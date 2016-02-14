Interpolate-Components
======================

Interpolate-Components allows us to work with structured markup as strings and then hydrate them into a tree of React components. This is particularly useful for internationalizing strings, where a sentence or paragraph containing structured markup should be translated as a single entity. This module allows us to _interpolate_ components into a string without using the hack of `dangerouslySetInnerHTML()`.

[![NPM](https://nodei.co/npm/interpolate-components.png)](https://nodei.co/npm/interpolate-components/)

## Module Footprint

Interpolate-Components takes a single options object as an argument and returns a React component containing structured descendent components which can be rendered into a document. The option attributes are:

- **mixedString** A string that contains component tokens to be interpolated
- **components** An object with components assigned to named attributes
- **throwErrors** (optional) Whether errors should be thrown (as in pre-production environments) or we should more gracefully return the un-interpolated original string (as in production). This is optional and is false by default.

## Component tokens

Component tokens are strings (containing letters, numbers, or underscores only) wrapped inside double-curly braces and have an opening, closing, and self-closing syntax, similar to html.

```js
// example component token syntax
var example = '{{link}}opening and closing syntax example{{/link}}',
    example2 = 'Here is a self-closing example: {{input/}}';
```

## Example Usage

```js
/** @jsx React.DOM */
import interpolateComponents from 'interpolate-components';
const children = interpolateComponents( {
        mixedString: 'This is a {{em}}fine{{/em}} example.',
        components: { em: <em /> }
    } );
const jsxExample = <p>{ children }</p>;
// when injected into the doc, will render as:
// <p>This is a <em>fine</em> example.</p>
```

## Testing
```sh
# install dependencies
npm install
# run tests
make test
```
