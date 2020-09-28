/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import { isUserLoggedIn } from 'state/current-user/selectors';
import { setSection } from 'state/ui/actions';
import { activateNextLayoutFocus } from 'state/ui/layout-focus/actions';

export function redirectLoggedIn( context, next ) {
	const userLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( userLoggedIn ) {
		page.redirect( '/' );
		return;
	}

	next();
}

export function render( context ) {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );

	// Activate the next section after it's been successfully loaded
	// `nextSectionToActivate` would be set in client/sections-middleware.js
	// The section "activation" is triggered when the new section is rendered
	// for the first time — this avoids glitchs were a sections styles would be
	// loaded before the section would be rendered in the browser.
	if ( context.nextSectionToActivate ) {
		context.store.dispatch( setSection( context.nextSectionToActivate ) );
		context.store.dispatch( activateNextLayoutFocus() );

		// Removing `nextSectionToActivate` makes sure that `setSection` won't
		// be dispatched until a new section gets activated.
		delete context.nextSectionToActivate;
	}
}

export function hydrate( context ) {
	ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
}
