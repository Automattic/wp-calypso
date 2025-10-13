import { __ } from '@wordpress/i18n';
import { buildGoogleFinishSetupLink } from '../../utils/email-utils';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const finishSetupAction: Action< Email > = {
	id: 'finish-setup',
	label: __( 'Finish setup ↗' ),
	callback: ( [ item ]: Email[] ) => {
		if ( item && item.status === 'google_pending_tos_acceptance' ) {
			const url = buildGoogleFinishSetupLink( item.emailAddress, item.domainName );
			window.open( url, '_blank' );
		}
	},
	isEligible: ( item: Email ) => item.status === 'google_pending_tos_acceptance',
};
