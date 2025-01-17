import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { agencyDashboardContext, connectUrlContext } from './controller';

export default function (): void {
	page( '/dashboard/:filter(favorites)?', agencyDashboardContext, makeLayout, clientRender );

	if ( isEnabled( 'jetpack/url-only-connection' ) ) {
		page( '/dashboard/connect-url', connectUrlContext, makeLayout, clientRender );
	}
}
