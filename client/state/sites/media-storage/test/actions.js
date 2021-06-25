/**
 * Internal dependencies
 */
import { receiveMediaStorage, requestMediaStorage } from '../actions';
import { SITE_MEDIA_STORAGE_RECEIVE, SITE_MEDIA_STORAGE_REQUEST } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#receiveMediaStorage()', () => {
		test( 'should return an action object', () => {
			const siteId = 2916284;
			const mediaStorage = {
				max_storage_bytes: -1,
				storage_used_bytes: -1,
			};
			const action = receiveMediaStorage( mediaStorage, 2916284 );
			expect( action ).toEqual( {
				type: SITE_MEDIA_STORAGE_RECEIVE,
				siteId,
				mediaStorage,
			} );
		} );
	} );

	describe( '#requestMediaStorage()', () => {
		test( 'should return an action object', () => {
			const action = requestMediaStorage( 2916284 );
			expect( action ).toEqual( {
				type: SITE_MEDIA_STORAGE_REQUEST,
				siteId: 2916284,
			} );
		} );
	} );
} );
