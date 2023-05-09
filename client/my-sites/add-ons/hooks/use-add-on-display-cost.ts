import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getProductCost, getProductCurrencyCode } from 'calypso/state/products-list/selectors';

const useAddOnDisplayCost = ( productSlug: string ) => {
	const translate = useTranslate();

	return useSelector( ( state ) => {
		const cost = getProductCost( state, productSlug );
		const currencyCode = getProductCurrencyCode( state, productSlug );

		if ( ! ( cost && currencyCode ) ) {
			return null;
		}

		return translate( '%(monthlyCost)s monthly, billed yearly', {
			/* Translators: $montlyCost: monthly price formatted with currency */
			args: {
				monthlyCost: formatCurrency( cost / 12, currencyCode, {
					stripZeros: true,
				} ),
			},
		} );
	} );
};

export default useAddOnDisplayCost;
