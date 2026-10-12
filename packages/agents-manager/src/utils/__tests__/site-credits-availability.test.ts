import {
	clearKnownSiteCredits,
	getKnownSiteCredits,
	setKnownSiteCredits,
} from '../site-credits-availability';

const STORAGE_KEY = 'agents-manager-site-credits';
const TTL_MS = 30 * 60 * 1000;

describe( 'site credits availability', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-10-12T00:00:00Z' ) );
		clearKnownSiteCredits();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		jest.useRealTimers();
	} );

	it( 'knows nothing about a site until it learns', () => {
		expect( getKnownSiteCredits( 123 ) ).toBeUndefined();
	} );

	it( 'remembers each site’s answer', () => {
		setKnownSiteCredits( 123, false );
		setKnownSiteCredits( 456, true );

		expect( getKnownSiteCredits( 123 ) ).toBe( false );
		expect( getKnownSiteCredits( 456 ) ).toBe( true );
	} );

	it( 'reads an answer another bundle stored in this tab', () => {
		window.sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify( { 123: { usesAiCredits: false, at: Date.now() } } )
		);

		expect( getKnownSiteCredits( 123 ) ).toBe( false );
	} );

	it( 'forgets an answer after 30 minutes', () => {
		setKnownSiteCredits( 123, false );

		jest.advanceTimersByTime( TTL_MS - 1 );
		expect( getKnownSiteCredits( 123 ) ).toBe( false );

		jest.advanceTimersByTime( 1 );
		expect( getKnownSiteCredits( 123 ) ).toBeUndefined();
	} );

	it( 'drops expired answers when it learns a new one', () => {
		setKnownSiteCredits( 123, false );
		jest.advanceTimersByTime( TTL_MS );
		setKnownSiteCredits( 456, false );

		expect(
			Object.keys( JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) ?? '' ) )
		).toEqual( [ '456' ] );
	} );

	it.each( [
		[ 'not JSON', () => 'not json' ],
		[ 'the wrong shape', () => JSON.stringify( { 123: { usesAiCredits: 'no', at: Date.now() } } ) ],
		[
			'from the future',
			() => JSON.stringify( { 123: { usesAiCredits: false, at: Date.now() + 1 } } ),
		],
	] )( 'ignores a stored answer that is %s', ( _name, stored ) => {
		window.sessionStorage.setItem( STORAGE_KEY, stored() );

		expect( getKnownSiteCredits( 123 ) ).toBeUndefined();
	} );

	it( 'keeps answers for the page load when storage is blocked', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		setKnownSiteCredits( 123, false );

		expect( getKnownSiteCredits( 123 ) ).toBe( false );
	} );
} );
