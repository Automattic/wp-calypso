/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useAutoAssignLicense from '../use-auto-assign-license';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn(), replace: jest.fn() },
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( () => 42 ),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: jest.fn(),
			post: jest.fn(),
		},
	},
} ) );

const mockedGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;
const mockedPost = wpcom.req.post as jest.MockedFunction< typeof wpcom.req.post >;
const mockedRedirect = page.redirect as jest.MockedFunction< typeof page.redirect >;
const mockedReplace = page.replace as jest.MockedFunction< typeof page.replace >;

const SITE_ID = 123;

function apiLicense( license_key: string, issued_at: string ) {
	return { license_key, issued_at, blog_id: null, product: 'Jetpack Boost' };
}

function respondWithLicenses( items: ReturnType< typeof apiLicense >[] ) {
	mockedGet.mockResolvedValue( {
		items,
		total_items: items.length,
		items_per_page: 100,
		total_pages: 1,
	} );
}

function wrapper( { children }: { children: ReactNode } ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

function render( search = `?site_id=${ SITE_ID }&product_slug=jetpack-boost&receipt_id=999` ) {
	window.history.replaceState( {}, '', `/purchases/licenses${ search }` );
	return renderHook( () => useAutoAssignLicense(), { wrapper } );
}

describe( 'useAutoAssignLicense', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'assigns the single unassigned license matching the purchased product', async () => {
		respondWithLicenses( [
			apiLicense( 'jetpack-boost_abc', '2026-07-30 10:00:00' ),
			apiLicense( 'jetpack-scan_xyz', '2026-07-30 11:00:00' ),
		] );
		mockedPost.mockResolvedValue( {} );

		render();

		await waitFor( () => expect( mockedPost ).toHaveBeenCalled() );
		expect( mockedPost ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/license/jetpack-boost_abc/site',
			body: { site: SITE_ID, agency_id: 42 },
		} );
		await waitFor( () =>
			expect( mockedReplace ).toHaveBeenCalledWith( '/purchases/licenses', undefined, false, false )
		);
		expect( mockedRedirect ).not.toHaveBeenCalled();
	} );

	it( 'routes to the manual assign flow pre-filled with the site when several licenses match', async () => {
		respondWithLicenses( [
			apiLicense( 'jetpack-boost_older', '2026-07-29 10:00:00' ),
			apiLicense( 'jetpack-boost_newer', '2026-07-30 10:00:00' ),
		] );

		render();

		await waitFor( () =>
			expect( mockedRedirect ).toHaveBeenCalledWith(
				'/marketplace/assign-license?key=jetpack-boost_newer&site_id=123&source=sitesdashboard'
			)
		);
		expect( mockedPost ).not.toHaveBeenCalled();
	} );

	it( 'stays on the licenses list when no license matches the purchased product', async () => {
		respondWithLicenses( [ apiLicense( 'jetpack-scan_xyz', '2026-07-30 10:00:00' ) ] );

		render();

		await waitFor( () => expect( mockedReplace ).toHaveBeenCalled() );
		expect( mockedRedirect ).not.toHaveBeenCalled();
		expect( mockedPost ).not.toHaveBeenCalled();
	} );

	it( 'routes to the manual assign flow when the assignment request fails', async () => {
		respondWithLicenses( [ apiLicense( 'jetpack-boost_abc', '2026-07-30 10:00:00' ) ] );
		mockedPost.mockRejectedValue( new Error( 'Nope' ) );

		render();

		await waitFor( () =>
			expect( mockedRedirect ).toHaveBeenCalledWith(
				'/marketplace/assign-license?key=jetpack-boost_abc&site_id=123&source=sitesdashboard'
			)
		);
	} );

	it( 'does nothing on a plain visit to the licenses list', async () => {
		respondWithLicenses( [ apiLicense( 'jetpack-boost_abc', '2026-07-30 10:00:00' ) ] );

		render( '' );

		await waitFor( () => expect( mockedGet ).not.toHaveBeenCalled() );
		expect( mockedPost ).not.toHaveBeenCalled();
		expect( mockedRedirect ).not.toHaveBeenCalled();
		expect( mockedReplace ).not.toHaveBeenCalled();
	} );
} );
