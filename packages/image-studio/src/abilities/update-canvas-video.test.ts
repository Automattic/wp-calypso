/**
 * Tests for the update-canvas-video ability.
 *
 * Verifies that registration is idempotent, the callback dispatches
 * `setCurrentVideoUrl` to the video studio store with the input URL, and that
 * malformed input is rejected.
 */
/* eslint-disable import/order */

const mockRegisterAbility = jest.fn();
const mockRegisterAbilityCategory = jest.fn();
const mockSetCurrentVideoUrl = jest.fn().mockResolvedValue( undefined );
const mockDispatch = jest.fn( () => ( { setCurrentVideoUrl: mockSetCurrentVideoUrl } ) );

jest.mock(
	'@wordpress/abilities',
	() => ( {
		registerAbility: ( ...args: unknown[] ) => mockRegisterAbility( ...args ),
		registerAbilityCategory: ( ...args: unknown[] ) => mockRegisterAbilityCategory( ...args ),
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/data', () => ( {
	dispatch: ( ...args: unknown[] ) => mockDispatch( ...args ),
	createReduxStore: jest.fn( ( storeName: string, config: Record< string, unknown > ) => ( {
		name: storeName,
		...config,
	} ) ),
	register: jest.fn(),
	select: jest.fn( () => null ),
} ) );

type AbilityCallback = ( input: unknown ) => Promise< unknown >;

function getRegisteredCallback(): AbilityCallback {
	const lastCall = mockRegisterAbility.mock.calls.at( -1 );
	if ( ! lastCall ) {
		throw new Error( 'registerAbility was not called' );
	}
	return ( lastCall[ 0 ] as { callback: AbilityCallback } ).callback;
}

describe( 'registerUpdateCanvasVideoAbility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockRegisterAbilityCategory.mockResolvedValue( undefined );
		mockRegisterAbility.mockResolvedValue( undefined );
		// Reset module-level isRegistered guard between tests.
		jest.resetModules();
	} );

	it( 'registers the ability with the expected name and required schema', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		// The 'image-studio' category is owned by registerUpdateCanvasImageAbility.
		// This ability must NOT re-register the category — doing so previously triggered
		// an "already registered" error that silently hid the ability at runtime.
		expect( mockRegisterAbilityCategory ).not.toHaveBeenCalled();
		expect( mockRegisterAbility ).toHaveBeenCalledTimes( 1 );

		const config = mockRegisterAbility.mock.calls[ 0 ][ 0 ] as {
			name: string;
			category: string;
			input_schema: { required: string[] };
		};
		expect( config.name ).toBe( 'image-studio/update-canvas-video' );
		expect( config.category ).toBe( 'image-studio' );
		expect( config.input_schema.required ).toEqual( [ 'url', 'attachmentId' ] );
	} );

	it( 'does not silently swallow non-ability errors thrown during registration', async () => {
		// Regression: a bare "already registered" substring check used to swallow
		// category-registration failures, which skipped registerAbility() entirely.
		// Any error that is NOT specifically about this ability must surface.
		mockRegisterAbility.mockRejectedValueOnce(
			new Error( 'Category "image-studio" already registered' )
		);

		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await expect( registerUpdateCanvasVideoAbility() ).rejects.toThrow(
			/Category "image-studio" already registered/
		);
	} );

	it( 'is idempotent across repeated calls', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();
		await registerUpdateCanvasVideoAbility();
		await registerUpdateCanvasVideoAbility();

		expect( mockRegisterAbility ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'treats an "already registered" error for this ability as a successful registration', async () => {
		mockRegisterAbility.mockRejectedValueOnce(
			new Error( 'Ability `image-studio/update-canvas-video` is already registered' )
		);

		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await expect( registerUpdateCanvasVideoAbility() ).resolves.toBeUndefined();

		// A subsequent call should not attempt to register again.
		await registerUpdateCanvasVideoAbility();
		expect( mockRegisterAbility ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'dispatches setCurrentVideoUrl with the input URL', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		const result = await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: 42,
		} );

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledTimes( 1 );
		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( 'https://files.wordpress.com/clip.mp4' );
		expect( result ).toEqual( { ok: true } );
	} );

	it( 'accepts a stringified attachmentId', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: '99',
		} );

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( 'https://files.wordpress.com/clip.mp4' );
	} );

	it( 'rejects when the URL is missing', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await expect( callback( { attachmentId: 42 } ) ).rejects.toThrow( /url is required/ );
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'rejects when attachmentId is missing or non-positive', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await expect( callback( { url: 'https://files.wordpress.com/clip.mp4' } ) ).rejects.toThrow(
			/attachmentId/
		);
		await expect(
			callback( { url: 'https://files.wordpress.com/clip.mp4', attachmentId: 0 } )
		).rejects.toThrow( /attachmentId/ );
		await expect(
			callback( { url: 'https://files.wordpress.com/clip.mp4', attachmentId: -3 } )
		).rejects.toThrow( /attachmentId/ );
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );
} );
