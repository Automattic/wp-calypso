/** @format */

export const purchasesRoot = '/me/purchases';

export const addCreditCard = purchasesRoot + '/add-credit-card';

export const billingHistory = purchasesRoot + '/billing';

export function billingHistoryReceipt( receiptId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof receiptId ) {
			throw new Error( 'receiptId must be provided' );
		}
	}
	return billingHistory + `/${ receiptId }`;
}

export function managePurchase( purchaseId, __guard__ ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId ) {
			throw new Error( 'purchaseId must be provided' );
		}

		// Ensure that we do not receive 2nd param (signature has changed)
		if ( 'undefined' !== typeof __guard__ ) {
			throw new Error( `Unexpected parameter found: \`${ JSON.stringify( __guard__ ) }\`` );
		}
	}
	return purchasesRoot + `/${ purchaseId }`;
}

export function cancelPurchase( purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId ) {
			throw new Error( 'purchaseId must be provided' );
		}
	}
	return managePurchase( purchaseId ) + '/cancel';
}

export function confirmCancelDomain( purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId ) {
			throw new Error( 'purchaseId must be provided' );
		}
	}
	return managePurchase( purchaseId ) + '/confirm-cancel-domain';
}

export function cancelPrivacyProtection( purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId ) {
			throw new Error( 'purchaseId must be provided' );
		}
	}
	return managePurchase( purchaseId ) + '/cancel-privacy-protection';
}

export function addCardDetails( purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId ) {
			throw new Error( 'purchaseId must be provided' );
		}
	}
	return managePurchase( purchaseId ) + '/payment/add';
}

export function editCardDetails( purchaseId, cardId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof purchaseId || 'undefined' === typeof cardId ) {
			throw new Error( 'purchaseId and cardId must be provided' );
		}
	}
	return managePurchase( purchaseId ) + `/payment/edit/${ cardId }`;
}
