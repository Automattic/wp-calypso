import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useApprovalGate } from '../approval-gate';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { MarketplaceType } from './use-marketplace-type';

/**
 * The state and handler shared by every “Refer to clients” toggle, so they cannot drift apart.
 * Render `gate` next to the toggle: for an agency that is not approved, turning it on opens it.
 */
export function useReferralToggle() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const approvalGate = useApprovalGate( 'referral' );

	const onChange = useCallback(
		( checked: boolean ) => {
			const nextType: MarketplaceType = checked ? 'referral' : 'regular';
			updateMarketplaceType( nextType );
			recordTracksEvent( 'calypso_a4a_marketplace_referral_toggle', {
				purchase_mode: nextType,
				term_pricing: termPricing,
			} );
		},
		[ updateMarketplaceType, recordTracksEvent, termPricing ]
	);

	return {
		checked: marketplaceType === 'referral',
		disabled: ! agency,
		// Turning it off stays open, so an agency in referral mode from a link can leave it.
		onChange: ( nextChecked: boolean ) =>
			nextChecked && approvalGate.isGated ? approvalGate.openGate() : onChange( nextChecked ),
		gate: approvalGate.gate,
	};
}
