# Badge

Badge is a component used to render a short piece of information that
should stand out from the rest.

## Usage

```jsx
import React from 'react';
import Badge from 'calypso/components/badge';

class MyComponent extends React.Component {
	render() {
		return <Badge type="warning">Only 6MB left!</Badge>;
	}
}
```

## Props

The following props are available to customize the Badge:

- `type`: `'warning'`, `'success'`, `'info'`, `'info-blue'`, `'error'`
