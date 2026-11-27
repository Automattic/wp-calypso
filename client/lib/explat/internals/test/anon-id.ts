// @ts-nocheck - TODO: Fix TypeScript issues
import { vi } from 'vitest';
import * as AnonId from '../anon-id';

const mockLogInfo = vi.fn();
vi.mock( '../log-error', () => ( {
	logInfo: ( ...args ) => mockLogInfo( ...args ),
} ) );

vi.mock( 'calypso/lib/wp' );
const mockedRecordTracksEvent = vi.fn();
const mockedGetTracksAnonymousUserId = vi.fn();
const mockedGetTracksLoadPromise = vi.fn();
const mockedGetCurrentUser = vi.fn();
vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args ) => mockedRecordTracksEvent( ...args ),
	getTracksAnonymousUserId: ( ...args ) => mockedGetTracksAnonymousUserId( ...args ),
	getTracksLoadPromise: ( ...args ) => mockedGetTracksLoadPromise( ...args ),
	getCurrentUser: ( ...args ) => mockedGetCurrentUser( ...args ),
} ) );

function setSsrContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.window = undefined;
}

function setBrowserContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.window = {};
}

beforeEach( () => {
	vi.resetAllMocks();
	setBrowserContext();
	vi.useRealTimers();
} );

describe( 'initializeAnonId', () => {
	it( 'should return null and log info when run under SSR', async () => {
		setSsrContext();
		await expect( AnonId.initializeAnonId() ).resolves.toBe( null );
		expect( mockLogInfo.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "message": "Skipping anonId initialization outside of a browser context.",
		    },
		  ],
		]
	` );
	} );

	it( 'should work as expected when the anonId is immediately available', async () => {
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		expect( await AnonId.initializeAnonId() ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
	} );

	it( 'should work as expected when the anonId is available after a few tries', async () => {
		vi.useFakeTimers();
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => undefined );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => '' );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => 'anon-id-123' );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		vi.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( 'anon-id-123' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 4 );
	} );

	it( 'should poll at intervals', async () => {
		vi.useFakeTimers();
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		AnonId.initializeAnonId();
		const intervalMs = 50;
		vi.advanceTimersByTime( 0 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
		vi.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
		vi.advanceTimersByTime( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
		vi.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 2 );
		vi.advanceTimersByTime( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 3 );
		vi.advanceTimersByTime( intervalMs - 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 3 );
		vi.clearAllTimers();
	} );

	it( 'should give up after many polling attempts and return null', async () => {
		vi.useFakeTimers();
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		mockedGetTracksAnonymousUserId.mockImplementation( () => null );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		vi.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( null );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 100 );
	} );

	it( 'should attempt once and return the anonId if immediately logged in', async () => {
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		mockedGetTracksAnonymousUserId.mockImplementation( () => 'the-anon-id' );
		mockedGetCurrentUser.mockImplementationOnce( () => ( {} ) );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		expect( await initializeAnonIdPromise ).toBe( 'the-anon-id' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
	} );

	it( 'should attempt before checking for being logged in', async () => {
		vi.useFakeTimers();
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.resolve() );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => 'the-anon-id' );
		mockedGetCurrentUser.mockImplementationOnce( () => undefined );
		mockedGetCurrentUser.mockImplementationOnce( () => undefined );
		mockedGetCurrentUser.mockImplementationOnce( () => ( {} ) );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		vi.runAllTimers();
		expect( await initializeAnonIdPromise ).toBe( 'the-anon-id' );
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 3 );
	} );

	it( "should give up and return null if tracks doesn't load", async () => {
		vi.useFakeTimers();
		mockedGetTracksLoadPromise.mockImplementationOnce( () => Promise.reject() );
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => null );
		mockedGetCurrentUser.mockImplementationOnce( () => undefined );
		const initializeAnonIdPromise = AnonId.initializeAnonId();
		expect( await initializeAnonIdPromise ).toBe( null );
		vi.runAllTimers();
		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedGetTracksAnonymousUserId.mock.calls.length ).toBe( 1 );
	} );
} );

describe( 'getAnonId', () => {
	it( 'should return null and log info in SSR', async () => {
		setSsrContext();
		expect( await AnonId.getAnonId() ).toBeNull();
		expect( mockLogInfo.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "message": "Skipping getAnonId in non-browser context.",
		    },
		  ],
		]
	` );
	} );

	it( 'should return the anonId from initialisation', async () => {
		const anonId = 'anon-id-234';
		mockedGetTracksAnonymousUserId.mockImplementationOnce( () => anonId );
		expect( await AnonId.initializeAnonId() ).toBe( anonId );
		expect( await AnonId.getAnonId() ).toBe( anonId );

		mockedGetCurrentUser.mockImplementationOnce( () => ( {} ) );
		expect( await AnonId.initializeAnonId() ).toBe( null );
		expect( await AnonId.getAnonId() ).toBe( null );
	} );
} );
