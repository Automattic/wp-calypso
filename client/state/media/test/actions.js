/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MEDIA_RECEIVE } from 'state/action-types';
import { receiveMedia } from '../actions';

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
} );
