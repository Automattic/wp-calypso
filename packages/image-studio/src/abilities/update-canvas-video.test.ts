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
const mockSetCurrentAttachmentId = jest.fn().mockResolvedValue( undefined );
const mockSetCurrentDurationSeconds = jest.fn().mockResolvedValue( undefined );
const mockDispatch = jest.fn( () => ( {
	setCurrentVideoUrl: mockSetCurrentVideoUrl,
	setCurrentAttachmentId: mockSetCurrentAttachmentId,
	setCurrentDurationSeconds: mockSetCurrentDurationSeconds,
} ) );

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
	let originalCreateElement: typeof document.createElement;

	beforeEach( () => {
		jest.clearAllMocks();
		mockRegisterAbilityCategory.mockResolvedValue( undefined );
		mockRegisterAbility.mockResolvedValue( undefined );
		// Reset module-level isRegistered guard between tests.
		jest.resetModules();

		// preloadVideo() inside the ability creates a <video>, sets src, and waits
		// for onloadedmetadata / onerror — neither of which fire reliably in jsdom,
		// so it falls back to a 3s setTimeout. With multiple callback invocations
		// per test that tips us past Jest's 5s timeout. Stub createElement('video')
		// so onloadedmetadata fires synchronously when src is assigned.
		originalCreateElement = document.createElement.bind( document );
		jest
			.spyOn( document, 'createElement' )
			.mockImplementation( ( tagName: string, options?: ElementCreationOptions ) => {
				const element = originalCreateElement( tagName, options );
				if ( tagName.toLowerCase() === 'video' ) {
					Object.defineProperty( element, 'src', {
						configurable: true,
						set() {
							const handler = ( element as HTMLVideoElement ).onloadedmetadata;
							if ( typeof handler === 'function' ) {
								handler.call( element, new Event( 'loadedmetadata' ) );
							}
						},
						get() {
							return '';
						},
					} );
				}
				return element;
			} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
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

	it( 'persists attachmentId and durationSeconds alongside the URL', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: 42,
			durationSeconds: 8,
		} );

		expect( mockSetCurrentAttachmentId ).toHaveBeenCalledTimes( 1 );
		expect( mockSetCurrentAttachmentId ).toHaveBeenCalledWith( 42 );
		expect( mockSetCurrentDurationSeconds ).toHaveBeenCalledTimes( 1 );
		expect( mockSetCurrentDurationSeconds ).toHaveBeenCalledWith( 8 );
	} );

	it( 'normalizes a missing or non-positive durationSeconds to null', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: 42,
		} );

		expect( mockSetCurrentDurationSeconds ).toHaveBeenLastCalledWith( null );

		await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: 42,
			durationSeconds: 0,
		} );

		expect( mockSetCurrentDurationSeconds ).toHaveBeenLastCalledWith( null );
	} );

	it( 'accepts a numeric attachmentId', async () => {
		const { registerUpdateCanvasVideoAbility } = await import( './update-canvas-video' );
		await registerUpdateCanvasVideoAbility();

		const callback = getRegisteredCallback();
		await callback( {
			url: 'https://files.wordpress.com/clip.mp4',
			attachmentId: 99,
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
