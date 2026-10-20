import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import TitanDnsRecords from '../../components/titan-dns-records';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

const ACTION_ID = 'view-titan-dns-records';

export const useViewTitanDnsRecordsAction = (): Action< Email > => {
	return {
		id: ACTION_ID,
		label: __( 'View DNS records' ),
		modalHeader: ( items ) =>
			sprintf(
				/* translators: %s is a domain name */
				__( 'DNS records for %s' ),
				items[ 0 ].domainName
			),
		modalSize: 'medium',
		callback: () => {},
		RenderModal: ( { items } ) => {
			const { recordTracksEvent } = useAnalytics();

			useEffect( () => {
				recordTracksEvent( 'calypso_dashboard_emails_action_click', { action_id: ACTION_ID } );
			}, [ recordTracksEvent ] );

			return <TitanDnsRecords domain={ items[ 0 ].domainName } />;
		},
		isEligible: ( item: Email ) =>
			item.type === 'mailbox' && item.provider === 'titan' && item.status !== 'no_subscription',
	};
};
