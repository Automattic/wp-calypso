import { __ } from '@wordpress/i18n';
import { buildGoogleFinishSetupLink } from '../../utils/email-utils';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const finishSetupAction: Action< Email > = {
	id: 'finish-setup',
	label: __( 'Finish setup ↗' ),
	callback: ( items: Email[] ) => {
		const item = items[ 0 ];
		if ( item.status === 'google_pending_tos_acceptance' ) {
			const url = buildGoogleFinishSetupLink( item.emailAddress, item.domainName );
			window.open( url, '_blank' );
			return;
		}
	},
	isEligible: ( item: Email ) => item.status === 'google_pending_tos_acceptance',
};
