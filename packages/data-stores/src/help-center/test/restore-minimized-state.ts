/**
 * @jest-environment jsdom
 */

const mockWpcomRequest = jest.fn();

jest.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: ( params: unknown ) => mockWpcomRequest( params ),
	canAccessWpcomApis: () => true,
} ) );

jest.mock( 'wpcom-proxy-request', () => ( {
	...jest.requireActual( 'wpcom-proxy-request' ),
	isCookieAuthMissing: () => false,
} ) );

// Each test gets its own store, so one that knows the user doesn't leak into the next.
async function registerStore() {
	jest.resetModules();
	const { dispatch, resolveSelect } = await import( '@wordpress/data' );
	const { register } = await import( '../index' );
	const storeKey = register();

	return {
		resolveSelect: resolveSelect( storeKey ) as unknown as {
			getIsMinimized: () => Promise< boolean | undefined >;
		},
		dispatch: dispatch( storeKey ) as unknown as {
			setCurrentUser: ( user: { ID: number } ) => Promise< unknown >;
			setIsMinimized: ( minimized: boolean ) => Promise< unknown >;
		},
	};
}

describe( 'restoring the minimized state', () => {
	beforeEach( () => {
		window.localStorage.clear();
		// The user's preferences say they left the Help Center minimized.
		mockWpcomRequest.mockReset();
		mockWpcomRequest.mockImplementation( ( { method }: { method?: string } ) =>
			Promise.resolve(
				method === 'PUT'
					? {}
					: { calypso_preferences: { help_center_open: true, help_center_minimized: true } }
			)
		);
	} );

	it( 'minimizes the Help Center once the user is known, when a page asked before that', async () => {
		const store = await registerStore();

		// Asked before the Help Center knows the user, so only local storage is read.
		expect( await store.resolveSelect.getIsMinimized() ).toBeFalsy();
		expect( mockWpcomRequest ).not.toHaveBeenCalled();

		await store.dispatch.setCurrentUser( { ID: 1 } );

		expect( await store.resolveSelect.getIsMinimized() ).toBe( true );
	} );

	it( "doesn't minimize it again when the same user is set again", async () => {
		const store = await registerStore();
		await store.dispatch.setCurrentUser( { ID: 1 } );
		expect( await store.resolveSelect.getIsMinimized() ).toBe( true );

		await store.dispatch.setIsMinimized( false );
		await store.dispatch.setCurrentUser( { ID: 1 } );

		expect( await store.resolveSelect.getIsMinimized() ).toBe( false );
	} );

	it( "doesn't minimize a Help Center that a page opened before the user was known", async () => {
		const store = await registerStore();

		// Like a launcher button that un-minimizes and opens the Help Center as soon as the store exists.
		await store.dispatch.setIsMinimized( false );
		await store.dispatch.setCurrentUser( { ID: 1 } );

		expect( await store.resolveSelect.getIsMinimized() ).toBe( false );
	} );
} );
