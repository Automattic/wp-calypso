/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useCountries } from '../use-countries';

describe( 'use-countries hook', () => {
	test( 'returns list of countries from the api', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const expected = {
			'AL:AL-01': 'Albania — Berat',
			'AL:AL-09': 'Albania — Dibër',
			'AL:AL-02': 'Albania — Durrës',
			'AL:AL-03': 'Albania — Elbasan',
		};

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/woocommerce/countries/regions/?_locale=en' )
			.reply( 200, expected );

		const { result } = renderHook( () => useCountries(), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( expected );
	} );
} );
