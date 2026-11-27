// @ts-nocheck - TODO: Fix TypeScript issues
import {
	countryListQuery,
	siteByIdQuery,
	statesListQuery,
	transactionSupportedCountriesQuery,
} from '@automattic/api-queries';
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
	createTestSite,
	countryList,
	stateList,
} from './index';
import type { Site } from '@automattic/api-core';
import type { SetCart, ResponseCart } from '@automattic/shopping-cart';

function seedTestSite( client: QueryClient, site?: Partial< Site > ) {
	const { queryKey } = siteByIdQuery( siteId );
	client.setQueryDefaults( queryKey, { staleTime: Infinity } );
	client.setQueryData( queryKey, createTestSite( site ) );
	// Each test mocks the countries endpoint once. Without this, a component mounting after the
	// list loads refetches it, and that request can take the next test's mocked reply.
	client.setQueryDefaults( transactionSupportedCountriesQuery().queryKey.slice( 0, 3 ), {
		staleTime: Infinity,
	} );
	seedDomainCountries( client );
	return client;
}

/**
 * Seeds the countries and states that the domain contact form and the state
 * fields read, so tests don't need to mock their endpoints.
 */
export function seedDomainCountries( client: QueryClient ) {
	client.setQueryDefaults( countryListQuery().queryKey, { staleTime: Infinity } );
	client.setQueryData( countryListQuery().queryKey, countryList );
	client.setQueryDefaults( statesListQuery( '' ).queryKey.slice( 0, 1 ), { staleTime: Infinity } );
	for ( const [ countryCode, states ] of Object.entries( stateList ) ) {
		client.setQueryData( statesListQuery( countryCode ).queryKey, states );
	}
}

export function MockCheckout( {
	initialCart,
	cartChanges,
	additionalProps,
	setCart,
	useUndefinedSiteId,
	site,
}: {
	initialCart: ResponseCart;
	cartChanges?: Partial< ResponseCart >;
	additionalProps?: Partial< PropsOf< typeof CheckoutMain > >;
	setCart?: SetCart;
	useUndefinedSiteId?: boolean;
	site?: Partial< Site >;
} ) {
	const reduxStore = createTestReduxStore();
	const [ queryClient ] = useState( () =>
		seedTestSite( new QueryClient( { defaultOptions: { queries: { retry: false } } } ), site )
	);

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
