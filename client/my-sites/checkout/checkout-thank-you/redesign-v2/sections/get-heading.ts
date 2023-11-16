import {
	isChargeback,
	isDelayedDomainTransfer,
	isDomainMapping,
	isPlan,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

export interface HeadingProps {
	isDataLoaded: boolean;
	hasFailedPurchases: boolean;
	primaryPurchase: ReceiptPurchase;
	isSearch: boolean;
}
export default function getHeading( props: HeadingProps ) {
	const { isDataLoaded, hasFailedPurchases, primaryPurchase, isSearch } = props;

	if ( ! isDataLoaded ) {
		return translate( 'Loading…' );
	}

	if ( hasFailedPurchases ) {
		return translate( 'Some items failed.' );
	}

	if ( isSearch ) {
		return translate( 'Welcome to Jetpack Search!' );
	}

	if (
		primaryPurchase &&
		isDomainMapping( primaryPurchase ) &&
		! primaryPurchase.isRootDomainWithUs
	) {
		return preventWidows( translate( 'Almost done!' ) );
	}

	if ( primaryPurchase && isPlan( primaryPurchase ) ) {
		return translate( 'Get the best out of your site' );
	}

	if ( primaryPurchase && isChargeback( primaryPurchase ) ) {
		return translate( 'Thank you!' );
	}

	if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
		return preventWidows( translate( 'Almost done!' ) );
	}

	return translate( 'Congratulations on your purchase!' );
}
