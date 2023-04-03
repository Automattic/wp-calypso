import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteLogs } from './controller';

export default function () {
	if ( ! isEnabled( 'woa-logging' ) ) {
		// Redirect to Customer Home if flag isn't enabled.
		page( '/site-logs/:siteId', ( { params: { siteId } } ) => {
			page.replace( `/home/${ siteId }` );
		} );
		return;
	}

	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-logs/:siteId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		siteLogs,
		makeLayout,
		clientRender
	);
}
