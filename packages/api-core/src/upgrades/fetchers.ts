import { wpcom } from '../wpcom-fetcher';
import type { Purchase, RawPurchase } from './types';

/**
 * Some data from the purchases endpoints are currently numeric strings but we
 * are trying to transition them to numbers. Also some domain properties are
 * intended to be booleans but are actually the string "true". This function
 * provides a way to migrate safely.
 */
export function normalizePurchase( rawPurchase: RawPurchase ): Purchase {
	return {
		...rawPurchase,
		ID: parseInt( String( rawPurchase.ID ), 10 ),
		attached_to_purchase_id: rawPurchase.attached_to_purchase_id
			? parseInt( String( rawPurchase.attached_to_purchase_id ), 10 )
			: null,
		ownership_id: parseInt( String( rawPurchase.ownership_id ), 10 ),
		product_id: parseInt( String( rawPurchase.product_id ), 10 ),
		blog_id: parseInt( String( rawPurchase.blog_id ), 10 ),
		user_id: parseInt( String( rawPurchase.user_id ), 10 ),
		is_domain: Boolean( rawPurchase.is_domain ),
		is_domain_registration: Boolean( rawPurchase.is_domain_registration ),
	};
}

export async function fetchUserPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/upgrades',
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}

export async function fetchUserTransferredPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/upgrades?type=transferred',
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}

export async function fetchSitePurchases( siteId: number | string ): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: `/upgrades?site=${ siteId }`,
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}

export async function fetchPurchase( purchaseId: number ): Promise< Purchase > {
	const data = await wpcom.req.get( {
		path: `/upgrades/${ purchaseId }`,
		apiVersion: '1.2',
	} );
	return normalizePurchase( data );
}

export async function hasExtendedPurchase( purchaseId: number ): Promise< boolean > {
	return await wpcom.req.get( {
		path: `/purchases/${ purchaseId }/has-extended`,
		apiNamespace: 'wpcom/v2',
	} );
}
