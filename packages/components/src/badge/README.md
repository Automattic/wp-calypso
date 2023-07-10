# Badge

Badge is a component used to render a short piece of information that
should stand out from the rest.

## Usage

```jsx
import { Badge } from '@automattic/components';

function MyComponent() {
	return <Badge type="warning">Only 6MB left!</Badge>;
}
```

## Props

The following props are available to customize the Badge:

- `type`: `'warning'`, `'success'`, `'info'`, `'info-blue'`, `'error'`
- `className`: additional class name to add to the badge
