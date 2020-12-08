# Library Middleware

With the deprecation of SitesList, our `client/lib` libraries no longer
have easy access to the current user site. Since libraries are not react
components there isn't an easy way to provide access to our global
redux store data.

When writing a library there are currently three ways around this:

## Update the library interface to pass through data needs

If we create a new library, or have a library with few usages, we can
update the function interface to pass through this data. Calling components
would then pass through that information.

For example a call like:
`library.doSomething()`

Would turn into:
`library.doSomething( currentSite )`

## Use Redux Middleware to perform the library side-effect

Similarly for a library with few usages, if we don't expect a return value from
calling a library function this can be abstracted into a dispatched redux action,
where the side effect is then called. The middleware handler has access to the
global store, so it would look something like:

The component dispatches a new action

```jsx
dispatch( { type: 'MY_EXAMPLE_LIBRARY_ACTION' } );
```

And in this middleware, we can create a handler:

```jsx
/* eslint-disable no-case-declarations */
import library from 'calypso/lib/example';

switch ( action ) {
	case MY_EXAMPLE_LIBRARY_ACTION:
		const state = getState();
		const selectedSite = getSelectedSite( state );
		library.doSomething( selectedSite );
		break;
}
```

## Use Redux Middleware to setSelectedSite

For libraries that are too large to port, or have too many usages,
we can try working around this by setting the selectedSite when
sites change (eg fetches complete or user sets another site).

First add a new setter function to the library, for example:

```jsx
library.setSelectedSite( selectedSite );
```

Then add a handler in this middleware:

```jsx
/* eslint-disable no-case-declarations */
import library from 'calypso/lib/example';

switch ( action ) {
	//All relevant site update events
	case SELECTED_SITE_SET:
	case SITE_RECEIVE:
	case SITES_RECEIVE:
		const state = getState();
		const selectedSite = getSelectedSite( state );
		library.setSelectedSite( selectedSite );
		break;
}
```
