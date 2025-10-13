import { __ } from '@wordpress/i18n';
import { buildTitanMailboxLink, buildGoogleMailboxLink } from '../../utils/email-utils';
import MailboxIcon from '../resources/mailbox-icon';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const viewMailboxAction: Action< Email > = {
	id: 'view-mailbox',
	label: __( 'View mailbox ↗' ),
	icon: <MailboxIcon className="mailbox--icon" />,
	isPrimary: true,
	callback: ( items: Email[] ) => {
		const item = items[ 0 ];
		if ( item.type === 'mailbox' && item.provider === 'titan' ) {
			const url = buildTitanMailboxLink( item.emailAddress );
			window.open( url, '_blank' );
		}

		if ( item.type === 'mailbox' && item.provider === 'google_workspace' ) {
			const url = buildGoogleMailboxLink( item.emailAddress, item.domainName );
			window.open( url, '_blank' );
		}
	},
	isEligible: ( item: Email ) => item.type === 'mailbox',
};
