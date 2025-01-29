import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { Purchase } from 'calypso/lib/purchases/types';

type StoredCardEndpointResponse = unknown;

export async function saveCreditCard( {
	token,
	stripeConfiguration,
	useForAllSubscriptions,
	eventSource,
	postalCode,
	countryCode,
	state,
	city,
	organization,
	address,
	setupKey,
}: {
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
	eventSource?: string;
	postalCode?: string;
	countryCode: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
	setupKey?: string;
} ): Promise< StoredCardEndpointResponse > {
	const additionalData = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		useForAllSubscriptions,
		eventSource,
		postalCode,
		countryCode,
		state,
		city,
		organization,
		address,
		setupKey,
	} );
	const response = await wp.req.post(
		{
			path: '/me/stored-cards',
			apiVersion: '1.1',
		},
		{
			payment_key: token,
			use_for_existing: true,
			...( additionalData ?? {} ),
		}
	);
	if ( response.error ) {
		recordTracksEvent( 'calypso_purchases_add_new_payment_method_error' );
		throw new Error( response );
	}
	recordTracksEvent( 'calypso_purchases_add_new_payment_method' );
	return response;
}

export async function updateCreditCard( {
	purchase,
	token,
	stripeConfiguration,
	useForAllSubscriptions,
	eventSource,
	postalCode,
	state,
	city,
	organization,
	address,
	countryCode,
	setupKey,
}: {
	purchase: Purchase;
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
	eventSource?: string;
	postalCode?: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
	countryCode: string;
	setupKey?: string;
} ): Promise< StoredCardEndpointResponse > {
	const {
		purchaseId,
		payment_partner,
		paygate_token,
		use_for_existing,
		event_source,
		postal_code,
		country_code,
		tax_subdivision_code,
		tax_city,
		tax_organization,
		tax_address,
		setup_key,
	} = getParamsForApi( {
		cardToken: token,
		stripeConfiguration,
		purchase,
		useForAllSubscriptions,
		eventSource,
		postalCode,
		countryCode,
		state,
		city,
		organization,
		address,
		setupKey,
	} );
	const response = await wp.req.post(
		{
			path: '/upgrades/' + purchaseId + '/update-credit-card',
			apiVersion: '1.1',
		},
		{
			payment_partner,
			paygate_token,
			use_for_existing,
			event_source,
			postal_code,
			country_code,
			tax_subdivision_code,
			tax_city,
			tax_organization,
			tax_address,
			setup_key,
		}
	);
	if ( response.error ) {
		recordTracksEvent( 'calypso_purchases_save_new_payment_method_error' );
		throw new Error( response );
	}
	recordTracksEvent( 'calypso_purchases_save_new_payment_method' );
	return response;
}

function getParamsForApi( {
	cardToken,
	stripeConfiguration,
	purchase,
	useForAllSubscriptions,
	eventSource,
	postalCode,
	countryCode,
	state,
	city,
	organization,
	address,
	setupKey,
}: {
	cardToken: string;
	stripeConfiguration: StripeConfiguration;
	purchase?: Purchase | undefined;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
	postalCode: string | undefined;
	countryCode: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
	setupKey?: string;
} ) {
	return {
		payment_partner: stripeConfiguration ? stripeConfiguration.processor_id : '',
		paygate_token: cardToken,
		...( useForAllSubscriptions === true ? { use_for_existing: true } : {} ),
		...( useForAllSubscriptions === false ? { use_for_existing: false } : {} ), // if undefined, we do not add this property
		...( purchase ? { purchaseId: purchase.id } : {} ),
		...( eventSource ? { event_source: eventSource } : {} ),
		postal_code: postalCode ?? '',
		country_code: countryCode,
		tax_subdivision_code: state,
		tax_city: city,
		tax_organization: organization,
		tax_address: address,
		...( setupKey ? { setup_key: setupKey } : {} ),
	};
}
