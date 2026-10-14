import { A4A_MARKETPLACE_PRESSABLE_RETURN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import wpcom from 'calypso/lib/wp';
import { RECEIPT_ID_PLACEHOLDER } from '../billing-dragon-checkout/lib/get-success-redirect-url';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type ReturnParams = {
	agencyId?: string;
	referralId?: string;
	receiptId?: string;
	orderId?: string;
};

type ReturnRequest =
	| {
			agency_id: number;
			checkout_status: 'SUCCESS';
			receipt_id?: number;
			order_id?: number;
	  }
	| { agency_id: number; checkout_status: 'CANCELED'; afterPurchaseUrl: string };

export type ClientReturnContext = { referralId: number; clientId: number };

export function isPressableReturnUrl( value: unknown ): value is string {
	if ( typeof value !== 'string' ) {
		return false;
	}
	try {
		const url = new URL( value );
		return (
			url.origin === 'https://my.pressable.com' &&
			url.pathname === '/titan_email/checkout_return' &&
			! url.username &&
			! url.password &&
			! url.hash
		);
	} catch {
		return false;
	}
}

export function getOriginalReturnUrl(
	products: {
		extra?: ResponseCartProduct[ 'extra' ] & { titan_domain?: string; titan_plan?: string };
	}[],
	agencyId: number,
	clientContext?: ClientReturnContext
): string | undefined {
	if ( products.length !== 1 ) {
		return;
	}
	const { extra } = products[ 0 ];
	if (
		! extra?.isA4ASitelessCheckout ||
		parsePositiveId( extra.agency_id ) !== agencyId ||
		! ( 'titan_domain' in extra ) ||
		typeof extra.titan_domain !== 'string' ||
		! extra.titan_domain ||
		! ( 'titan_plan' in extra ) ||
		( extra.titan_plan !== 'standard' && extra.titan_plan !== 'premium' ) ||
		! isPressableReturnUrl( extra.afterPurchaseUrl )
	) {
		return;
	}
	const query = new URL( extra.afterPurchaseUrl ).searchParams;
	const signedIdentifier = query.get( 'agency_id' );
	const clientMatch = signedIdentifier?.match( /^([1-9]\d*)-cli-([1-9]\d*)$/ );
	const matchesIdentity = clientContext
		? !! clientMatch &&
			clientMatch[ 0 ] === signedIdentifier &&
			parsePositiveId( clientMatch[ 1 ] ) === agencyId &&
			parsePositiveId( clientMatch[ 2 ] ) === clientContext.clientId &&
			parsePositiveId( extra.referral_id ) === clientContext.referralId
		: parsePositiveId( signedIdentifier ) === agencyId && ! extra.referral_id;
	if ( matchesIdentity && query.get( 'signature' ) ) {
		return extra.afterPurchaseUrl;
	}
}

export function getPressableReturnPath( agencyId: number, referralId?: number ): string {
	const path = referralId ? '/client/pressable-return' : A4A_MARKETPLACE_PRESSABLE_RETURN_LINK;
	return `${ path }?agency_id=${ agencyId }${ referralId ? `&referral_id=${ referralId }` : '' }&receipt_id=${ RECEIPT_ID_PLACEHOLDER }`;
}

export function parsePositiveId( value: unknown ): number | undefined {
	if ( typeof value !== 'string' && typeof value !== 'number' ) {
		return;
	}
	const identifier = String( value );
	if (
		identifier !== identifier.trim() ||
		! /^[1-9]\d*$/.test( identifier ) ||
		! Number.isSafeInteger( Number( value ) )
	) {
		return;
	}
	return Number( value );
}

export function getReturnRequest( params: ReturnParams ): ReturnRequest {
	const agencyId = parsePositiveId( params.agencyId );
	if ( ! agencyId ) {
		throw new Error( 'Missing agency.' );
	}
	const referralId = parsePositiveId( params.referralId );
	if ( params.referralId !== undefined && ! referralId ) {
		throw new Error( 'Invalid referral.' );
	}
	const receiptId = parsePositiveId( params.receiptId );
	const orderId = parsePositiveId( params.orderId );
	if ( !! params.receiptId === !! params.orderId || ! ( receiptId || orderId ) ) {
		throw new Error( 'Missing purchase.' );
	}
	return {
		agency_id: agencyId,
		checkout_status: 'SUCCESS',
		...( receiptId ? { receipt_id: receiptId } : { order_id: orderId } ),
	};
}

async function postReturnRequest( body: ReturnRequest ): Promise< string > {
	const response: { afterPurchaseUrl?: unknown } = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/pressable/titan-checkout-return',
		method: 'POST',
		body,
	} );
	if ( ! isPressableReturnUrl( response.afterPurchaseUrl ) ) {
		throw new Error( 'Invalid return destination.' );
	}
	return response.afterPurchaseUrl;
}

export async function fetchPressableReturn( params: ReturnParams ): Promise< string > {
	return postReturnRequest( getReturnRequest( params ) );
}

export function fetchCanceledPressableReturn( {
	agencyId,
	afterPurchaseUrl,
}: {
	agencyId: number;
	afterPurchaseUrl: string;
} ): Promise< string > {
	if (
		! Number.isSafeInteger( agencyId ) ||
		agencyId <= 0 ||
		! isPressableReturnUrl( afterPurchaseUrl )
	) {
		return Promise.reject( new Error( 'Missing original checkout context.' ) );
	}
	return postReturnRequest( {
		agency_id: agencyId,
		checkout_status: 'CANCELED',
		afterPurchaseUrl,
	} );
}
