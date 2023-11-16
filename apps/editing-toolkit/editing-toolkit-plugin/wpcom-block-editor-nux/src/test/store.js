import { dispatch, select } from '@wordpress/data';
import waitForExpect from 'wait-for-expect';
import { register, DEFAULT_VARIANT } from '../store';

const STORE_KEY = 'automattic/wpcom-welcome-guide';

beforeAll( () => {
	register();
	jest.useRealTimers(); // Required for wait-for-expect to work.
} );

let originalFetch;
beforeEach( () => {
	dispatch( STORE_KEY ).resetStore();
	originalFetch = window.fetch;
	window.fetch = jest.fn();
} );

afterEach( () => {
	window.fetch = originalFetch;
} );

test( 'resetting the store', async () => {
	window.fetch.mockResolvedValue( {
		status: 200,
		json: () => Promise.resolve( { show_welcome_guide: true, variant: 'modal' } ),
	} );

	dispatch( STORE_KEY ).fetchWelcomeGuideStatus();
	await waitForExpect( () =>
		expect( select( STORE_KEY ).isWelcomeGuideStatusLoaded() ).toBe( true )
	);
	dispatch( STORE_KEY ).setShowWelcomeGuide( true, { openedManually: true } );
	dispatch( STORE_KEY ).setTourRating( 'thumbs-up' );

	dispatch( STORE_KEY ).resetStore();

	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( false );
	expect( select( STORE_KEY ).isWelcomeGuideShown() ).toBe( false );
	expect( select( STORE_KEY ).isWelcomeGuideStatusLoaded() ).toBe( false );
	expect( select( STORE_KEY ).getTourRating() ).toBeUndefined();
	expect( select( STORE_KEY ).getWelcomeGuideVariant() ).toBe( DEFAULT_VARIANT );
} );

test( "by default the store isn't loaded", () => {
	const isLoaded = select( STORE_KEY ).isWelcomeGuideStatusLoaded();
	expect( isLoaded ).toBe( false );
} );

test( 'after fetching the guide status the store is loaded', async () => {
	window.fetch.mockResolvedValue( {
		status: 200,
		json: () => Promise.resolve( { show_welcome_guide: true, variant: DEFAULT_VARIANT } ),
	} );

	dispatch( STORE_KEY ).fetchWelcomeGuideStatus();

	await waitForExpect( () => {
		const isLoaded = select( STORE_KEY ).isWelcomeGuideStatusLoaded();
		expect( isLoaded ).toBe( true );
	} );

	expect( window.fetch ).toHaveBeenCalledWith(
		'/wpcom/v2/block-editor/nux?_locale=user',
		expect.anything()
	);

	// Check the store is loaded with the state that came from the server
	const isWelcomeGuideShown = select( STORE_KEY ).isWelcomeGuideShown();
	expect( isWelcomeGuideShown ).toBe( true );
	const welcomeGuideVariant = select( STORE_KEY ).getWelcomeGuideVariant();
	expect( welcomeGuideVariant ).toBe( DEFAULT_VARIANT );
} );

test( 'toggle welcome guide visibility', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	dispatch( STORE_KEY ).setShowWelcomeGuide( true );
	expect( select( STORE_KEY ).isWelcomeGuideShown() ).toBe( true );

	dispatch( STORE_KEY ).setShowWelcomeGuide( false );
	expect( select( STORE_KEY ).isWelcomeGuideShown() ).toBe( false );
} );

test( 'guide manually opened flag is false by default', () => {
	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( false );
} );

test( '"manually opened" flag can be set when opening welcome guide', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	dispatch( STORE_KEY ).setShowWelcomeGuide( true, { openedManually: true } );
	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( true );

	dispatch( STORE_KEY ).setShowWelcomeGuide( true, { openedManually: false } );
	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( false );
} );

test( 'leaving `openedManually` unspecified leaves the flag unchanged', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( false );

	dispatch( STORE_KEY ).setShowWelcomeGuide( true, { openedManually: true } );
	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( true );

	dispatch( STORE_KEY ).setShowWelcomeGuide( false );
	expect( select( STORE_KEY ).isWelcomeGuideManuallyOpened() ).toBe( true );
} );

test( 'tour rating is "undefined" by default', () => {
	expect( select( STORE_KEY ).getTourRating() ).toBeUndefined();
} );

test( 'tour rating can be set to "thumbs-up" or "thumbs-down"', () => {
	dispatch( STORE_KEY ).setTourRating( 'thumbs-up' );
	expect( select( STORE_KEY ).getTourRating() ).toBe( 'thumbs-up' );

	dispatch( STORE_KEY ).setTourRating( 'thumbs-down' );
	expect( select( STORE_KEY ).getTourRating() ).toBe( 'thumbs-down' );
} );
