/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * WordPress dependencies
 */
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import * as AdTracking from 'calypso/lib/analytics/ad-tracking';
import userUtils from 'calypso/lib/user/utils';

import * as AnonId from '../anon-id';

const mockLogErrorOrThrowInDevelopmentMode = jest.fn();
jest.mock( '../log-error', () => ( {
	logErrorOrThrowInDevelopmentMode: ( ...args ) => mockLogErrorOrThrowInDevelopmentMode( ...args ),
} ) );

jest.mock( 'calypso/lib/wp' );
const mockedRecordTracksEvent = jest.fn()
const mockedGetTracksAnonymousUserId = jest.fn()
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: (...args) => mockedRecordTracksEvent(...args),
	getTracksAnonymousUserId: (...args) => mockedGetTracksAnonymousUserId(...args),
} ) );
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
	jest.useRealTimers();
} );

describe( 'initializeAnonId', () => {
	it( 'should return null and log error when run under SSR', async () => {
		setSsrContext();
		await expect( AnonId.initializeAnonId() ).resolves.toBe( null );
		expect( mockLogErrorOrThrowInDevelopmentMode.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    "Trying to initialize anonId outside of a browser context.",
		  ],
		]
	` );
	} );

	it( 'should work as expected when the anonId is immediately available', async () => {
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		expect( await AnonId.initializeAnonId() ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
	} );

	it( 'should work as expected when the anonId is available after a few tries', async () => {
		jest.useFakeTimers();
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => undefined );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => '' );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 4 );
	} );

	it( 'should poll at intervals', async () => {
		jest.useFakeTimers();
		AnonId.initializeAnonId();
		const intervalMs = 50;
		jest.advanceTimersByTime( 0 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
		jest.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
		jest.advanceTimersByTime( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
		jest.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
		jest.advanceTimersByTime( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 3 );
		jest.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 3 );
		jest.clearAllTimers();
	} );

	it( 'should give up after many polling attempts and return null', async () => {
		jest.useFakeTimers();
		mockedGetTracksAnonymousUserId.mockImplementation( () => null );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 100 );
	} );

	it( 'should give up immediately and return null if immediately logged in', async () => {
		mockedGetTracksAnonymousUserId.mockImplementation( () => `anon-id-shouldn't-appear` );
		mockedIsLoggedIn.mockImplementationOnce( () => true );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 0 );
	} );

	it( 'should give up and return null if logged in', async () => {
		jest.useFakeTimers();
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => `anon-id-should't-appear` );
		mockedIsLoggedIn.mockImplementationOnce( () => false );
		mockedIsLoggedIn.mockImplementationOnce( () => false );
		mockedIsLoggedIn.mockImplementationOnce( () => true );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		jest.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
	} );
} );

describe( 'getAnonId', () => {
	it( 'should return null and log in SSR', async () => {
		setSsrContext();
		expect( await AnonId.getAnonId() ).toBeNull();
		expect( mockLogErrorOrThrowInDevelopmentMode.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    "Trying to getAnonId in non browser context.",
		  ],
		]
	` );
	} );

	it( 'should return the anonId from initialisation', async () => {
		const anonId = 'anon-id-234';
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => anonId );
		expect( await AnonId.initializeAnonId() ).toBe( anonId );
		expect( await AnonId.getAnonId() ).toBe( anonId );

		mockedIsLoggedIn.mockImplementationOnce( () => true );
		expect( await AnonId.initializeAnonId() ).toBe( null );
		expect( await AnonId.getAnonId() ).toBe( null );
	} );
} );
