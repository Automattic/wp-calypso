# Badge

Badge is a component used to render a short piece of information that
should stand out from the rest.

## Usage

```jsx
import Badge from 'calypso/components/badge';

function MyComponent() {
	return <Badge type="warning">Only 6MB left!</Badge>;
}
```

## Props

The following props are available to customize the Badge:

- `type`: `'warning'`, `'success'`, `'info'`, `'info-blue'`, `'error'`
