import { useMemo } from 'react';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import {
	isPressableAddonProduct,
	isPressableHostingProduct,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { PRESSABLE_Q3_2026_OFFER_START_DATE } from '../constants';
import type { License } from 'calypso/state/partner-portal/types';

// The introductory offer applies automatically to plans purchased after its
// start date, so an agency whose earliest plan license was issued on or after
// that date has benefited from it (or is a new customer who bought outside the
// offer window). Returns null when no plan license is found.
export function hasBenefitedFromIntroductoryOffer(
	licenses: License[] | undefined
): boolean | null {
	const planLicenses =
		licenses?.filter(
			( license ) =>
				isPressableHostingProduct( license.licenseKey ) &&
				! isPressableAddonProduct( license.licenseKey ) &&
				! license.referral
		) ?? [];

	if ( ! planLicenses.length ) {
		return null;
	}

	const earliestLicense = planLicenses.reduce( ( earliest, license ) =>
		license.issuedAt < earliest.issuedAt ? license : earliest
	);

	return earliestLicense.issuedAt.slice( 0, 10 ) >= PRESSABLE_Q3_2026_OFFER_START_DATE;
}

export default function useHasBenefitedFromIntroductoryOffer() {
	const { data, isFetched } = useFetchLicenses(
		LicenseFilter.NotRevoked,
		'pressable',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Ascending,
		1,
		100
	);

	return useMemo(
		() => ( {
			hasBenefited: hasBenefitedFromIntroductoryOffer( data?.items ),
			isReady: isFetched,
		} ),
		[ data?.items, isFetched ]
	);
}
