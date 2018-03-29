/** @format */
/**
 * External Dependencies
 */
import freeze from 'deep-freeze';
import _ from 'lodash';

/**
 * Internal Dependencies
 */
import { getOffsetItem, shouldRequestRecs } from '../selectors';
import { getReaderFollows } from 'state/selectors';
import { getDistanceBetweenRecs } from 'reader/stream/utils';

jest.mock( 'lib/user/utils', () => ( { getLocaleSlug: () => 'en' } ) );
jest.mock( 'reader/stream/utils' );
jest.mock( 'state/selectors/get-reader-follows' );

const postKey1 = { postId: 1, feedId: 1 };
const postKey2 = { postId: 1, blogId: 1 };
const postKey3 = { postId: 2, feedId: 1 };

const currentStream = { ui: { reader: { currentStream: 'following' } } };

describe( 'getOffsetItem', () => {
	test( 'should return null when not given a currentItem', () => {
		const state = freeze( { reader: { streams: {} }, ...currentStream } );
		expect( getOffsetItem( state ) ).toBe( null );
	} );

	test( 'should return null for out of bounds', () => {
		const state = freeze( {
			reader: { streams: { following: { items: [ postKey1 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey1, 1 ) ).toBe( null );
		expect( getOffsetItem( state, postKey1, -1 ) ).toBe( null );
	} );

	test( 'should return items offset by one in either direction', () => {
		const state = freeze( {
			reader: { streams: { following: { items: [ postKey1, postKey2, postKey3 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey2, 1 ) ).toBe( postKey3 );
		expect( getOffsetItem( state, postKey2, -1 ) ).toBe( postKey1 );
	} );
} );

describe( 'shouldRequestRecs', () => {
	const generateState = ( { following, recs } ) => ( {
		reader: {
			streams: {
				following: { items: _.fill( Array( following ), {} ) },
				recs: { items: _.fill( Array( recs ), {} ) },
			},
		},
	} );

	test( 'should request recs if we have none', () => {
		getReaderFollows.mockReturnValue( { length: 0 } );
		const state = generateState( { following: 0, recs: 0 } );

		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( true );
	} );

	test( 'should request recs if we dont have enough', () => {
		getReaderFollows.mockReturnValue( { length: 0 } );
		getDistanceBetweenRecs.mockReturnValue( 1 );

		let state = generateState( { following: 1, recs: 1 } );
		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( true );

		state = generateState( { following: 2, recs: 3 } );
		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( true );
	} );

	test( 'should not request recs if we have enough', () => {
		getReaderFollows.mockReturnValue( { length: 0 } );
		getDistanceBetweenRecs.mockReturnValue( 1 );

		let state = generateState( { following: 1, recs: 2 } );
		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( false );

		state = generateState( { following: 2, recs: 4 } );
		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( false );

		state = generateState( { following: 2, recs: 100 } );
		expect( shouldRequestRecs( state, 'following', 'recs' ) ).toBe( false );
	} );
} );
