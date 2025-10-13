import { __ } from '@wordpress/i18n';
import { buildGoogleManageWorkspaceLink } from '../../utils/email-utils';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const manageGoogleWorkspaceAction: Action< Email > = {
	id: 'manage-google-workspace',
	label: __( 'Manage Google Workspace ↗' ),
	callback: ( items: Email[] ) => {
		const email = items[ 0 ];
		const url = buildGoogleManageWorkspaceLink( email.emailAddress, email.domainName );
		window.open( url, '_blank' );
	},
	isEligible: ( item: Email ) => item.type === 'mailbox' && item.provider === 'google_workspace',
};
