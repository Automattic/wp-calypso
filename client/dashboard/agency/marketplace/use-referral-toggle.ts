import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { isAgencyApproved } from './is-agency-approved';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { MarketplaceType } from './use-marketplace-type';

/** The state and handler shared by every “Refer products” toggle, so they cannot drift apart. */
export function useReferralToggle() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();

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
		disabled: ! isAgencyApproved( agency ),
		onChange,
	};
}
