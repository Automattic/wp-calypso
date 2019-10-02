/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { createSite, main, redirectIfNotEnabled } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { hideMasterbar as hideMasterbarAction } from 'state/ui/actions';

function hideMasterbar( context: PageJS.Context, next ) {
	context.store.dispatch( hideMasterbarAction() );
	next();
}

export default function() {
	page( '/gutenboarding', redirectIfNotEnabled, hideMasterbar, main, makeLayout, clientRender );
	page(
		'/gutenboarding/onboard',
		redirectIfNotEnabled,
		hideMasterbar,
		createSite,
		makeLayout,
		clientRender
	);
}
