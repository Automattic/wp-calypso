import { isEnabled } from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { chooseEmailSolutionRoute } from '../../../app/router/emails';
import { getTitanTierFromSlug, isHighestTitanTier } from '../../utils/titan-tiers';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

export const useUpgradeMailboxAction = (): Action< Email > => {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	return {
		id: 'upgrade-mailbox',
		label: __( 'Upgrade mailbox' ),
		callback: ( [ item ]: Email[] ) => {
			recordTracksEvent( 'calypso_dashboard_emails_action_click', {
				action_id: 'upgrade-mailbox',
			} );
			navigate( {
				to: chooseEmailSolutionRoute.fullPath,
				params: { domain: item.domainName },
				search: { intent: 'upgrade' },
			} );
		},
		isEligible: ( item: Email ) => {
			if ( ! isEnabled( 'emails/titan-tiers' ) ) {
				return false;
			}

			if (
				item.type !== 'mailbox' ||
				item.provider !== 'titan' ||
				[ 'no_subscription', 'suspended', 'pending_deletion' ].includes( item.status )
			) {
				return false;
			}

			const tier = getTitanTierFromSlug( item.productSlug );
			return !! tier && ! isHighestTitanTier( tier );
		},
	};
};
