ClientSideEffects
=================

This is a helper component meant to facilitate isomorphic routing. It accepts a
function as its child which it will call when the `componentDidMount` (hence
only on the client side). This allows to conditionally execute functions inside
a given section's `controller.js` only on the client side.

# Usage

```js
// In `my-sites/foo/controller.js`:
import analytics from 'analytics';

function recordPageView() {
  analytics.pageView.record( '/foo', 'Foo' );
};

export function mySection( context, next ) {
	return(
		<ReduxProvider store={ context.store }>
			<FooComponent { ...getFooProps( context ) } />
			<ClientSideEffects>
				{ recordPageView }
			</ClientSideEffects>
		</ReduxProvider>
  );
  next();
}
```
