/**
 * @jest-environment jsdom
 */
import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { act, waitFor } from '@testing-library/react';
import { dispatch, useSelect } from '@wordpress/data';
import { MemoryRouter } from 'react-router';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import copySite from '../copy-site';
import type { SiteActions, SiteSelect } from '@automattic/data-stores';

jest.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	userPurchasesQuery: () => ( {
		queryKey: [ 'purchases' ],
		queryFn: async () => [],
	} ),
} ) );

const sourceSlug = 'source.wordpress.com';
const destinationSlug = 'destination.wordpress.com';
const source = {
	ID: 1,
	URL: `https://${ sourceSlug }`,
	site_owner: 123,
	plan: { product_slug: 'business-bundle' },
	options: { is_wpcom_atomic: true },
};
const destination = { ID: 2, URL: `https://${ destinationSlug }` };
const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' )!;

function deferred< T >() {
	let resolve!: ( value: T ) => void;
	let reject!: ( error: Error ) => void;
	const promise = new Promise< T >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { promise, resolve, reject };
}

function renderAssertions() {
	return renderHookWithProvider(
		() => {
			useSelect(
				( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( destinationSlug ),
				[]
			);
			return copySite.useAssertConditions?.();
		},
		{
			wrapper: ( { children }: { children: React.ReactNode } ) => (
				<MemoryRouter
					initialEntries={ [
						`/setup/copy-site/automated-copy?sourceSlug=${ sourceSlug }&siteSlug=${ destinationSlug }`,
					] }
				>
					{ children }
				</MemoryRouter>
			),
			initialState: { currentUser: { id: 123 } },
		}
	);
}

describe( 'copy site source validation', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...window.location, assign: jest.fn() },
		} );
	} );

	afterAll( () => Object.defineProperty( window, 'location', locationDescriptor ) );

	beforeEach( () => {
		jest.clearAllMocks();
		const siteActions = dispatch( SITE_STORE ) as SiteActions & {
			invalidateResolutionForStore: () => void;
		};
		siteActions.reset();
		siteActions.invalidateResolutionForStore();
	} );

	it.each( [ 'destination first', 'source first', 'destination fails' ] )(
		'waits for source details and features when %s',
		async ( order ) => {
			const sourceRequest = deferred< typeof source >();
			const destinationRequest = deferred< typeof destination >();
			const featuresRequest = deferred< { active: string[] } >();
			jest.mocked( wpcomRequest ).mockImplementation( ( { path } ) => {
				if ( path === `/sites/${ sourceSlug }` ) {
					return sourceRequest.promise;
				}
				if ( path === `/sites/${ destinationSlug }` ) {
					return destinationRequest.promise;
				}
				return Promise.resolve( source );
			} );
			jest.mocked( wpcom.req.get ).mockReturnValue( featuresRequest.promise );
			const { result } = renderAssertions();
			await waitFor( () => expect( wpcomRequest ).toHaveBeenCalledTimes( 2 ) );
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );

			if ( order !== 'source first' ) {
				await act( async () => {
					if ( order === 'destination fails' ) {
						destinationRequest.reject( new Error( 'Destination unavailable' ) );
					} else {
						destinationRequest.resolve( destination );
					}
				} );
			}
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );
			expect( window.location.assign ).not.toHaveBeenCalled();

			await act( async () => sourceRequest.resolve( source ) );
			await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/1/features' ) );
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );
			expect( window.location.assign ).not.toHaveBeenCalled();

			await act( async () => featuresRequest.resolve( { active: [ WPCOM_FEATURES_COPY_SITE ] } ) );
			await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.SUCCESS ) );
			if ( order === 'source first' ) {
				await act( async () => destinationRequest.resolve( destination ) );
			}
			expect( result.current?.state ).toBe( AssertConditionState.SUCCESS );
			expect( window.location.assign ).not.toHaveBeenCalled();
		}
	);

	it( 'rejects a failed source request', async () => {
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				path === `/sites/${ sourceSlug }`
					? Promise.reject( new Error( 'Source unavailable' ) )
					: Promise.resolve( destination )
			);
		const { result } = renderAssertions();
		await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.FAILURE ) );
		expect( result.current?.message ).toBe( 'Copy Site flow couldn´t fetch source site details.' );
		expect( window.location.assign ).toHaveBeenCalledWith( '/sites' );
	} );

	it.each( [ 'unavailable feature', 'failed features request' ] )(
		'rejects the source: %s',
		async ( outcome ) => {
			jest
				.mocked( wpcomRequest )
				.mockImplementation( ( { path } ) =>
					Promise.resolve( path === `/sites/${ destinationSlug }` ? destination : source )
				);
			if ( outcome === 'failed features request' ) {
				jest.mocked( wpcom.req.get ).mockRejectedValue( new Error( 'Features unavailable' ) );
			} else {
				jest.mocked( wpcom.req.get ).mockResolvedValue( { active: [] } );
			}
			const { result } = renderAssertions();
			await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.FAILURE ) );
			expect( window.location.assign ).toHaveBeenCalledWith( '/sites' );
		}
	);
} );
