// @ts-nocheck - TODO: Fix TypeScript issues
import { plansQuery } from '@automattic/api-queries';
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
	siteId,
	mockSetCartEndpointWith,
	createTestReduxStore,
} from './index';
import type { SetCart, ResponseCart } from '@automattic/shopping-cart';

function createSeededQueryClient() {
	const client = new QueryClient();
	// Cart prep resolves plans referenced by their path slug in the URL from the
	// `/plans` query, so seed it (e.g. `personal` -> `personal-bundle`).
	client.setQueryData( plansQuery().queryKey, [
		{ product_slug: 'personal-bundle', path_slug: 'personal' },
	] );
	return client;
}

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
	const [ queryClient ] = useState( createSeededQueryClient );

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
							{ ...additionalProps }
						/>
					</StripeHookProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}
