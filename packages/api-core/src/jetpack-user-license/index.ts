import { wpcom } from '../wpcom-fetcher';

export interface JetpackUserLicenseApi {
	license_key: string;
	issued_at: string;
	revoked_at: string | null;
	subscription_id: number;
}

export interface JetpackUserLicense {
	licenseKey: string;
	issuedAt: string;
	revokedAt: string | null;
	subscriptionId: number;
}

export async function fetchJetpackUserLicense(
	subscriptionId: number
): Promise< JetpackUserLicense > {
	const raw: JetpackUserLicenseApi = await wpcom.req.get( {
		path: `/jetpack-licensing/user/subscription/${ subscriptionId }`,
		apiNamespace: 'wpcom/v2',
	} );
	return {
		licenseKey: raw.license_key,
		issuedAt: raw.issued_at,
		revokedAt: raw.revoked_at,
		subscriptionId: raw.subscription_id,
	};
}
