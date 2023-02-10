# scroll-to-anchor

A utility module to smoothly scroll to a URL anchor position.

## Usage

```js
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

class MyComponent extends Component {
	componentDidMount() {
		setTimeout( () => scrollToAnchor( { offset: 15 } ) );
	}
}
```
