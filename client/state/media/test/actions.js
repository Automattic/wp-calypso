/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MEDIA_DELETE, MEDIA_RECEIVE } from 'state/action-types';
import { receiveMedia, deleteMedia } from '../actions';

describe( 'actions', () => {
	describe( 'receiveMedia()', () => {
		context( 'single', () => {
			it( 'should return an action object', () => {
				const action = receiveMedia( 2916284, { ID: 42, title: 'flowers' } );

				expect( action ).to.eql( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ]
				} );
			} );
		} );

		context( 'array', () => {
			it( 'should return an action object', () => {
				const action = receiveMedia( 2916284, [ { ID: 42, title: 'flowers' } ] );

				expect( action ).to.eql( {
					type: MEDIA_RECEIVE,
					siteId: 2916284,
					media: [ { ID: 42, title: 'flowers' } ]
				} );
			} );
		} );
	} );

	describe( 'deleteMedia()', () => {
		context( 'single', () => {
			it( 'should return an action object', () => {
				const action = deleteMedia( 2916284, 42 );

				expect( action ).to.eql( {
					type: MEDIA_DELETE,
					siteId: 2916284,
					mediaIds: [ 42 ]
				} );
			} );
		} );

		context( 'array', () => {
			it( 'should return an action object', () => {
				const action = deleteMedia( 2916284, [ 42 ] );

				expect( action ).to.eql( {
					type: MEDIA_DELETE,
					siteId: 2916284,
					mediaIds: [ 42 ]
				} );
			} );
		} );
	} );
} );
