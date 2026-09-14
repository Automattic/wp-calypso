import { useMemo } from 'react';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { isPressableAddonProduct, isPressableHostingProduct } from '../lib/hosting';
import type { License } from 'calypso/state/partner-portal/types';

type PressableAddonLicenseVisibility = {
	hasActiveAgencyPressablePlanLicense: boolean;
};

type PressableAddonMarketplaceVisibility = Pick<
	PressableAddonLicenseVisibility,
	'hasActiveAgencyPressablePlanLicense'
> & {
	isReferralMode: boolean;
};

export const DEFAULT_PRESSABLE_ADDON_VISIBILITY: PressableAddonLicenseVisibility = {
	hasActiveAgencyPressablePlanLicense: false,
};

export function getPressableAddonLicenseVisibility(
	licenses: License[] | undefined
): PressableAddonLicenseVisibility {
	if ( ! licenses?.length ) {
		return DEFAULT_PRESSABLE_ADDON_VISIBILITY;
	}

	return licenses.reduce< PressableAddonLicenseVisibility >(
		( visibility, license ) => {
			const isPressablePlan =
				isPressableHostingProduct( license.licenseKey ) &&
				! isPressableAddonProduct( license.licenseKey );

			if ( ! isPressablePlan ) {
				return visibility;
			}

			if ( ! license.referral ) {
				visibility.hasActiveAgencyPressablePlanLicense = true;
			}

			return visibility;
		},
		{ ...DEFAULT_PRESSABLE_ADDON_VISIBILITY }
	);
}

export function canShowPressableAddonsInMarketplace( {
	isReferralMode,
	hasActiveAgencyPressablePlanLicense,
}: PressableAddonMarketplaceVisibility ) {
	if ( isReferralMode ) {
		return true;
	}

	return hasActiveAgencyPressablePlanLicense;
}

export default function usePressableAddonVisibility() {
	const { data } = useFetchLicenses(
		LicenseFilter.NotRevoked,
		'pressable',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		1,
		100
	);

	return useMemo( () => getPressableAddonLicenseVisibility( data?.items ), [ data?.items ] );
}
