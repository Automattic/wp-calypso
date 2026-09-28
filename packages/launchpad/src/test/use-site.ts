/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useSite } from '../use-site';
import wpcomRequest, { canAccessWpcomApis } from '../wpcom-request';

jest.mock( '../wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn(),
} ) );

const request = wpcomRequest as jest.Mock;
const canAccess = canAccessWpcomApis as jest.Mock;

const render = () => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( QueryClientProvider, { client }, children );
	return renderHook( () => useSite( 'example.wordpress.com' ), { wrapper } );
};

describe( 'useSite', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'keeps only the fields Launchpad reads, so the rest of the site is never cached', async () => {
		canAccess.mockReturnValue( true );
		request.mockResolvedValue( {
			slug: 'example.wordpress.com',
			URL: 'https://example.wordpress.com',
			options: {
				site_intent: 'build',
				site_goals: [ 'sell' ],
				jetpack_connection_active_plugins: [],
			},
			capabilities: { manage_options: true },
		} );

		const { result } = render();

		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( result.current ).toEqual( {
			slug: 'example.wordpress.com',
			URL: 'https://example.wordpress.com',
			options: { site_intent: 'build', site_goals: [ 'sell' ] },
		} );
	} );

	it( 'does not request where the proxy is unavailable, since there is no fallback', () => {
		canAccess.mockReturnValue( false );

		const { result } = render();

		expect( request ).not.toHaveBeenCalled();
		expect( result.current ).toBeNull();
	} );
} );
