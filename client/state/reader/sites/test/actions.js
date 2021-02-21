/**
 * Internal dependencies
 */
import {
	requestSite,
	receiveReaderSiteRequestSuccess,
	receiveReaderSiteRequestFailure,
} from '../actions';
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';

describe( 'actions', () => {
	describe( '#requestSite', () => {
		test( 'should return an action when a site is requested', () => {
			const action = requestSite( 123 );
			expect( action ).toEqual( {
				type: READER_SITE_REQUEST,
				payload: { ID: 123 },
			} );
		} );
	} );

	describe( '#receiveReaderSiteRequestSuccess', () => {
		test( 'should return an action when a site request succeeds', () => {
			const action = receiveReaderSiteRequestSuccess( { ID: 123 } );
			expect( action ).toEqual( {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 123 },
			} );
		} );
	} );

	describe( '#receiveReaderSiteRequestFailure', () => {
		test( 'should return an action when a site request fails', () => {
			const action = receiveReaderSiteRequestFailure(
				{ payload: { ID: 123 } },
				{ statusCode: 410 }
			);
			expect( action ).toEqual( {
				type: READER_SITE_REQUEST_FAILURE,
				payload: { ID: 123 },
				error: { statusCode: 410 },
			} );
		} );
	} );
} );
