# Global Notice

These components are used to display global notices.
They allow you to use a component for your notice instead of calling the notices redux actions directly.

## How to use the container

```js
import { InfoNotice } from 'calypso/blocks/global-notice';

function render() {
	return (
		<div>
			{ this.state.processing && <InfoNotice text={ this.props.translate( 'Proccessing…' ) } /> }
		</div>
	);
}
```

## Props

- `text`: The text that will be displayed while the notice is visible
