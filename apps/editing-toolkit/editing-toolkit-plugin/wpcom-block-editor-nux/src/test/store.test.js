import { dispatch, select } from '@wordpress/data';
import waitForExpect from 'wait-for-expect';
import { store, DEFAULT_VARIANT } from '../store';

beforeAll( () => {
	jest.useRealTimers(); // Required for wait-for-expect to work.
} );

let originalFetch;
beforeEach( () => {
	dispatch( store ).resetStore();
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

	dispatch( store ).fetchWelcomeGuideStatus();
	await waitForExpect( () => expect( select( store ).isWelcomeGuideStatusLoaded() ).toBe( true ) );
	dispatch( store ).setShowWelcomeGuide( true, { openedManually: true } );
	dispatch( store ).setTourRating( 'thumbs-up' );

	dispatch( store ).resetStore();

	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( false );
	expect( select( store ).isWelcomeGuideShown() ).toBe( false );
	expect( select( store ).isWelcomeGuideStatusLoaded() ).toBe( false );
	expect( select( store ).getTourRating() ).toBeUndefined();
	expect( select( store ).getWelcomeGuideVariant() ).toBe( DEFAULT_VARIANT );
} );

test( "by default the store isn't loaded", () => {
	const isLoaded = select( store ).isWelcomeGuideStatusLoaded();
	expect( isLoaded ).toBe( false );
} );

test( 'after fetching the guide status the store is loaded', async () => {
	window.fetch.mockResolvedValue( {
		status: 200,
		json: () => Promise.resolve( { show_welcome_guide: true, variant: DEFAULT_VARIANT } ),
	} );

	dispatch( store ).fetchWelcomeGuideStatus();

	await waitForExpect( () => {
		const isLoaded = select( store ).isWelcomeGuideStatusLoaded();
		expect( isLoaded ).toBe( true );
	} );

	expect( window.fetch ).toHaveBeenCalledWith(
		'/wpcom/v2/block-editor/nux?_locale=user',
		expect.anything()
	);

	// Check the store is loaded with the state that came from the server
	const isWelcomeGuideShown = select( store ).isWelcomeGuideShown();
	expect( isWelcomeGuideShown ).toBe( true );
	const welcomeGuideVariant = select( store ).getWelcomeGuideVariant();
	expect( welcomeGuideVariant ).toBe( DEFAULT_VARIANT );
} );

test( 'toggle welcome guide visibility', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	dispatch( store ).setShowWelcomeGuide( true );
	expect( select( store ).isWelcomeGuideShown() ).toBe( true );

	dispatch( store ).setShowWelcomeGuide( false );
	expect( select( store ).isWelcomeGuideShown() ).toBe( false );
} );

test( 'guide manually opened flag is false by default', () => {
	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( false );
} );

test( '"manually opened" flag can be set when opening welcome guide', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	dispatch( store ).setShowWelcomeGuide( true, { openedManually: true } );
	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( true );

	dispatch( store ).setShowWelcomeGuide( true, { openedManually: false } );
	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( false );
} );

test( 'leaving `openedManually` unspecified leaves the flag unchanged', () => {
	// setShowWelcomeGuide kicks off a save. This mock fixes unresolved promise
	// rejection errors that appear in CLI output
	window.fetch.mockResolvedValue( { status: 200, json: () => Promise.resolve( {} ) } );

	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( false );

	dispatch( store ).setShowWelcomeGuide( true, { openedManually: true } );
	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( true );

	dispatch( store ).setShowWelcomeGuide( false );
	expect( select( store ).isWelcomeGuideManuallyOpened() ).toBe( true );
} );

test( 'tour rating is "undefined" by default', () => {
	expect( select( store ).getTourRating() ).toBeUndefined();
} );

test( 'tour rating can be set to "thumbs-up" or "thumbs-down"', () => {
	dispatch( store ).setTourRating( 'thumbs-up' );
	expect( select( store ).getTourRating() ).toBe( 'thumbs-up' );

	dispatch( store ).setTourRating( 'thumbs-down' );
	expect( select( store ).getTourRating() ).toBe( 'thumbs-down' );
} );
