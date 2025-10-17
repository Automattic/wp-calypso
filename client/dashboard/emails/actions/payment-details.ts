import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { purchasesRoute } from '../../app/router/me';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const usePaymentDetailsAction = (): Action< Email > => {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	return {
		id: 'payment-details',
		label: __( 'Manage billing and payments' ),
		callback: ( items: Email[] ) => {
			recordTracksEvent( 'calypso_dashboard_emails_action_click', {
				action_id: 'payment-details',
			} );
			const email = items[ 0 ];
			navigate( { to: purchasesRoute.to + `/${ email.subscriptionId }` } );
		},
		isEligible: ( item: Email ) => item.type === 'mailbox',
	};
};
