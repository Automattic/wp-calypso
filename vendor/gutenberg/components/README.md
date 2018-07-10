Components
==========

This directory includes a library of generic React components to be used for creating common UI elements shared between screens and features of the WordPress dashboard.

## Usage

Within Gutenberg, these components can be accessed by importing from the `components` root directory:

```jsx
/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

export default function MyButton() {
	return <Button>Click Me!</Button>;
}
```
