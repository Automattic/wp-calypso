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

	// Activate the next section after it's been successfully loaded.
	// (`context.nextSectionToActivate` is set in client/sections-middleware.js)
	// Section activation is triggered when the new section is rendered for the
	// first time; this avoids glitches caused by the section's styles loading
	// before the actual section's markup gets rendered..
	if ( context.nextSectionToActivate ) {
		context.store.dispatch( setSection( context.nextSectionToActivate ) );
		context.store.dispatch( activateNextLayoutFocus() );
	}
}

export function hydrate( context ) {
	ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
}
