import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sanitizeQueryParameters, sitesDashboard } from './controller';

export default function () {
	if ( ! isEnabled( 'build/sites-dashboard' ) ) {
		page( '/sites', '/home' );
		return;
	}

	page( '/sites', sanitizeQueryParameters, sitesDashboard, makeLayout, clientRender );
}
