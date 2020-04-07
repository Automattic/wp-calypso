# ThreatDescription

`<ThreatDescription />` is a React component for rendering the description of a Scan threat.

## Usage

```jsx
import ThreatDescription from 'client/landing/jetpack-cloud/components/threat-description';

export default function MyComponent() {
	return (
		<ThreatDescription action="ignored" details="..." fix="..." problem="...">
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

### `details`

The string, HTML element, or component to display in the details section of the description.

### `fix`

The string, HTML element, or component to display in the fix section of the description.

### `problem`

The string, HTML element, or component to display in the problem section of the description.
