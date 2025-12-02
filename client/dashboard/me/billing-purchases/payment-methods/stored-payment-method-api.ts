import type {
	Purchase,
	SaveCreditCardParams,
	UpdateCreditCardParams,
	saveCreditCard as saveCreditCardCore,
} from '@automattic/api-core';
import type { StripeConfiguration } from '@automattic/calypso-stripe';

type StoredCardEndpointResponse = Awaited< ReturnType< typeof saveCreditCardCore > >;

export async function saveCreditCard( {
	token,
	stripeConfiguration,
	useForAllSubscriptions,
	useForBusiness,
	postalCode,
	countryCode,
	state,
	city,
	organization,
	address,
	setupKey,
	mutateAsync,
}: {
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
	useForBusiness?: boolean | undefined;
	postalCode?: string;
	countryCode: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
	setupKey?: string;
	mutateAsync: ( params: SaveCreditCardParams ) => Promise< StoredCardEndpointResponse >;
} ): Promise< StoredCardEndpointResponse > {
	const params: SaveCreditCardParams = {
		paymentKey: token,
		useForExisting: useForAllSubscriptions,
		paymentPartner: stripeConfiguration?.processor_id ?? '',
		paygateToken: token,
		postalCode: postalCode ?? '',
		countryCode,
		taxSubdivisionCode: state,
		taxCity: city,
		taxOrganization: organization,
		taxAddress: address,
		taxIsForBusiness: useForBusiness,
		setupKey,
	};
	return await mutateAsync( params );
}

export async function updateCreditCard( {
	purchase,
	token,
	stripeConfiguration,
	useForAllSubscriptions,
	postalCode,
	state,
	city,
	organization,
	address,
	countryCode,
	setupKey,
	mutateAsync,
}: {
	purchase: Purchase;
	token: string;
	stripeConfiguration: StripeConfiguration;
	useForAllSubscriptions: boolean;
	postalCode?: string;
	state?: string;
	city?: string;
	organization?: string;
	address?: string;
	countryCode: string;
	setupKey?: string;
	mutateAsync: ( params: UpdateCreditCardParams ) => Promise< StoredCardEndpointResponse >;
} ): Promise< StoredCardEndpointResponse > {
	const params: UpdateCreditCardParams = {
		purchaseId: purchase.ID,
		paymentPartner: stripeConfiguration?.processor_id ?? '',
		paygateToken: token,
		useForExisting: useForAllSubscriptions,
		postalCode: postalCode ?? '',
		countryCode,
		taxSubdivisionCode: state,
		taxCity: city,
		taxOrganization: organization,
		taxAddress: address,
		setupKey,
	};
	return await mutateAsync( params );
}
