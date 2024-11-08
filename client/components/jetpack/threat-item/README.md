# ThreatItem

`<ThreatItem />` is a React component for rendering a button with an attached loading indicator.

## Usage

```jsx
import ThreatItem from 'client/components/jetpack/threat-item';

export default function MyComponent() {
	return <ThreatItem threat={ threat } />;
}
```

## Props

The following props can be passed to the `<ThreatItem />` component:

### `threat`

An object with information about a threat found in the Scan process. Refer to the Threat type for more information.

### `onFixThreat`

Optional callback function that is called when a threat fix is triggered.

### `onIgnoreThreat`

Optional callback function that is called when a threat ignore is triggered.

### `onUnignoreThreat`

Optional callback function that is called when a threat unignore is triggered.

### `isFixing`

If the threat is being fixed.
