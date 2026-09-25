/**
 * @jest-environment jsdom
 */
import { QueryObserver } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	domainConnectionSetupInfoQuery,
	domainMappingStatusQuery,
	updateConnectionModeMutation,
} from '../domain-connection-setup';
import { queryClient } from '../query-client';

jest.mock( '../query-client', () => {
	const { QueryClient } = jest.requireActual( '@tanstack/react-query' );
	return {
		queryClient: new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: Infinity } },
		} ),
	};
} );

const domainName = 'example.com';
const redirectURL = 'https://dashboard.example/domains/example.com?step=dc_return';

function mockModeUpdate() {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/domains/${ domainName }/mapping-status`, { mode: 'advanced' } )
		.reply( 200, { mode: 'advanced' } );
}

async function updateMode() {
	await queryClient
		.getMutationCache()
		.build( queryClient, updateConnectionModeMutation( domainName, 123 ) )
		.execute( 'advanced' );
}

afterEach( () => {
	queryClient.clear();
	nock.cleanAll();
} );

test( 'invalidates every return URL for this domain and site while leaving other domains and sites fresh', async () => {
	const keys = [
		domainConnectionSetupInfoQuery( domainName, 123 ).queryKey,
		domainConnectionSetupInfoQuery( domainName, 123, redirectURL ).queryKey,
		domainConnectionSetupInfoQuery( domainName, 123, 'https://another.example/return' ).queryKey,
		domainMappingStatusQuery( domainName ).queryKey,
		domainConnectionSetupInfoQuery( domainName, 456, redirectURL ).queryKey,
		domainConnectionSetupInfoQuery( 'other.example', 123, redirectURL ).queryKey,
	];
	keys.forEach( ( key ) => queryClient.setQueryData< unknown >( key, {} ) );
	const request = mockModeUpdate();

	await updateMode();

	expect( request.isDone() ).toBe( true );
	expect( keys.map( ( key ) => queryClient.getQueryState( key )?.isInvalidated ) ).toEqual( [
		true,
		true,
		true,
		true,
		false,
		false,
	] );
} );

test( 'refetches the mounted setup query with its original return URL after updating connection mode', async () => {
	const options = domainConnectionSetupInfoQuery( domainName, 123, redirectURL );
	queryClient.setQueryData< unknown >( options.queryKey, { connection_mode: 'suggested' } );
	const observer = new QueryObserver( queryClient, options );
	const unsubscribe = observer.subscribe( () => {} );
	const updateRequest = mockModeUpdate();
	const setupRequest = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ domainName }/mapping-setup-info/123` )
		.query( { redirect_uri: redirectURL } )
		.reply( 200, { connection_mode: 'advanced' } );

	try {
		await updateMode();
		await waitFor( () =>
			expect( observer.getCurrentResult().data?.connection_mode ).toBe( 'advanced' )
		);
		expect( updateRequest.isDone() ).toBe( true );
		expect( setupRequest.isDone() ).toBe( true );
	} finally {
		unsubscribe();
	}
} );
