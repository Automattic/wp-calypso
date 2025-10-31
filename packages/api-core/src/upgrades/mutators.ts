import { wpcom } from '../wpcom-fetcher';
import { normalizePurchase } from './fetchers';
import type { Purchase, PurchaseCancelOptions, PurchaseDowngradeOptions } from './types';

export interface UpdateCreditCardParams {
	purchaseId: number;
	paymentPartner?: string;
	paygateToken?: string;
	useForExisting?: boolean;
	eventSource?: string;
	postalCode?: string;
	countryCode?: string;
	taxSubdivisionCode?: string;
	taxCity?: string;
	taxOrganization?: string;
	taxAddress?: string;
	setupKey?: string;
}

export interface AssignPaymentMethodParams {
	subscriptionId: string;
	storedDetailsId: string;
}

export async function setPurchaseAutoRenew(
	purchaseId: number,
	autoRenew: boolean
): Promise< { success: boolean; upgrade: Purchase } > {
	const action = autoRenew ? 'enable-auto-renew' : 'disable-auto-renew';
	const data = await wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/${ action }`,
		apiVersion: '1.1',
	} );
	return {
		success: data.success,
		upgrade: normalizePurchase( data.upgrade ),
	};
}

export async function updateCreditCard(
	params: UpdateCreditCardParams
): Promise< { success: boolean; upgrade: Purchase } > {
	const data = await wpcom.req.post( {
		path: `/upgrades/${ params.purchaseId }/update-credit-card`,
		apiVersion: '1.2',
		body: {
			payment_partner: params.paymentPartner,
			paygate_token: params.paygateToken,
			use_for_existing: params.useForExisting,
			event_source: params.eventSource,
			postal_code: params.postalCode,
			country_code: params.countryCode,
			tax_subdivision_code: params.taxSubdivisionCode,
			tax_city: params.taxCity,
			tax_organization: params.taxOrganization,
			tax_address: params.taxAddress,
			setup_key: params.setupKey,
		},
	} );
	return {
		success: data.success,
		upgrade: normalizePurchase( data.upgrade ),
	};
}

export async function assignPaymentMethod(
	params: AssignPaymentMethodParams
): Promise< { success: boolean; upgrade: Purchase } > {
	const data = await wpcom.req.post( {
		path: `/upgrades/${ params.subscriptionId }/assign-payment-method`,
		apiVersion: '1.2',
		body: {
			stored_details_id: params.storedDetailsId,
		},
	} );
	return {
		success: data.payment_method_changed,
		upgrade: normalizePurchase( data.upgrade ),
	};
}

export async function removePurchase( purchaseId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/delete`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function cancelAndRefundPurchase(
	purchaseId: number,
	options: PurchaseCancelOptions | PurchaseDowngradeOptions
): Promise< { status: string; message: string } > {
	return wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/cancel`,
		body: options,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function extendPurchaseWithFreeMonth(
	purchaseId: number
): Promise< { status: string; message: string } > {
	return wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/extend`,
		apiNamespace: 'wpcom/v2',
	} );
}
