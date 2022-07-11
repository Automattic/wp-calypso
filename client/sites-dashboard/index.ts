import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesDashboard } from './controller';

export default function () {
	if ( ! isEnabled( 'build/sites-dashboard' ) ) {
		page( '/sites-dashboard', '/sites' );
		return;
	}

	page( '/sites-dashboard/:launchStatus?', sitesDashboard, makeLayout, clientRender );
}
