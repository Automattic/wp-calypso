// @ts-nocheck - TODO: Fix TypeScript issues
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { PropsOf } from '@emotion/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import {
	mockGetCartEndpointWith,
	fetchStripeConfiguration,
	fetchRazorpayConfiguration,
	siteId,
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
	const [ queryClient ] = useState( () => new QueryClient() );

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
						<RazorpayHookProvider fetchRazorpayConfiguration={ fetchRazorpayConfiguration }>
							<CheckoutMain
								siteId={ useUndefinedSiteId ? undefined : siteId }
								siteSlug="foo.com"
								{ ...additionalProps }
							/>
						</RazorpayHookProvider>
					</StripeHookProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}
