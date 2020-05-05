# ThreatDescription

`<ThreatDescription />` is a React component for rendering the description of a Scan threat.

## Usage

```jsx
import ThreatDescription from 'client/landing/jetpack-cloud/components/threat-description';

export default function MyComponent() {
	return (
		<ThreatDescription action="ignored" fix="..." problem="...">
			{ content }
		</ThreatDescription>
	);
}
```

## Props

The following props can be passed to the `<ThreatDescription />` component:

### `children | content`

It can be a string, null, HTML or component to show below everything else inside the description.

### `action`

A string that can take two values: 'fixed' or 'ignored'. If it's undefined, the component will render a different text for that case.

### `fix`

The string, HTML element, or component to display in the fix section of the description.

### `problem`

The string, HTML element, or component to display in the problem section of the description.

### `diff`

Diff represented as a string, HTML element, or component. Displayed in the technical details section of the description.

### `filename`

String representation of the name of the affected file. Displayed in the technical details section of the description.

### `context`

Object that contains the surrounding lines of the affected line. Displayed in the technical details section of the description.
