# ThreatItem

`<ThreatItem />` is a React component for rendering a button with an attached loading indicator.

## Usage

```jsx
import ThreatItem from 'client/landing/jetpack-cloud/components/threat-item';

export default function MyComponent() {
	return <ThreatItem threat={ threat } />;
}
```

## Props

The following props can be passed to the `<ThreatItem />` component:

### `threat`

An object with information about a threat found in the Scan process. It has the following properties:

```js
{
    id: 1,
    title: 'Infected core file: index.php',
    action: 'fixed',
    detectionDate: '23 September, 2019',
    actionDate: '29 September, 2019',
    description: {
    title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
    problem:
        'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
    fix:
        'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.',
    details: 'This threat was found in the file: /htdocs/index.php',
}
```
