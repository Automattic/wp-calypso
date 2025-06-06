import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	SETTINGS_DATABASE,
	SETTINGS_PERFORMANCE,
	SETTINGS_SFTP_SSH,
} from 'calypso/sites/components/site-preview-pane/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function redirectToHostingDashboardBackportIfEnabled( feature: string | undefined ) {
	return ( context: PageJSContext, next: () => void ) => {
		const state = context.store.getState();
		const site = getSelectedSite( state );

		if ( isEnabled( 'dashboard/v2/backport/site-settings' ) ) {
			let route = '';
			switch ( feature ) {
				case SETTINGS_DATABASE:
					route = '/database';
					break;
				case SETTINGS_PERFORMANCE:
					route = '/caching';
					break;
				case SETTINGS_SFTP_SSH:
					route = '/sftp-ssh';
					break;
			}

			return page.redirect( `/sites/settings/v2/${ site?.slug }${ route }` );
		}

		next();
	};
}
