import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import TitanControlPanelModal from '../../components/titan-control-panel-modal';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

const ACTION_ID = 'manage-titan-mailboxes';

export const useManageTitanMailboxesAction = (): Action< Email > => {
	return {
		id: ACTION_ID,
		label: __( 'Manage all mailboxes' ),
		modalHeader: __( 'Manage all mailboxes' ),
		// The modal lists the individual control panel destinations.
		callback: () => {},
		RenderModal: ( { items } ) => {
			const { recordTracksEvent } = useAnalytics();

			useEffect( () => {
				recordTracksEvent( 'calypso_dashboard_emails_action_click', { action_id: ACTION_ID } );
			}, [ recordTracksEvent ] );

			return <TitanControlPanelModal domainName={ items[ 0 ].domainName } />;
		},
		isEligible: ( item: Email ) =>
			item.type === 'mailbox' && item.provider === 'titan' && item.status !== 'no_subscription',
	};
};
