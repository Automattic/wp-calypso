/**
 * @jest-environment jsdom
 */

const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockSetTags = jest.fn();

jest.mock( '@sentry/browser', () => ( {
	init: ( ...args: unknown[] ) => mockInit( ...args ),
	captureException: ( ...args: unknown[] ) => mockCaptureException( ...args ),
	setTags: ( ...args: unknown[] ) => mockSetTags( ...args ),
} ) );

describe( 'notifications Sentry wrapper', () => {
	beforeEach( () => {
		// Reset the module so its `enabled` flag starts fresh for each case.
		jest.resetModules();
		mockInit.mockClear();
		mockCaptureException.mockClear();
		mockSetTags.mockClear();
	} );

	it( 'does not report until initialized', async () => {
		const { captureException } = await import( '../sentry' );
		captureException( new Error( 'boom' ) );
		expect( mockCaptureException ).not.toHaveBeenCalled();
	} );

	it( 'initializes Sentry and tags widget events', async () => {
		const { initSentry } = await import( '../sentry' );
		initSentry();
		expect( mockInit ).toHaveBeenCalledTimes( 1 );
		expect( mockSetTags ).toHaveBeenCalledWith(
			expect.objectContaining( { feature: 'notifications', surface: 'wp-admin-standalone' } )
		);
	} );

	it( 'reports once initialized, passing context as extra', async () => {
		const { initSentry, captureException } = await import( '../sentry' );
		initSentry();
		const error = new Error( 'boom' );
		captureException( error, { phase: 'createClient' } );
		expect( mockCaptureException ).toHaveBeenCalledWith( error, {
			extra: { phase: 'createClient' },
		} );
	} );

	it( 'initializes Sentry only once', async () => {
		const { initSentry } = await import( '../sentry' );
		initSentry();
		initSentry();
		expect( mockInit ).toHaveBeenCalledTimes( 1 );
	} );
} );
