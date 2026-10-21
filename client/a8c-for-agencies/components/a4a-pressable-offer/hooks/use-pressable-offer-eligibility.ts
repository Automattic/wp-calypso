import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

// The introductory offer targets agencies without a Pressable plan through
// A4A; the expansion offer targets agencies with one. Expansion eligibility is
// only final after the license check in useIsEligibleForExpansionOffer.
export default function usePressableOfferEligibility() {
	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const isBillingDragonAgency = agency?.billing_system === 'billingdragon';

	return {
		isEligibleForIntroductoryOffer: isBillingDragonAgency && pressableOwnership !== 'agency',
		mayBeEligibleForExpansionOffer: isBillingDragonAgency && pressableOwnership === 'agency',
	};
}
