import { wpcom } from '../wpcom-fetcher';
import type { IssuedJetpackLicense, IssueJetpackLicensesInput } from './types';

export async function issueJetpackLicenses(
	agencyId: number,
	{ product, quantity, bundle = false }: IssueJetpackLicensesInput
): Promise< IssuedJetpackLicense[] > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/licenses',
		body: { product, quantity, agency_id: agencyId, bundle },
	} );
}

export async function assignJetpackLicenseToSite(
	agencyId: number,
	licenseKey: string,
	siteId: number
): Promise< IssuedJetpackLicense > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/license/${ licenseKey }/site`,
		body: { site: siteId, agency_id: agencyId },
	} );
}

export async function revokeJetpackLicense( licenseKey: string ): Promise< IssuedJetpackLicense > {
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/agency/license',
		body: { license_key: licenseKey },
	} );
}
