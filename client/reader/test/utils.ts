import page from '@automattic/calypso-router';
import { AppState } from 'calypso/types';
import { getSafeImageUrlForReader, showSelectedPost } from '../utils';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

describe( 'reader utils', () => {
	const dispatch = jest.fn();
	const getState = () =>
		( {
			reader: {
				posts: {
					items: {},
				},
			},
		} ) as AppState;

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( '#showSelectedPost', () => {
		test( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} )( dispatch, getState );
			expect( page ).not.toHaveBeenCalled();
		} );

		test( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } )( dispatch, getState );
			expect( page ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } )(
				dispatch,
				getState
			);
			expect( page as ( url: string ) => void ).toHaveBeenCalledWith(
				'/reader/feeds/1/posts/5#comments'
			); //
		} );
	} );

	describe( 'getSafeImageUrlForReader', () => {
		test( 'returns the url as is if it is from a trusted host', () => {
			const url = 'https://www.redditstatic.com/image.jpg';
			expect( getSafeImageUrlForReader( url ) ).toEqual( url );
		} );

		test( 'returns the Photon url if it is not from a trusted host', () => {
			const url = 'https://www.example.com/image.jpg';
			expect( getSafeImageUrlForReader( url ) ).not.toEqual( url );
		} );
	} );
} );
