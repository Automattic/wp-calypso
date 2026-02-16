/**
 * Utility functions for formatting checkout transactions
 */
import type {
	TransactionRequest,
	TransactionPayment,
	DomainDetailsForTransaction,
} from '@automattic/api-core';
import type { ResponseCart, RequestCart, DomainContactDetails } from '@automattic/shopping-cart';

/**
 * Convert ResponseCart to RequestCart format for transaction endpoint
 */
export function createTransactionCart( {
	siteId,
	responseCart,
}: {
	siteId: number;
	responseCart: ResponseCart;
} ): RequestCart {
	return {
		blog_id: siteId || 0,
		cart_key: siteId || 'no-site',
		coupon: responseCart.coupon || '',
		temporary: false,
		products: responseCart.products,
		tax: {
			location: {
				country_code: responseCart.tax.location.country_code,
				postal_code: responseCart.tax.location.postal_code,
				subdivision_code: responseCart.tax.location.subdivision_code,
				vat_id: responseCart.tax.location.vat_id,
				organization: responseCart.tax.location.organization,
				address: responseCart.tax.location.address,
				city: responseCart.tax.location.city,
				is_for_business: responseCart.tax.location.is_for_business,
			},
		},
	};
}

/**
 * Converts camelCase DomainContactDetails (shopping-cart internal format) to the
 * snake_case format required by the /me/transactions and /me/paypal-express-url endpoints,
 * including TLD-specific extra fields.
 */
export function convertDomainDetailsForTransaction(
	details: DomainContactDetails
): DomainDetailsForTransaction {
	const result: DomainDetailsForTransaction = {
		first_name: details.firstName,
		last_name: details.lastName,
		organization: details.organization,
		email: details.email,
		phone: details.phone,
		address_1: details.address1,
		address_2: details.address2,
		city: details.city,
		state: details.state,
		postal_code: details.postalCode,
		country_code: details.countryCode,
		fax: details.fax,
		vat_id: details.vatId,
	};

	if ( details.extra ) {
		const extra: DomainDetailsForTransaction[ 'extra' ] = {};

		if ( details.extra.ca ) {
			extra.ca = {
				lang: details.extra.ca.lang,
				legal_type: details.extra.ca.legalType,
				cira_agreement_accepted: details.extra.ca.ciraAgreementAccepted,
			};
		}

		if ( details.extra.uk ) {
			extra.uk = {
				registrant_type: details.extra.uk.registrantType,
				registration_number: details.extra.uk.registrationNumber,
				trading_name: details.extra.uk.tradingName,
			};
		}

		if ( details.extra.fr ) {
			extra.fr = {
				registrant_type: details.extra.fr.registrantType,
				registrant_vat_id: details.extra.fr.registrantVatId,
				trademark_number: details.extra.fr.trademarkNumber,
				siren_siret: details.extra.fr.sirenSiret,
			};
		}

		result.extra = extra;
	}

	return result;
}

/**
 * Create a basic transaction request with cart and payment info
 */
export function createTransactionRequest( {
	cart,
	payment,
	domainDetails,
}: {
	cart: RequestCart;
	payment: TransactionPayment;
	domainDetails?: DomainContactDetails | null;
} ): TransactionRequest {
	return {
		cart,
		payment,
		domain_details: domainDetails ? convertDomainDetailsForTransaction( domainDetails ) : null,
		// TOS acceptance tracking would go here if needed
		tos: {},
		// Ad conversion tracking would go here if needed
		ad_conversion: {
			ad_details: '',
			sensitive_pixel_options: '',
		},
	};
}
