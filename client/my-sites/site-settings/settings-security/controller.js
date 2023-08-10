import page from 'page';
import { createElement } from 'react';
import SecurityMain from 'calypso/my-sites/site-settings/settings-security/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function security( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	// If we have a site ID, render the main component
	// Otherwise, redirect to site selection.
	if ( siteId ) {
		context.primary = createElement( SecurityMain );
		return next();
	}
	page.redirect( '/settings/security' );
	return;
}
