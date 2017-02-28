/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { receiveUnfollowTag, receiveTags } from '../actions';

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
			expect( state ).to.eql( {} );
		} );

		it( 'should add single tag in the payload to state', () => {
			const prevState = {};
			const action = receiveTags( { payload: [ TAG1 ] } );

			const state = items( prevState, action );
			expect( state ).to.eql( { [ TAG1.ID ]: TAG1 } );
		} );

		it( 'should add multiple tags in the payload to state', () => {
			const prevState = {};
			const action = receiveTags( { payload: [ TAG1, TAG2 ] } );

			const state = items( prevState, action );
			expect( state ).to.eql( keyById( [ TAG1, TAG2 ] ) );
		} );

		it( 'should update tags that have changed', () => {
			const prevState = { [ TAG1.ID ]: TAG1, [ TAG2.ID ]: TAG2 };
			const action = receiveTags( {
				payload: [ { ...TAG1, title: 'NotChickens' }, TAG2 ],
			} );

			const state = items( prevState, action );
			expect( state ).to.eql( keyById( [ { ...TAG1, title: 'NotChickens' }, TAG2 ] ) );
		} );

		it( 'should remove a tag if request to remove was successful', () => {
			const prevState = { [ TAG1.ID ]: TAG1, [ TAG2.ID ]: TAG2 };
			const action = receiveUnfollowTag( { payload: TAG1.ID, error: false } );
			const state = items( prevState, action );

			expect( state ).to.eql( keyById( [ TAG2 ] ) );
		} );

		it( 'should not remove a tag if request to remove errored', () => {
			const prevState = { [ TAG1.ID ]: TAG1, [ TAG2.ID ]: TAG2 };
			const action = receiveUnfollowTag( { payload: TAG1.ID, error: true } );
			const state = items( prevState, action );

			expect( state ).to.eql( keyById( [ TAG1, TAG2 ] ) );
		} );
	} );
} );
