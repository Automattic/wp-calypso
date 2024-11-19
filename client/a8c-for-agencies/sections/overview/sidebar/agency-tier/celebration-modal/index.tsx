import { useEffect } from 'react';
import { AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY } from 'calypso/a8c-for-agencies/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import AgencyTierCelebrationModalContent from './celebration-modal-content';
import AgencyTierFeatureAnnouncement from './feature-announcement';
import type { AgencyTierInfo } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

import './style.scss';

const PREFERENCE_NAME = 'a4a-agency-tier-celebration-modal-dismissed-type';

export default function AgencyTierCelebrationModal( {
	agencyTierInfo,
	currentAgencyTier,
}: {
	agencyTierInfo?: AgencyTierInfo | null;
	currentAgencyTier?: string | null;
} ) {
	const dispatch = useDispatch();

	const celebrationModalShowForCurrentType = useSelector( ( state ) =>
		getPreference( state, PREFERENCE_NAME )
	);

	// Record the event when the modal is shown
	useEffect( () => {
		if (
			agencyTierInfo?.celebrationModal &&
			celebrationModalShowForCurrentType !== currentAgencyTier
		) {
			dispatch(
				recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_shown', {
					agency_tier: currentAgencyTier,
				} )
			);
		}
	}, [ agencyTierInfo, celebrationModalShowForCurrentType, currentAgencyTier, dispatch ] );

	const isAgencyFirstPurchase = sessionStorage.getItem( AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY );

	const handleSavePreference = () => {
		// Save the preference to prevent the modal from showing again
		dispatch( savePreference( PREFERENCE_NAME, currentAgencyTier ?? '' ) );
		sessionStorage.removeItem( AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY );
	};

	const handleOnClose = () => {
		handleSavePreference();
		dispatch(
			recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_dismiss', {
				agency_tier: currentAgencyTier,
			} )
		);
	};

	const handleClickExploreBenefits = () => {
		handleSavePreference();
		dispatch(
			recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_explore_benefits_click', {
				agency_tier: currentAgencyTier,
			} )
		);
	};

	if (
		! agencyTierInfo ||
		! agencyTierInfo.celebrationModal ||
		celebrationModalShowForCurrentType === currentAgencyTier ||
		// Don't show the modal if the user is already on the emerging-partner tier and it's not their first purchase
		( currentAgencyTier === 'emerging-partner' && ! isAgencyFirstPurchase )
	) {
		return <AgencyTierFeatureAnnouncement />;
	}

	return (
		<AgencyTierCelebrationModalContent
			celebrationModal={ agencyTierInfo.celebrationModal }
			currentAgencyTier={ currentAgencyTier }
			handleOnClose={ handleOnClose }
			handleClickExploreBenefits={ handleClickExploreBenefits }
		/>
	);
}
