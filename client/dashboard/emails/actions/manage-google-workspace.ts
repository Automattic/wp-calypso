import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { buildGoogleManageWorkspaceLink } from '../../utils/email-utils';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const useManageGoogleWorkspaceAction = (): Action< Email > => {
	const { recordTracksEvent } = useAnalytics();

	return {
		id: 'manage-google-workspace',
		label: __( 'Manage Google Workspace ↗' ),
		callback: ( items: Email[] ) => {
			recordTracksEvent( 'calypso_dashboard_emails_action_click', {
				action_id: 'manage-google-workspace',
			} );
			const email = items[ 0 ];
			const url = buildGoogleManageWorkspaceLink( email.emailAddress, email.domainName );
			window.open( url, '_blank' );
		},
		isEligible: ( item: Email ) => item.type === 'mailbox' && item.provider === 'google_workspace',
	};
};
