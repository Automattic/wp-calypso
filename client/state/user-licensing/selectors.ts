import {
	License,
	LicenseCounts,
	PaginatedItems,
	UserLicensingStore,
} from 'calypso/state/user-licensing/types';
import 'calypso/state/user-licensing/init';

export function getUserLicensesCounts( state: UserLicensingStore ): LicenseCounts | null {
	return state?.userLicensing?.counts;
}

export function getUserLicenses( state: UserLicensingStore ): PaginatedItems< License > | null {
	return state?.userLicensing?.licenses;
}

export function hasFetchedLicenseCounts( state: UserLicensingStore ): boolean {
	return state.userLicensing?.hasFetchedLicenseCounts;
}

export function isFetchingLicenseCounts( state: UserLicensingStore ): boolean {
	return state.userLicensing?.countsFetching;
}

export function hasFetchedLicenses( state: UserLicensingStore ): boolean {
	return state.userLicensing?.hasFetchedLicenses;
}

export function isFetchingUserLicenses( state: UserLicensingStore ): boolean {
	return state.userLicensing?.licensesFetching;
}
