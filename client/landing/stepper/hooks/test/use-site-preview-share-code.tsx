/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { useSite } from '../use-site';
import { useSitePreviewShareCode } from '../use-site-preview-share-code';
import type { SiteDetails } from '@automattic/data-stores';
import type { PropsWithChildren } from 'react';

jest.mock( '../use-site', () => ( { useSite: jest.fn() } ) );
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: jest.fn(), post: jest.fn() },
} ) );

const site = {
	ID: 123,
	is_coming_soon: true,
	is_wpcom_atomic: true,
	plan: { product_slug: PLAN_BUSINESS },
} as SiteDetails;
const previewLink = { code: 'preview-code', created_at: '2026-09-05' };

describe( 'useSitePreviewShareCode', () => {
	let queryClient: QueryClient;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		} );
		jest.mocked( useSite ).mockReturnValue( site );
		jest.mocked( wpcom.req.get ).mockResolvedValue( [] );
		jest.mocked( wpcom.req.post ).mockImplementation( async () => {
			jest.mocked( wpcom.req.get ).mockResolvedValue( [ previewLink ] );
			return previewLink;
		} );
	} );

	afterEach( () => {
		queryClient.clear();
		jest.useRealTimers();
	} );

	const render = () =>
		renderHook( useSitePreviewShareCode, {
			wrapper: ( { children }: PropsWithChildren ) => (
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			),
		} );

	const settle = async () => {
		for ( let i = 0; i < 5; i++ ) {
			await act( () => jest.advanceTimersByTimeAsync( 100 ) );
		}
	};

	it( 'creates one missing preview link and exposes its code', async () => {
		const { result } = render();
		await settle();
		expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
		expect( result.current.shareCode ).toBe( previewLink.code );
	} );

	it.each( [ { is_coming_soon: false }, { is_wpcom_atomic: false } ] )(
		'does not create a link from cached empty data for an ineligible site: %p',
		async ( overrides ) => {
			jest.mocked( useSite ).mockReturnValue( { ...site, ...overrides } );
			queryClient.setQueryData( [ 'site-preview-links', site.ID ], [] );
			render();
			await settle();
			expect( wpcom.req.get ).not.toHaveBeenCalled();
			expect( wpcom.req.post ).not.toHaveBeenCalled();
		}
	);

	it( 'does not automatically repeat a failed creation', async () => {
		jest.mocked( wpcom.req.post ).mockRejectedValueOnce( new Error( 'Preview creation failed' ) );
		render();
		await settle();
		expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'can create a link for another site after the previous site fails', async () => {
		jest.mocked( wpcom.req.post ).mockRejectedValueOnce( new Error( 'Preview creation failed' ) );
		const { result, rerender } = render();
		await settle();
		jest.mocked( useSite ).mockReturnValue( { ...site, ID: 456 } );
		rerender();
		await settle();
		expect( wpcom.req.post ).toHaveBeenCalledTimes( 2 );
		expect( wpcom.req.post ).toHaveBeenLastCalledWith( {
			path: '/sites/456/preview-links',
			apiNamespace: 'wpcom/v2',
		} );
		expect( result.current.shareCode ).toBe( previewLink.code );
	} );

	it( 'keeps a late creation response associated with the site that started it', async () => {
		const links = new Map< string, ( typeof previewLink )[] >();
		let finishFirstCreation: ( value: typeof previewLink ) => void = () => {};
		jest
			.mocked( wpcom.req.get )
			.mockImplementation( async ( { path }: { path: string } ) => links.get( path ) ?? [] );
		jest.mocked( wpcom.req.post ).mockImplementation( ( { path }: { path: string } ) => {
			if ( path === '/sites/123/preview-links' ) {
				return new Promise( ( resolve ) => {
					finishFirstCreation = ( value ) => {
						links.set( path, [ value ] );
						resolve( value );
					};
				} );
			}
			const link = { ...previewLink, code: 'second-site' };
			links.set( path, [ link ] );
			return Promise.resolve( link );
		} );
		const { result, rerender } = render();
		await settle();
		jest.mocked( useSite ).mockReturnValue( { ...site, ID: 456 } );
		rerender();
		await settle();
		finishFirstCreation( { ...previewLink, code: 'first-site' } );
		await settle();
		expect( wpcom.req.post ).toHaveBeenCalledTimes( 2 );
		expect( queryClient.getQueryData( [ 'site-preview-links', 123 ] ) ).toEqual( [
			{ ...previewLink, code: 'first-site' },
		] );
		expect( queryClient.getQueryData( [ 'site-preview-links', 456 ] ) ).toEqual( [
			{ ...previewLink, code: 'second-site' },
		] );
		expect( result.current.shareCode ).toBe( 'second-site' );
	} );
} );
