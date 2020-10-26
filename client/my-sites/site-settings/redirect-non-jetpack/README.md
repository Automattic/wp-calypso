# Redirect To

This component provides automatic (prior to rendering the site) redirection for sites with no access to a particular page.
Here, we consider Atomic sites to be Jetpack-like. Note: although Atomic sites are also Jetpack sites, they need to be treated as non-Jetpack sites in certain situations, example of which is access to the (dis)connection actions.

## Props passed to the HoC

### `WrappedComponent`

Component, which we want to render using this HoC. When not apt for rendering
due to lack of access rights (non-Jetpack or Atomic), the redirection will be handled using default or provided route (see below). For an example of
a component using this HoC see `ManageConnection` or `Disconnect Site` components in Site Settings.

### `redirectRoute` ( _optional_ )

Destination site route passed to the HoC. The default redirect fallback is `/settings/general/`.

`redirectRoute` can be custom created with a `siteSlug` of choice.
If absent, it uses current `siteSlug` (if loaded).

### How to use

The following code redirects to the `Plans` site for non-Jetpack and Atomic
sites:

```js
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';

export default flowRight( localize, redirectNonJetpack( '/plans/' ) )( WrappedComponent );
```

For default behavior call `redirectNonJetpack()` with no parameters.

## Props received from the HoC

### `redirect`

Optionally, we can invoke the same behavior inside the component
to be wrapped using the HoC. Namely, we can use the redirection action inside the component we pass to the HoC (see below).

### Exemplary use

```js
function render() {
	const { redirect, translate } = this.props;

	<HeaderCake onClick={ redirect }>{ translate( 'Manage Connection' ) }</HeaderCake>;
}
```
