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
			latestInvoice: key.latest_invoice
				? {
						id: key.latest_invoice.id,
						number: key.latest_invoice.number,
						dueDate: key.latest_invoice.due_date,
						created: key.latest_invoice.created,
						effectiveAt: key.latest_invoice.effective_at,
						status: key.latest_invoice.status,
						total: key.latest_invoice.total,
						currency: key.latest_invoice.currency,
						pdfUrl: key.latest_invoice.invoice_pdf,
				  }
				: null,
		} ) ),
	};
}
