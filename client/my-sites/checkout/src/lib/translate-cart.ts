import {
	isGoogleWorkspaceExtraLicence,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from '@automattic/calypso-products';
import {
	isValueTruthy,
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from '@automattic/wpcom-checkout';
import cookie from 'cookie';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import type {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartTaxData,
	DomainContactDetails,
	RequestCart,
	RequestCartTaxData,
	CartKey,
} from '@automattic/shopping-cart';
import type {
	TransactionDomainContactDetails,
	WPCOMTransactionEndpointRequestPayload,
	TransactionRequest,
	WPCOMCart,
} from '@automattic/wpcom-checkout';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 */
export function translateResponseCartToWPCOMCart( serverCart: ResponseCart ): WPCOMCart {
	const { allowed_payment_methods } = serverCart;

	const alwaysEnabledPaymentMethods = [ 'free-purchase' ];

	const allowedPaymentMethods = [ ...allowed_payment_methods, ...alwaysEnabledPaymentMethods ]
		.map( readWPCOMPaymentMethodClass )
		.filter( isValueTruthy )
		.map( translateWpcomPaymentMethodToCheckoutPaymentMethod );

	return {
		allowedPaymentMethods,
	};
}

// Create cart object as required by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export function createTransactionEndpointCartFromResponseCart( {
	siteId,
	contactDetails,
	responseCart,
}: {
	siteId: number | undefined;
	contactDetails: DomainContactDetails | null;
	responseCart: ResponseCart;
} ): RequestCart {
	if (
		responseCart.products.some( ( product ) => {
			return (
				product.extra.isJetpackCheckout ||
				product.extra.isAkismetSitelessCheckout ||
				product.extra.isA4ASitelessCheckout
			);
		} )
	) {
		const isUserLess = responseCart.cart_key === 'no-user';

		// At this point, cart_key will be 'no-user' | blog_id | 'no-site', in that order.
		const cartKey = isUserLess ? responseCart.cart_key : responseCart.blog_id || 'no-site';

		// A cart with the 'no-user' key, in the context of a Jetpack checkout flow, means that
		// a WP.com account will be created before submitting the transaction (see submitWpcomTransaction).
		// Once the WP.com account is created, the cart key is replaced with the blog ID and sent to the
		// /transactions endpoint. If there is no blog ID, a temporary blog is created on the backend side.
		return {
			blog_id: responseCart.blog_id,
			cart_key: cartKey as CartKey,
			coupon: responseCart.coupon || '',
			temporary: false,
			products: responseCart.products.map( ( item ) =>
				addRegistrationDataToGSuiteCartProduct( item, contactDetails )
			),
			tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
		};
	}

	return {
		blog_id: siteId ? siteId : 0,
		cart_key: ( siteId || 'no-site' ) as CartKey,
		coupon: responseCart.coupon || '',
		temporary: false,
		products: responseCart.products.map( ( item ) =>
			addRegistrationDataToGSuiteCartProduct( item, contactDetails )
		),
		tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
	};
}

function createTransactionEndpointTaxFromResponseCartTax(
	tax: ResponseCartTaxData
): RequestCartTaxData {
	const {
		country_code,
		postal_code,
		subdivision_code,
		vat_id,
		organization,
		address,
		city,
		is_for_business,
	} = tax.location;
	return {
		location: {
			country_code,
			postal_code,
			subdivision_code,
			vat_id,
			organization,
			address,
			city,
			is_for_business,
		},
	};
}

function addRegistrationDataToGSuiteCartProduct(
	item: ResponseCartProduct,
	contactDetails: DomainContactDetails | null
): ResponseCartProduct {
	if (
		! isGSuiteOrGoogleWorkspaceProductSlug( item.product_slug ) ||
		isGoogleWorkspaceExtraLicence( item )
	) {
		return item;
	}
	return {
		...item,
		extra: {
			...item.extra,
			google_apps_registration_data: contactDetails || undefined,
		},
	};
}

/**
 * This function is used to get the value of the sensitive_pixel_options cookie.
 * @returns String with the value of the sensitive_pixel_options cookie, or an empty string if the cookie is not present.
 */
function getConversionValuesFromCookies(): { ad_details: string; sensitive_pixel_options: string } {
	const cookies = typeof document !== 'undefined' ? cookie.parse( document.cookie ) : {};
	return {
		ad_details: cookies.ad_details || '',
		sensitive_pixel_options: cookies.sensitive_pixel_options || '', // sensitive_pixel_options
	};
}

export function createTransactionEndpointRequestPayload( {
	cart,
	country,
	state,
	postalCode,
	city,
	address,
	streetNumber,
	phoneNumber,
	document,
	deviceId,
	domainDetails,
	paymentMethodType,
	paymentMethodToken,
	paymentPartnerProcessorId,
	storedDetailsId,
	name,
	email,
	cancelUrl,
	successUrl,
	idealBank,
	code,
	useForAllSubscriptions,
	eventSource,
}: TransactionRequest ): WPCOMTransactionEndpointRequestPayload {
	return {
		cart,
		domain_details: domainDetails
			? convertDomainContactDetailsForTransaction( domainDetails )
			: undefined,
		payment: {
			payment_method: paymentMethodType,
			payment_key: paymentMethodToken,
			payment_partner: paymentPartnerProcessorId,
			stored_details_id: storedDetailsId,
			name,
			email,
			country,
			country_code: country,
			state,
			postal_code: postalCode,
			zip: postalCode, // TODO: do we need this in addition to postalCode?
			city,
			address,
			street_number: streetNumber,
			phone_number: phoneNumber,
			document,
			device_id: deviceId,
			success_url: successUrl,
			cancel_url: cancelUrl,
			ideal_bank: idealBank,
			code,
			use_for_all_subscriptions: useForAllSubscriptions,
			event_source: eventSource,
		},
		tos: getToSAcceptancePayload(),
		ad_conversion: getConversionValuesFromCookies(),
	};
}

export function convertDomainContactDetailsForTransaction(
	details: DomainContactDetails
): TransactionDomainContactDetails {
	const { extra } = details;
	return {
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
		extra: extra && {
			ca: extra.ca && {
				lang: extra.ca.lang,
				legal_type: extra.ca.legalType,
				cira_agreement_accepted: extra.ca.ciraAgreementAccepted,
			},
			uk: extra.uk && {
				registrant_type: extra.uk.registrantType,
				registration_number: extra.uk.registrationNumber,
				trading_name: extra.uk.tradingName,
			},
			fr: extra.fr && {
				registrant_type: extra.fr.registrantType,
				registrant_vat_id: extra.fr.registrantVatId,
				trademark_number: extra.fr.trademarkNumber,
				siren_siret: extra.fr.sirenSiret,
			},
			in: extra.in && {
				nexus_declaration: extra.in.nexusDeclaration,
				nexus_connection_type: extra.in.nexusConnectionType,
			},
			es: extra.es && {
				registrant_entity_type: extra.es.registrantEntityType,
				registrant_identification_number: extra.es.registrantIdentificationNumber,
				admin_identification_number: extra.es.adminIdentificationNumber,
				red_es_agreement_accepted: extra.es.redEsAgreementAccepted,
				red_es_agreement_version: extra.es.redEsAgreementVersion,
			},
		},
	};
}
