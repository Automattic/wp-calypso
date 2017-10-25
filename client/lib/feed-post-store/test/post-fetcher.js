/** @format */

jest.mock( 'lib/feed-post-store', () => ( {
	get: postKey => ( postKey.postId === 1 ? {} : null ),
} ) );
jest.useFakeTimers();
/**
 * Internal dependencies
 */
import PostFetcher from '../post-fetcher';

describe( 'PostFetcher', () => {
	let myFetcher, onFetch, onPostReceived, onError, makeRequest;
	beforeEach( () => {
		onFetch = jest.fn();
		onPostReceived = jest.fn();
		onError = jest.fn();
		makeRequest = jest.fn();
		myFetcher = new PostFetcher( {
			onFetch,
			onPostReceived,
			onError,
			makeRequest,
		} );
	} );
	test( 'is defined', () => {
		expect( myFetcher ).toBeTruthy();
	} );

	test( 'add queues up a batch if no batch is queued', () => {
		myFetcher.add( { feedId: 1, postId: 2 } );
		expect( setTimeout.mock.calls.length ).toBe( 1 );
		jest.clearAllTimers();
	} );

	test( 'a successful batch calls the right handlers', () => {
		const postKey = { feedId: 1, postId: 2 };
		const data = {};
		const requestPromise = Promise.resolve( data );

		myFetcher.add( postKey );
		makeRequest.mockReturnValueOnce( requestPromise );

		jest.runOnlyPendingTimers();

		expect( myFetcher.batchQueued ).toBe( false );
		expect( onFetch ).toHaveBeenCalledTimes( 1 );
		expect( myFetcher.postsToFetch.size ).toBe( 0 );

		return requestPromise.then( () => {
			expect( onPostReceived ).toHaveBeenCalledWith( 1, 2, data );
		} );
	} );

	test( 'a failed batch calls the right handlers', () => {
		const postKey = { feedId: 1, postId: 2 };
		const err = {};
		const requestPromise = Promise.reject( err );

		myFetcher.add( postKey );
		makeRequest.mockReturnValueOnce( requestPromise );

		jest.runOnlyPendingTimers();

		expect( myFetcher.batchQueued ).toBe( false );
		expect( onFetch ).toHaveBeenCalledTimes( 1 );
		expect( myFetcher.postsToFetch.size ).toBe( 0 );

		return requestPromise.catch( () => {
			expect( onError ).toHaveBeenCalledWith( err, postKey );
		} );
	} );

	test( 'calling add twice for the same key only runs one batch', () => {
		const postKey = { feedId: 1, postId: 2 };
		const data = {};
		const requestPromise = Promise.resolve( data );

		myFetcher.add( postKey );
		myFetcher.add( postKey );
		makeRequest.mockReturnValueOnce( requestPromise );

		jest.runOnlyPendingTimers();

		expect( myFetcher.batchQueued ).toBe( false );
		expect( onFetch ).toHaveBeenCalledTimes( 1 );
		expect( myFetcher.postsToFetch.size ).toBe( 0 );

		return requestPromise.then( () => {
			expect( onPostReceived ).toHaveBeenCalledWith( 1, 2, data );
		} );
	} );

	test( 'batching a known key does not fetch', () => {
		const postKey = { feedId: 1, postId: 1 };

		myFetcher.add( postKey );

		jest.runOnlyPendingTimers();

		expect( myFetcher.batchQueued ).toBe( false );
		expect( onFetch ).toHaveBeenCalledTimes( 0 );
		expect( makeRequest ).toHaveBeenCalledTimes( 0 );
		expect( myFetcher.postsToFetch.size ).toBe( 0 );
	} );
} );
