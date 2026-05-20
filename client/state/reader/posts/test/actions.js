import { bumpStat } from 'calypso/lib/analytics/mc';
import * as tracks from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { pageViewForPost } from 'calypso/reader/stats';
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'calypso/state/reader/action-types';
import * as actions from '../actions';

jest.mock( 'calypso/reader/stats', () => ( { pageViewForPost: jest.fn() } ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'actions', () => {
	const dispatchSpy = jest.fn();
	const trackingSpy = tracks.recordTracksEvent;
	const wpcomGetStub = wp.req.get;

	afterEach( () => {
		dispatchSpy.mockReset();
		trackingSpy.mockReset();
		wpcomGetStub.mockReset();
	} );

	describe( '#receivePosts()', () => {
		test( 'should return an action object and dispatch posts receive', () => {
			const posts = [];
			return actions
				.receivePosts( posts )( dispatchSpy )
				.then( () => {
					expect( dispatchSpy ).toHaveBeenCalledWith( {
						type: READER_POSTS_RECEIVE,
						posts,
					} );
				} );
		} );

		test( 'should try to reload posts marked with should_reload', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: '1234',
					_should_reload: true,
				},
			];

			actions.receivePosts( posts )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
		} );
	} );

	describe( '#markPostSeen()', () => {
		const see = actions.markPostSeen;
		const dispatch = jest.fn();
		const getState = jest.fn();

		beforeEach( () => {
			dispatch.mockReset();
			getState.mockReset();
			pageViewForPost.mockReset();
			bumpStat.mockReset();
		} );

		test( 'should not dispatch if post is falsey', () => {
			const post = null;
			see( post )( dispatch );

			expect( dispatch.mock.calls ).toHaveLength( 0 );
		} );

		test( 'should not dispatch twice for the same post in one session', () => {
			const post = { global_ID: 1, site_ID: 1 };
			const site = { ID: 1 };
			see( post, site )( dispatch );
			dispatch.mockReset();
			pageViewForPost.mockReset();
			bumpStat.mockReset();

			see( post, site )( dispatch );

			expect( dispatch.mock.calls ).toHaveLength( 0 );
			expect( pageViewForPost ).not.toHaveBeenCalled();
			expect( bumpStat ).not.toHaveBeenCalled();
		} );

		test( 'should dispatch POST_SEEN and send pageviews for unseen posts with sites', () => {
			const post = { global_ID: 2, site_ID: 1 };
			const site = { ID: 1 };
			see( post, site )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_POST_SEEN,
				payload: { post, site },
			} );

			expect( pageViewForPost ).toHaveBeenCalledTimes( 1 );
			expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
