/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TAGS_RECEIVE } from 'state/action-types';
import { items } from '../reducer';

const keyById = tags => keyBy( tags, 'ID' );

const TAG1 = {
	ID: '307',
	slug: 'chickens',
	title: 'Chickens',
	display_name: 'chickens',
	URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
};

const TAG2 = {
	ID: '148',
	slug: 'design',
	title: 'Design',
	display_name: 'design',
	URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/design/posts',
};

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( [] );
		} );

		it( 'should add single tag in the payload to state', () => {
			const prevState = {};
			const action = {
				type: READER_TAGS_RECEIVE,
				payload: [ TAG1 ]
			};

			const state = items( prevState, action );
			expect( state ).to.eql( keyById( [ TAG1 ] ) );
		} );

		it( 'should add multiple tags in the payload to state', () => {
			const prevState = {};
			const action = {
				type: READER_TAGS_RECEIVE,
				payload: [ TAG1, TAG2 ]
			};

			const state = items( prevState, action );
			expect( state ).to.eql( keyById( [ TAG1, TAG2 ] ) );
		} );

		it( 'should update tags that have changed', () => {
			const prevState = items( {}, [ TAG1, TAG2 ] );

			const action = {
				type: READER_TAGS_RECEIVE,
				payload: [ { ...TAG1, title: 'NotChickens' }, TAG2 ]
			};

			const state = items( prevState, action );
			expect( state ).to.eql( keyById( [ { ...TAG1, title: 'NotChickens' }, TAG2 ] ) );
		} );
	} );
} );
