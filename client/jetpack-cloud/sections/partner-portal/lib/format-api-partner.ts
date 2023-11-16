import type { APIPartner, Partner } from 'calypso/state/partner-portal/types';

/**
 * Format an APIPartner instance to a store-friendly Partner instance.
 * @param {APIPartner} partner API partner object to format.
 * @returns {Partner} Formatted store-friendly Partner object.
 */
export default function formatApiPartner( partner: APIPartner ): Partner {
	return {
		...partner,
		keys: partner.keys.map( ( key ) => ( {
			id: key.id,
			name: key.name,
			oAuth2Token: key.oauth2_token,
			disabledOn: key.disabled_on,
			hasLicenses: key.has_licenses,
			latestInvoice: key.latest_invoice,
		} ) ),
	};
}
