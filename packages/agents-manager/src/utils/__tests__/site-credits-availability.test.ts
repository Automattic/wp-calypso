import {
	forgetSiteWithoutAiCredits,
	isSiteWithoutAiCredits,
	markSiteWithoutAiCredits,
} from '../site-credits-availability';

const STORAGE_KEY = 'agents-manager-sites-without-ai-credits';
const TTL_MS = 30 * 60 * 1000;

const storedMarks = () => JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );

describe( 'site credits availability', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-10-12T00:00:00Z' ) );
		window.sessionStorage.clear();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		jest.useRealTimers();
	} );

	it( 'knows nothing about a site until it answers 404', () => {
		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
	} );

	it( 'remembers each site that answered 404', () => {
		markSiteWithoutAiCredits( 123 );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( true );
		expect( isSiteWithoutAiCredits( 456 ) ).toBe( false );
	} );

	it( 'reads a mark another bundle stored in this tab', () => {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { 123: Date.now() } ) );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( true );
	} );

	it( 'forgets a site once it reports a balance', () => {
		markSiteWithoutAiCredits( 123 );
		markSiteWithoutAiCredits( 456 );

		forgetSiteWithoutAiCredits( 123 );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
		expect( isSiteWithoutAiCredits( 456 ) ).toBe( true );
	} );

	it( 'leaves storage alone when a site with no mark reports a balance', () => {
		const setItem = jest.spyOn( Storage.prototype, 'setItem' );

		forgetSiteWithoutAiCredits( 123 );

		expect( setItem ).not.toHaveBeenCalled();
	} );

	it( 'forgets a mark after 30 minutes', () => {
		markSiteWithoutAiCredits( 123 );

		jest.advanceTimersByTime( TTL_MS - 1 );
		expect( isSiteWithoutAiCredits( 123 ) ).toBe( true );

		jest.advanceTimersByTime( 1 );
		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
	} );

	it( 'drops expired marks when it adds one', () => {
		markSiteWithoutAiCredits( 123 );
		jest.advanceTimersByTime( TTL_MS );

		markSiteWithoutAiCredits( 456 );

		expect( Object.keys( storedMarks() ) ).toEqual( [ '456' ] );
	} );

	it.each( [
		[ 'not JSON', () => 'not json' ],
		[ 'not a time', () => JSON.stringify( { 123: 'yesterday' } ) ],
		[ 'from the future', () => JSON.stringify( { 123: Date.now() + 1 } ) ],
	] )( 'ignores a stored mark that is %s', ( _name, stored ) => {
		window.sessionStorage.setItem( STORAGE_KEY, stored() );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
	} );

	it( 'remembers nothing when storage is blocked', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		markSiteWithoutAiCredits( 123 );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
	} );

	it( 'drops every mark when storage reads but refuses a write, so none outlives its answer', () => {
		markSiteWithoutAiCredits( 123 );
		markSiteWithoutAiCredits( 456 );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'full' );
		} );

		forgetSiteWithoutAiCredits( 123 );

		expect( isSiteWithoutAiCredits( 123 ) ).toBe( false );
		expect( isSiteWithoutAiCredits( 456 ) ).toBe( false );
	} );
} );
