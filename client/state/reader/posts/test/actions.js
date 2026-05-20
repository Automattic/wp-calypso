import * as tracks from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { READER_POSTS_RECEIVE } from 'calypso/state/reader/action-types';
import * as actions from '../actions';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
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
} );
