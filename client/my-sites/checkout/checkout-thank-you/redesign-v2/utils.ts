import {
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isP2Plus,
	isTitanMail,
	isWpComPlan,
} from '@automattic/calypso-products';
import { CheckoutThankYouCombinedProps, getFailedPurchases, getPurchases } from '..';
import {
	getDomainPurchase,
	isBulkDomainTransfer,
	isDomainOnly,
	isSearch,
	isTitanWithoutMailboxes,
} from '../utils';

/**
 * Determines whether the current checkout flow renders a redesigned congrats page
 * using the new component `<ThankYouV2>` instead of `<ThankYouLayout>`. The ultimate
 * goal is to refactor and migrate all thank you pages to use `<ThankYouV2>`, so that
 * consistent structure and styling are applied.
 * @returns {boolean}
 */
export const isRefactoredForThankYouV2 = ( props: CheckoutThankYouCombinedProps ) => {
	// Fallback to old design when there is a failed purchase.
	const failedPurchases = getFailedPurchases( props );
	if ( failedPurchases.length > 0 ) {
		return false;
	}

	const purchases = getPurchases( props );

	if ( isBulkDomainTransfer( purchases ) ) {
		return true;
	}

	if ( isDomainOnly( purchases ) ) {
		return true;
	}

	if ( purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ) {
		return true;
	}

	if ( isTitanWithoutMailboxes( props.selectedFeature ) && getDomainPurchase( purchases ) ) {
		return true;
	}

	if ( purchases.length === 1 ) {
		const purchase = purchases[ 0 ];

		if ( isWpComPlan( purchase.productSlug ) ) {
			return true;
		}

		if ( isP2Plus( purchase ) ) {
			return true;
		}

		if ( isTitanMail( purchase ) ) {
			return true;
		}

		if ( isSearch( purchase ) ) {
			return true;
		}
	}

	return true;
};
