import type { SelectorProduct } from '../../types';

// Use first currency code from URL parameter, then from the product item, then from the user's currency code.
const getCurrencyCode = ( item?: SelectorProduct, userCurrencyCode?: string | null ) => {
	const urlParams = new URLSearchParams( window.location.search );
	const urlCurrency = urlParams.get( 'currency' );

	if ( urlCurrency ) {
		return urlCurrency;
	}

	if ( item?.displayCurrency ) {
		return item.displayCurrency;
	}

	return userCurrencyCode || 'USD';
};

export default getCurrencyCode;
