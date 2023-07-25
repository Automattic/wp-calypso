import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteMetrics } from './controller';

export default function () {
	if ( ! isEnabled( 'yolo/hosting-metrics-i1' ) ) {
		// Redirect to Customer Home if flag isn't enabled.
		page( '/site-metrics/:siteId', ( { params: { siteId } } ) => {
			page.replace( `/home/${ siteId }` );
		} );
		return;
	}

	page( '/site-metrics', siteSelection, sites, makeLayout, clientRender );

	page( '/site-metrics/:siteId', siteSelection, navigation, siteMetrics, makeLayout, clientRender );
}
