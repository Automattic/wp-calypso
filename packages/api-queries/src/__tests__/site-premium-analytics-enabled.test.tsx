import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { sitePremiumAnalyticsEnabledQuery } from '../site-stats';

const BASE = 'https://public-api.wordpress.com';

function renderQuery() {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return renderHook( () => useQuery( sitePremiumAnalyticsEnabledQuery( 1 ) ), {
		wrapper: ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );
}

describe( 'sitePremiumAnalyticsEnabledQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'reads the setting when the site registers it', async () => {
		nock( BASE )
			.get( '/wp/v2/sites/1/settings' )
			.query( true )
			.reply( 200, { title: 'Site', jetpack_premium_analytics_enabled: true } );

		const { result } = renderQuery();

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toBe( true );
	} );

	it( 'answers undefined, not an error, when the site does not register the setting', async () => {
		nock( BASE ).get( '/wp/v2/sites/1/settings' ).query( true ).reply( 200, { title: 'Site' } );

		const { result } = renderQuery();

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( result.current.isError ).toBe( false );
		expect( result.current.data ).toBeUndefined();
	} );
} );
