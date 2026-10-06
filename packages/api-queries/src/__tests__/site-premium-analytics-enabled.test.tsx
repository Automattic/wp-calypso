import { QueryClient, QueryClientProvider, dehydrate, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { dehydrateOptions } from '../dehydrate-options';
import { sitePremiumAnalyticsEnabledQuery } from '../site-settings';

const BASE = 'https://public-api.wordpress.com';

function renderQuery(
	client = new QueryClient( { defaultOptions: { queries: { retry: false } } } )
) {
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

	it( 'answers null, not an error, when the site does not register the setting', async () => {
		nock( BASE ).get( '/wp/v2/sites/1/settings' ).query( true ).reply( 200, { title: 'Site' } );

		const { result } = renderQuery();

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( result.current.isError ).toBe( false );
		expect( result.current.data ).toBeNull();
	} );

	it( 'does not repeat a request the site refused, even in a client that retries every error', async () => {
		let requests = 0;
		nock( BASE )
			.get( '/wp/v2/sites/1/settings' )
			.query( true )
			.times( 4 )
			.reply( () => {
				requests++;
				return [
					403,
					{ code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.' },
				];
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: 3, retryDelay: 0 } } } );

		const { result } = renderQuery( client );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( requests ).toBe( 1 );
	} );

	it( 'is not stored in the browser, so a dashboard switched off in wp-admin is not linked from a stale answer', async () => {
		nock( BASE )
			.get( '/wp/v2/sites/1/settings' )
			.query( true )
			.reply( 200, { jetpack_premium_analytics_enabled: true } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		const { result } = renderQuery( client );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( dehydrate( client, dehydrateOptions ).queries ).toEqual( [] );
	} );
} );
