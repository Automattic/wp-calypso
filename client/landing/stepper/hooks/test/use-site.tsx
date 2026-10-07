/**
 * @jest-environment jsdom
 */
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { act, waitFor } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import { MemoryRouter } from 'react-router';
import { defaultSiteDetails } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/test/lib/fixtures';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { requestSite } from 'calypso/state/sites/actions';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useSite, useSiteDetails } from '../use-site';
import type { SiteDetails } from '@automattic/data-stores';
import type { PropsWithChildren } from 'react';

let mockCreatedSiteId: number | undefined;
const site = { ...defaultSiteDetails, ID: 123, URL: 'https://destination.wordpress.com' };
const siteActions = dispatch( SITE_STORE );

jest.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => true ),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: () => ( {
		get: () => ( mockCreatedSiteId ? { siteId: mockCreatedSiteId } : undefined ),
	} ),
} ) );

const renderSite = ( fragment?: number | string, entry = '/setup?siteId=123' ) =>
	renderHookWithProvider(
		( { siteFragment }: { siteFragment?: number | string } ) => ( {
			details: useSiteDetails( siteFragment ),
			legacy: useSite( siteFragment ),
		} ),
		{
			initialProps: { siteFragment: fragment },
			wrapper: ( { children }: PropsWithChildren ) => (
				<MemoryRouter initialEntries={ [ entry ] }>{ children }</MemoryRouter>
			),
		}
	);

describe( 'useSiteDetails', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		jest.mocked( requestSite ).mockImplementation( () => jest.fn() );
		mockCreatedSiteId = undefined;
		siteActions.reset();
		siteActions.invalidateResolutionForStore();
		jest.mocked( wpcomRequest ).mockImplementation( () => new Promise( () => {} ) );
	} );

	it.each( [
		[ 123, '/setup?siteId=456&siteSlug=other.wordpress.com', 789, 123 ],
		[ 'destination.wordpress.com', '/setup?siteId=456', 789, 'destination.wordpress.com' ],
		[ undefined, '/setup?siteId=123&siteSlug=other.wordpress.com', 789, '123' ],
		[ undefined, '/setup?siteSlug=destination.wordpress.com', 789, 'destination.wordpress.com' ],
		[ undefined, '/setup', 123, 123 ],
	] as const )(
		'resolves %s at %s with session site %s using %s',
		async ( fragment, entry, createdSiteId, key ) => {
			mockCreatedSiteId = createdSiteId;
			jest.mocked( wpcomRequest ).mockResolvedValue( site );
			const { result } = renderSite( fragment, entry );

			expect( result.current.details.isLoading ).toBe( true );
			expect( result.current.details.isError ).toBe( false );
			expect( result.current.legacy ).toBeNull();
			await waitFor( () => expect( result.current.details.data ).toEqual( site ) );
			expect( result.current.details.isLoading ).toBe( false );
			expect( result.current.details.isError ).toBe( false );
			expect( result.current.legacy ).toEqual( site );
			expect( wpcomRequest ).toHaveBeenCalledTimes( 1 );
			expect( wpcomRequest ).toHaveBeenCalledWith( {
				path: `/sites/${ key }`,
				apiVersion: '1.1',
				query: 'force=wpcom',
			} );
			expect( requestSite ).toHaveBeenCalledWith( key );
		}
	);

	it( 'retries a failed numeric lookup using the same resolution key', async () => {
		let resolveRetry!: ( value: SiteDetails ) => void;
		const retry = new Promise< SiteDetails >( ( resolve ) => {
			resolveRetry = resolve;
		} );
		jest
			.mocked( wpcomRequest )
			.mockRejectedValueOnce( { error: 'http_request_failed', message: 'Request failed' } )
			.mockReturnValueOnce( retry );
		const { result } = renderSite( 123 );

		await waitFor( () => expect( result.current.details.isError ).toBe( true ) );
		expect( result.current.details.isLoading ).toBe( false );
		expect( result.current.legacy ).toBeNull();
		act( () => {
			result.current.details.refetch?.();
		} );
		await waitFor( () => expect( wpcomRequest ).toHaveBeenCalledTimes( 2 ) );
		expect( result.current.details.isLoading ).toBe( true );
		expect( result.current.details.isError ).toBe( false );
		await act( async () => resolveRetry( site ) );
		expect( result.current.details.data ).toEqual( site );
		expect( result.current.details.isLoading ).toBe( false );
		expect( result.current.legacy ).toEqual( site );
	} );

	it( 'keeps concurrent lookups independent when one fails', async () => {
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				path === '/sites/456'
					? Promise.reject( { error: 'unknown_blog', message: 'Unknown blog' } )
					: new Promise( () => {} )
			);
		const destination = renderSite( 123 );
		const source = renderSite( 456 );

		await waitFor( () => expect( source.result.current.details.isError ).toBe( true ) );
		expect( destination.result.current.details.isLoading ).toBe( true );
		expect( destination.result.current.details.isError ).toBe( false );
	} );

	it( 'resets lookup state when the requested site changes', async () => {
		jest.mocked( wpcomRequest ).mockRejectedValueOnce( {
			error: 'unknown_blog',
			message: 'Unknown blog',
		} );
		const { result, rerender } = renderSite( 456 );
		await waitFor( () => expect( result.current.details.isError ).toBe( true ) );

		rerender( { siteFragment: 123 } );
		expect( result.current.details.isLoading ).toBe( true );
		expect( result.current.details.isError ).toBe( false );
		expect( result.current.details.data ).toBeNull();
	} );

	it( 'returns an idle result without a destination', () => {
		const { result } = renderSite( undefined, '/setup' );

		expect( result.current.details ).toEqual( {
			data: null,
			isLoading: false,
			isError: false,
			refetch: undefined,
		} );
		expect( result.current.legacy ).toBeNull();
		expect( wpcomRequest ).not.toHaveBeenCalled();
		expect( requestSite ).not.toHaveBeenCalled();
	} );
} );
