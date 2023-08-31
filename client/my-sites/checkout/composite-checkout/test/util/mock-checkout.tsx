import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { PropsOf } from '@emotion/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import {
	mockGetCartEndpointWith,
	fetchStripeConfiguration,
	siteId,
	countryList,
	mockSetCartEndpointWith,
	createTestReduxStore,
} from './index';
import type { SetCart, ResponseCart } from '@automattic/shopping-cart';

export function MockCheckout( {
	initialCart,
	cartChanges,
	additionalProps,
	setCart,
	useUndefinedSiteId,
}: {
	initialCart: ResponseCart;
	cartChanges?: Partial< ResponseCart >;
	additionalProps?: Partial< PropsOf< typeof CheckoutMain > >;
	setCart?: SetCart;
	useUndefinedSiteId?: boolean;
} ) {
	const reduxStore = createTestReduxStore();
	const queryClient = new QueryClient();

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );
	const managerClient = createShoppingCartManagerClient( {
		getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
		setCart: setCart || mockSetCartEndpoint,
	} );

	return (
		<ReduxProvider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<ShoppingCartProvider managerClient={ managerClient }>
					<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
						<CheckoutMain
							siteId={ useUndefinedSiteId ? undefined : siteId }
							siteSlug="foo.com"
							overrideCountryList={ countryList }
							{ ...additionalProps }
						/>
					</StripeHookProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}
