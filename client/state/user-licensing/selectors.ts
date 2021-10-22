import { License, LicenseCounts, PaginatedItems } from 'calypso/state/user-licensing/types';
import { AppState } from 'calypso/types';
import 'calypso/state/user-licensing/init';

export function getUserLicensesCounts( state: AppState ): LicenseCounts | null {
	return state?.userLicensing?.counts;
}

export function getUserLicenses( state: AppState ): PaginatedItems< License > | null {
	return state?.userLicensing?.licenses;
}

export function hasFetchedUserLicensesCounts( state: AppState ): boolean {
	return state.userLicensing?.hasFetchedLicenseCounts;
}

export function isFetchingUserLicensesCounts( state: AppState ): boolean {
	return state.userLicensing?.countsFetching;
}

export function hasFetchedUserLicenses( state: AppState ): boolean {
	return state.userLicensing?.hasFetchedLicenses;
}

export function isFetchingUserLicenses( state: AppState ): boolean {
	return state.userLicensing?.licensesFetching;
}

export function userHasDetachedLicenses( state: AppState ): boolean {
	return !! state.userLicensing?.counts?.detached;
}
