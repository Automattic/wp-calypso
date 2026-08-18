import {
	activeAgencyQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useMarketplaceType } from './use-marketplace-type';
import useReferralsGuide from './use-referrals-guide';
import type { MarketplaceType } from './use-marketplace-type';

// Shared with the classic A4A marketplace so the guide only shows once across dashboards.
const GUIDE_SEEN_PREFERENCE = 'a4a-marketplace-referral-guide-seen' as const;

export default function ReferralToggle() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { openGuide, guideModal } = useReferralsGuide();

	const { data: guideSeen, isFetched } = useQuery( userPreferenceQuery( GUIDE_SEEN_PREFERENCE ) );
	const { mutate: saveGuideSeen } = useMutation( userPreferenceMutation( GUIDE_SEEN_PREFERENCE ) );

	// Old agencies didn't have approval_status set, so we need to account for that.
	const isAgencyApproved = agency?.approval_status === 'approved' || agency?.approval_status === '';

	useEffect( () => {
		if ( marketplaceType === 'referral' && isFetched && ! guideSeen ) {
			saveGuideSeen( true );
			openGuide();
		}
	}, [ marketplaceType, isFetched, guideSeen, saveGuideSeen, openGuide ] );

	const handleToggle = ( checked: boolean ) => {
		const nextType: MarketplaceType = checked ? 'referral' : 'regular';
		updateMarketplaceType( nextType );
		recordTracksEvent( 'calypso_a4a_marketplace_referral_toggle', {
			purchase_mode: nextType,
		} );
	};

	return (
		<>
			{ guideModal }
			<HStack spacing={ 1 } expanded={ false } alignment="center">
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ marketplaceType === 'referral' }
					disabled={ ! isAgencyApproved }
					label={ __( 'Refer products' ) }
					onChange={ handleToggle }
				/>
				<Button
					variant="tertiary"
					size="small"
					aria-label={ __( 'Learn more about product referral mode' ) }
					onClick={ openGuide }
				>
					<Icon icon={ info } size={ 16 } />
				</Button>
			</HStack>
		</>
	);
}
