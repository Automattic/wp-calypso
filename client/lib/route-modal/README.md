# Route Modal

A simple utility to provide the control of opening and closing modal via query string.

## Usage

### useRouteModal

Provide the utils to control opening and closing modal via query string so that we can
also open/close the modal when the user clicks the back/forward button of the browser.

```js
import { Modal } from '@wordpress/components';
import { useRouteModal } from 'calypso/lib/route-modal';

const Example = () => {
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		/** The key of query string */
		'example',
		/** The default value (optional) */
		1
	);

	return (
		<>
			<button onClick={ openModal }>Click me</button>
			{ isModalOpen && <Modal onRequestClose={ closeModal } /> }
		</>
	);
};
```

### withRouteModal

Inject the `routeModalData` into the wrapped component so that it can use the utils from `useRouteModal` hook

```js
import { withRouteModal } from 'calypso/lib/route-modal';

const Example = ( {
	/** Injected by withRouteModal and provide the utils from useRouteModal */
	routeModalData,
} ) => {
	// ...
};

export default withRouteModal( 'example', 1 )( Example );
```
