# Redirect To

This component provides automatic (prior to rendering the site) redirection for non-Jetpack sites.
Here, we consider Atomic sites to be Jetpack-like.

## Props passed to the component
### `WrappedComponent`

Component to wrap.

### `redirectUrl`

Destination url ( *optional* ). The default fallback url is `/settings/general`.

### How to use:

```js
import redirectNonJetpack from 'my-sites/site-settings/redirect-to/redirect-to';

export default flowRight(
	localize,
	redirectNonJetpack
)( WrappedComponent, redirectUrl );

```

## Props received from the component

### `redirectTo`

Optionally, we can invoke the same behavior inside the component
to be wrapped.

### How to use:

```js
render() {
	const {
		redirectTo,
		translate
	} = this.props;

	<HeaderCake onClick={ redirectTo }>
		{ translate( 'Manage Connection' ) }
	</HeaderCake>
}
```
