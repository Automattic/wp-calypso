/* eslint-disable @typescript-eslint/ban-ts-comment */
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import * as Tracks from 'calypso/lib/analytics/tracks';
import * as AdTracking from 'calypso/lib/analytics/ad-tracking';
import userUtils from 'calypso/lib/user/utils';

import * as AnonId from '../anon-id';
import * as LogError from '../log-error';

const mockLogError = jest.spyOn( LogError, 'logError' );

jest.mock( 'calypso/lib/wp' );
jest.mock( 'calypso/lib/analytics/tracks' );
const mockedRecordTracksEvent = Tracks.recordTracksEvent as jest.MockedFunction<
	( event: string ) => void
>;
// We have to mock this lib like this as automocking will try to pull in external packages and
// that doesn't seem to work.
jest.mock( 'calypso/lib/analytics/ad-tracking', () => ( {
	tracksAnonymousUserId: jest.fn(),
} ) );
const mockedTracksAnonymousUserId = AdTracking.tracksAnonymousUserId as jest.MockedFunction<
	() => string | null
>;
jest.mock( 'calypso/lib/user/utils' );
const mockedIsLoggedIn = jest.spyOn( userUtils, 'isLoggedIn' );

function setSsrContext() {
	// @ts-ignore
	global.window = undefined;
}

function setBrowserContext() {
	// @ts-ignore
	global.window = {};
}

beforeEach( () => {
	jest.resetAllMocks();
	setBrowserContext();
} );

describe( 'initializeAnonId', () => {
	it( 'should return null and log error when run under SSR', async () => {
		setSsrContext();
		await expect( AnonId.initializeAnonId() ).resolves.toBe( null );
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "message": "Trying to initialize anonId outside of a browser context.",
		    },
		  ],
		]
	` );
	} );

	it( 'should work as expected when the anonId is immediately available', async () => {
		mockedTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		expect( await AnonId.initializeAnonId() ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
	} );

	it( 'should work as expected when the anonId is available after a few tries', async () => {
		jest.useFakeTimers();
		mockedTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedTracksAnonymousUserId.mockImplementationOnce( () => undefined );
		mockedTracksAnonymousUserId.mockImplementationOnce( () => '' );
		mockedTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedTracksAnonymousUserId.mock.calls.length ).toBe( 4 );
		jest.useRealTimers();
	} );

	it( 'should give up after many polling attempts and return null', async () => {
		jest.useFakeTimers();
		mockedTracksAnonymousUserId.mockImplementation( () => null );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedTracksAnonymousUserId.mock.calls.length ).toBe( 100 );
		jest.useRealTimers();
	} );

	it( 'should give up immediately and return null if immediately logged in', async () => {
		mockedTracksAnonymousUserId.mockImplementation( () => `anon-id-shouldn't-appear` );
		mockedIsLoggedIn.mockImplementationOnce( () => true );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedTracksAnonymousUserId.mock.calls.length ).toBe( 0 );
	} );

	it( 'should give up and return null if logged in', async () => {
		jest.useFakeTimers();
		mockedTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedTracksAnonymousUserId.mockImplementationOnce( () => `anon-id-should't-appear` );
		mockedIsLoggedIn.mockImplementationOnce( () => false );
		mockedIsLoggedIn.mockImplementationOnce( () => false );
		mockedIsLoggedIn.mockImplementationOnce( () => true );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
		jest.useRealTimers();
	} );
} );

describe( 'getAnonId', () => {
	it( 'should return null and log in SSR', async () => {
		setSsrContext();
		expect( await AnonId.getAnonId() ).toBeNull();
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "message": "Trying to getAnonId in non browser context.",
		    },
		  ],
		]
	` );
	} );

	it( 'should return the anonId from initialisation', async () => {
		const anonId = 'anon-id-234';
		mockedTracksAnonymousUserId.mockImplementationOnce( () => anonId );
		expect( await AnonId.initializeAnonId() ).toBe( anonId );
		expect( await AnonId.getAnonId() ).toBe( anonId );

		mockedIsLoggedIn.mockImplementationOnce( () => true );
		expect( await AnonId.initializeAnonId() ).toBe( null );
		expect( await AnonId.getAnonId() ).toBe( null );
	} );
} );
