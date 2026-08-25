/**
 * @jest-environment jsdom
 */

import { createBuildWowFeedReader } from '../build-feed';
import type { BuildWowFeedDelta } from '../build-feed';

const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'createBuildWowFeedReader', () => {
	it( 'fetches the delta only when the reported seq advances past the cursor', async () => {
		const fetchFeed = jest.fn().mockResolvedValue( {
			run_id: 'run-a',
			latest_seq: 3,
			events: [ { seq: 1, type: 'identity' } ],
		} satisfies BuildWowFeedDelta );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 3 );
		await flush();
		expect( fetchFeed ).toHaveBeenCalledWith( '123', 0, expect.any( AbortSignal ) );
		expect( onDelta ).toHaveBeenCalledTimes( 1 );

		// Same or older seq: cursor is already at 3, no request.
		reader.onFeedSeq( 3 );
		reader.onFeedSeq( 2 );
		await flush();
		expect( fetchFeed ).toHaveBeenCalledTimes( 1 );

		reader.onFeedSeq( 5 );
		await flush();
		expect( fetchFeed ).toHaveBeenLastCalledWith( '123', 3, expect.any( AbortSignal ) );

		reader.stop();
	} );

	it( 'does not report empty deltas', async () => {
		const fetchFeed = jest.fn().mockResolvedValue( { run_id: 'run-a', latest_seq: 2, events: [] } );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 2 );
		await flush();
		expect( onDelta ).not.toHaveBeenCalled();

		reader.stop();
	} );

	it( 'coalesces seq reports that arrive while a request is in flight', async () => {
		let resolveFirst: ( delta: BuildWowFeedDelta ) => void = () => {};
		const fetchFeed = jest
			.fn()
			.mockImplementationOnce( () => new Promise( ( resolve ) => ( resolveFirst = resolve ) ) )
			.mockResolvedValue( { run_id: 'run-a', latest_seq: 6, events: [ { seq: 6, type: 'x' } ] } );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 2 );
		await flush();
		reader.onFeedSeq( 4 );
		reader.onFeedSeq( 6 );
		expect( fetchFeed ).toHaveBeenCalledTimes( 1 );

		resolveFirst( { run_id: 'run-a', latest_seq: 2, events: [ { seq: 2, type: 'x' } ] } );
		await flush();
		// One follow-up request for everything that arrived meanwhile.
		expect( fetchFeed ).toHaveBeenCalledTimes( 2 );
		expect( fetchFeed ).toHaveBeenLastCalledWith( '123', 2, expect.any( AbortSignal ) );

		reader.stop();
	} );

	it( 'resets the cursor and reports a reset when the run id changes', async () => {
		const fetchFeed = jest
			.fn()
			.mockResolvedValueOnce( {
				run_id: 'run-a',
				latest_seq: 4,
				events: [ { seq: 4, type: 'palette' } ],
			} )
			.mockResolvedValueOnce( {
				run_id: 'run-b',
				latest_seq: 1,
				events: [ { seq: 1, type: 'identity' } ],
			} )
			// A faithful server filters by `since`, so a caught-up cursor
			// yields an empty delta.
			.mockImplementation( ( _site: string, since: number ) =>
				Promise.resolve( {
					run_id: 'run-b',
					latest_seq: 1,
					events: since < 1 ? [ { seq: 1, type: 'identity' } ] : [],
				} )
			);
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 4 );
		await flush();
		reader.onFeedSeq( 5 );
		await flush();

		const resetDelta = onDelta.mock.calls.find( ( [ delta ] ) => delta.reset )?.[ 0 ];
		expect( resetDelta ).toBeDefined();
		expect( resetDelta.events ).toEqual( [] );
		// After the reset the reader replayed the new run from 0 and delivered
		// its events.
		expect( fetchFeed ).toHaveBeenCalledWith( '123', 0, expect.any( AbortSignal ) );
		expect(
			onDelta.mock.calls.some(
				( [ delta ] ) =>
					delta.events?.some( ( event: { type: string } ) => event.type === 'identity' )
			)
		).toBe( true );

		reader.stop();
	} );

	it( 'does not hot-loop on a pending seq the server cannot satisfy', async () => {
		// The feed is cleared at `live`: status reported seq 5, but the feed
		// endpoint now has nothing. One request, then wait for the next poll.
		const fetchFeed = jest.fn().mockResolvedValue( { run_id: '', latest_seq: 0, events: [] } );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 5 );
		await flush();
		await flush();
		expect( fetchFeed ).toHaveBeenCalledTimes( 1 );
		expect( onDelta ).not.toHaveBeenCalled();

		reader.stop();
	} );

	it( 'stop() aborts and silences the reader', async () => {
		const fetchFeed = jest.fn().mockResolvedValue( {
			run_id: 'run-a',
			latest_seq: 1,
			events: [ { seq: 1, type: 'identity' } ],
		} );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.stop();
		reader.onFeedSeq( 1 );
		await flush();
		expect( fetchFeed ).not.toHaveBeenCalled();
		expect( onDelta ).not.toHaveBeenCalled();
	} );

	it( 'a failed request retries from the same cursor on the next advance', async () => {
		const fetchFeed = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'network' ) )
			.mockResolvedValue( { run_id: 'run-a', latest_seq: 2, events: [ { seq: 2, type: 'x' } ] } );
		const onDelta = jest.fn();
		const reader = createBuildWowFeedReader( { siteIdentifier: '123', onDelta, fetchFeed } );

		reader.onFeedSeq( 1 );
		await flush();
		expect( onDelta ).not.toHaveBeenCalled();

		reader.onFeedSeq( 2 );
		await flush();
		expect( fetchFeed ).toHaveBeenLastCalledWith( '123', 0, expect.any( AbortSignal ) );
		expect( onDelta ).toHaveBeenCalledTimes( 1 );

		reader.stop();
	} );
} );
