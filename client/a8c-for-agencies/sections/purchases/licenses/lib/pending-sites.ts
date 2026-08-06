export type PendingSite = {
	id: number;
	features: {
		wpcom_atomic: {
			license_key: string;
			state: string;
		};
	};
};

/**
 * The pending site a license will become once the agency configures it. Only
 * sites still in the `pending` state can be created; anything further along is
 * already on its way to the sites dashboard.
 */
export function findPendingSiteIdByLicenseKey(
	pendingSites: PendingSite[] | undefined,
	licenseKey: string
): number | null {
	return (
		pendingSites?.find(
			( { features }: PendingSite ) =>
				features?.wpcom_atomic?.license_key === licenseKey &&
				features?.wpcom_atomic?.state === 'pending'
		)?.id ?? null
	);
}

/**
 * Mirrors the Needs setup page: provisioning is treated as an account-wide
 * state, so no other site can be created while one is being built.
 */
export function hasProvisioningSite( pendingSites: PendingSite[] | undefined ): boolean {
	return !! pendingSites?.some(
		( { features }: PendingSite ) =>
			features?.wpcom_atomic?.state === 'provisioning' && !! features?.wpcom_atomic?.license_key
	);
}
