/**
 * @vitest-environment jsdom
 */

import { dispatch, resolveSelect } from '@wordpress/data';
import { vi } from 'vitest';
import { register } from '../index';

const mockWpcomRequest = vi.fn();

vi.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: ( params: unknown ) => mockWpcomRequest( params ),
	canAccessWpcomApis: () => true,
} ) );

vi.mock( 'wpcom-proxy-request', async () => ( {
	...( await vi.importActual< typeof import( 'wpcom-proxy-request' ) >( 'wpcom-proxy-request' ) ),
	isCookieAuthMissing: () => false,
} ) );

const storeKey = register();

const storeResolveSelect = resolveSelect( storeKey ) as unknown as {
	isHelpCenterShown: () => Promise< boolean | undefined >;
};
const storeDispatch = dispatch( storeKey ) as unknown as {
	setCurrentUser: ( user: { ID: number } ) => Promise< unknown >;
	setShowHelpCenter: (
		show: boolean,
		options?: undefined,
		forceClose?: boolean
	) => Promise< unknown >;
};

describe( 'restoring the open state', () => {
	beforeAll( () => {
		window.localStorage.clear();
		// The user's preferences say they left the Help Center open.
		mockWpcomRequest.mockImplementation( ( { method }: { method?: string } ) =>
			Promise.resolve( method === 'PUT' ? {} : { calypso_preferences: { help_center_open: true } } )
		);
	} );

	it( 'reopens the Help Center once the user is known, when a page asked before that', async () => {
		// Like checkout on load: asked before the Help Center knows the user, so only local storage is read.
		expect( await storeResolveSelect.isHelpCenterShown() ).toBeFalsy();
		expect( mockWpcomRequest ).not.toHaveBeenCalled();

		await storeDispatch.setCurrentUser( { ID: 1 } );

		expect( await storeResolveSelect.isHelpCenterShown() ).toBe( true );
	} );

	it( "doesn't restore it again when the same user is set again", async () => {
		await storeDispatch.setShowHelpCenter( false, undefined, true );

		await storeDispatch.setCurrentUser( { ID: 1 } );

		expect( await storeResolveSelect.isHelpCenterShown() ).toBe( false );
	} );
} );
