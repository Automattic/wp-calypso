import { __ } from '@wordpress/i18n';
import { getAdminUrl, getSiteUrl } from './site-data';
import type { AnalyticsClient } from '../../../app/analytics';
import type { AgencySite } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

export function getAgencyActions(
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ]
): Action< AgencySite >[] {
	return [
		{
			id: 'site',
			label: __( 'Visit site ↗' ),
			callback: ( sites: AgencySite[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'site' } );
				if ( site ) {
					window.open( getSiteUrl( site ), '_blank' );
				}
			},
		},
		{
			id: 'admin',
			isPrimary: true,
			label: __( 'WP Admin ↗' ),
			callback: ( sites: AgencySite[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'admin' } );
				if ( site ) {
					window.open( getAdminUrl( site ), '_blank' );
				}
			},
		},
	];
}
