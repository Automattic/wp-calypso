import { getProductDisplayCost, getProductTerm } from 'calypso/state/products-list/selectors';
import { getTheme } from './get-theme';
import type { AppState, Theme } from 'calypso/types';

import 'calypso/state/themes/init';

const PRODUCT_TERM_MONTH = 'month' as const;
const PRODUCT_TERM_YEAR = 'year' as const;
type PRODUCT_TERMS = typeof PRODUCT_TERM_MONTH | typeof PRODUCT_TERM_YEAR;

type MarketplaceThemeSubscriptionPrices = Partial< Record< PRODUCT_TERMS, string > >;

export function getMarketplaceThemeSubscriptionPrices(
	state: AppState,
	themeId: string | null
): MarketplaceThemeSubscriptionPrices {
	const emptyPrices = {};

	const theme: Theme | undefined = getTheme( state, 'wpcom', themeId );

	if ( ! theme || ! Array.isArray( theme.product_details ) ) {
		return emptyPrices;
	}

	return theme.product_details.reduce(
		( interimPrices: MarketplaceThemeSubscriptionPrices, { product_slug } ) => {
			const currentProductTerm = getProductTerm( state, product_slug );
			const currentProductPrice = getProductDisplayCost( state, product_slug );

			if (
				currentProductTerm &&
				currentProductPrice &&
				( currentProductTerm === PRODUCT_TERM_MONTH || currentProductTerm === PRODUCT_TERM_YEAR )
			) {
				interimPrices[ currentProductTerm ] = currentProductPrice;
			}

			return interimPrices;
		},
		emptyPrices
	);
}
