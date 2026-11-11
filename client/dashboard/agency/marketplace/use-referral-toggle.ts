import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIsApprovalGated } from '../approval-gate';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { MarketplaceType } from './use-marketplace-type';

/**
 * The state and handler shared by every “Refer to clients” toggle, so they cannot drift apart.
 * For an agency that is not approved, turning it on sets `isGateOpen`; render `ApprovalGate` from it.
 */
export function useReferralToggle() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

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
			nextChecked && isGated ? setIsGateOpen( true ) : onChange( nextChecked ),
		isGated,
		isGateOpen,
		closeGate: () => setIsGateOpen( false ),
	};
}
