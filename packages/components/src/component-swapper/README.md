# ComponentSwapper

`ComponentSwapper` is a react component that can be used to swap components at a specified breakpoint. For example a buttons navigation to a dropdown for samll screens.

## Properties

### `className { string }`

CSS class to be applied to a root div.

### `breakpoint { string } - default: '<660px'`

A breakpoint that trigger component replacement. Only breakopints from  `mediaQueryLists` from '@automattic/viewport' are accepted.

### `onSwap { function }`

A function that can be triggered when components are swapped. It uses `useEffect` hook so it's also triggered when the componnet loads.

### `breakpointActiveComponent { React component }`

React component rendered when the breakpoint condition is active.

### `breakpointInactiveComponent { React component }`

React component rendered when the breakpoint condition is inactive.

### `children`

The component acceprt children nodes and renders them after `breakpointActiveComponent|breakpointInactiveComponent`.

## Usage notes

Example usage:

```jsx
<ComponentSwapper
	breakpoint="<660px"
	breakpointActiveComponent={ <Button primary>Active breakpoint - primary button</Button> }
	breakpointInactiveComponent={ <Button>Inactive breakpoint - regular button</Button> }
>
	<div style={ { padding: '10px 0' } }> Example child node </div>
</ComponentSwapper>;
```
