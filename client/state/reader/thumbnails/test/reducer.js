import { READER_THUMBNAIL_RECEIVE } from 'calypso/state/reader/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	const embedUrl = 'embedUrl';
	const thumbnailUrl = 'thumbnailUrl';

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should insert a new thumbnailUrl for a new embedUrl', () => {
			const state = items(
				{},
				{
					type: READER_THUMBNAIL_RECEIVE,
					embedUrl,
					thumbnailUrl,
				}
			);

			expect( state[ embedUrl ] ).toEqual( thumbnailUrl );
		} );
	} );
} );
