withInstanceId
==============

Some components need to generate a unique id for each instance. This could serve as suffixes to element ID's for example.
Wrapping a component with `withInstanceId` provides a unique `instanceId` to serve this purpose.

## Usage

```jsx
/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/components';

function MyCustomElement( { instanceId } ) {
	return (
		<div id={ `my-custom-element-${ instanceId }` }>
			content
		</div>
	);
}

export default withInstanceId( MyCustomElement );
```
