import {
	SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	fetchAlternatesReceive,
	fetchAlternatesRequest,
	fetchAlternatesRequestSuccess,
	fetchAlternatesRequestFailure,
} from '../actions';

const mockSupportAlternates = jest.fn( () => Promise.resolve() );

jest.mock( 'calypso/lib/wp', () => ( {
	undocumented: () => ( {
		supportAlternates: mockSupportAlternates,
	} ),
} ) );

describe( 'actions', () => {
	describe( 'fetchAlternatesReceive()', () => {
		test( 'should return an action object', () => {
			const action = fetchAlternatesReceive( 'post-key', {} );
			expect( action ).toEqual( {
				type: SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
				postKey: 'post-key',
				payload: {},
			} );
		} );
	} );

	describe( 'fetchAlternatesRequest()', () => {
		test( 'should return an action object', () => {
			const action = fetchAlternatesRequest( 'post-key' );
			expect( action ).toEqual( {
				type: SUPPORT_ARTICLE_ALTERNATES_REQUEST,
				postKey: 'post-key',
			} );
		} );
	} );

	describe( 'fetchAlternatesRequestSuccess()', () => {
		test( 'should return an action object', () => {
			const action = fetchAlternatesRequestSuccess( 'post-key' );
			expect( action ).toEqual( {
				type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
				postKey: 'post-key',
			} );
		} );
	} );

	describe( 'fetchAlternatesRequestFailure()', () => {
		test( 'should return an action object', () => {
			const action = fetchAlternatesRequestFailure( 'post-key', {} );
			expect( action ).toEqual( {
				type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
				postKey: 'post-key',
				error: {},
			} );
		} );
	} );
} );
