withGlobalEvents
================

`withGlobalEvents` is a higher-order component used to facilitate responding to global events, where one would otherwise use `window.addEventListener`.

On behalf of the consuming developer, the higher-order component manages:

- Unbinding when the component unmounts.
- Binding at most a single event handler for the entire application.

## Usage

Pass an object where keys correspond to the DOM event type, the value the name of the method on the original component's instance which handles the event.

```js
import { withGlobalEvents } from '@wordpress/components';

class ResizingComponent extends Component {
	handleResize() {
		// ...
	}

	render() {
		// ...
	}
}

export default withGlobalEvents( {
	resize: 'handleResize',
} )( ResizingComponent );
```
