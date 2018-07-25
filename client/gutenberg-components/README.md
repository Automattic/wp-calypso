Gutenberg Components
====

These are components maintained by [Gutenberg](https://wordpress.org/gutenberg/), the new publish
experience for WordPress. They are generic WordPress components to be used for creating common UI
elements shared between screens and features of the WordPress dashboard.

These components can be accessed by importing from the 
[`@wordpress/components`](https://www.npmjs.com/package/@wordpress/components) package, which is 
available in Calypso.

```jsx
/**
 * External dependencies
 */
import { Button } from '@wordpress/components';

export default function MyButton() {
	return <Button>Click Me!</Button>;
}
```

Some of these components can be seen in action in our 
[DevDocs: Gutenberg Components](/devdocs/gutenberg-components) section.
