import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { buildGoogleFinishSetupLink } from '../../utils/email-utils';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const useFinishSetupAction = (): Action< Email > => {
	const { recordTracksEvent } = useAnalytics();

	return {
		id: 'finish-setup',
		label: __( 'Finish setup ↗' ),
		callback: ( [ item ]: Email[] ) => {
			recordTracksEvent( 'calypso_dashboard_emails_action_click', { action_id: 'finish-setup' } );
			if ( item && item.status === 'google_pending_tos_acceptance' ) {
				const url = buildGoogleFinishSetupLink( item.emailAddress, item.domainName );
				window.open( url, '_blank' );
			}
		},
		isEligible: ( item: Email ) => item.status === 'google_pending_tos_acceptance',
	};
};
