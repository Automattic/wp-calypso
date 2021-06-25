/**
 * Internal dependencies
 */
import { requestMediaStorage, requestMediaStorageSuccess, requestMediaStorageError } from '../';
import { receiveMediaStorage } from 'calypso/state/sites/media-storage/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const ARBITRARY_SITE_ID = 12378129379;

describe( 'wpcom-api', () => {
	describe( '#requestMediaStorage()', () => {
		test( 'should return HTTP request action to media storage endpoint', () => {
			const action = { siteId: ARBITRARY_SITE_ID };

			expect( requestMediaStorage( action ) ).toEqual( [
				http(
					{ apiVersion: '1.1', method: 'GET', path: `/sites/${ ARBITRARY_SITE_ID }/media-storage` },
					action
				),
			] );
		} );
	} );

	describe( '#requestMediaStorageSuccess()', () => {
		test( 'should dispatch receive media storage actions', () => {
			const mediaStorageResponse = {
				max_storage_bytes: 214748364800,
				storage_used_bytes: 349630702,
			};
			const result = requestMediaStorageSuccess(
				{ siteId: ARBITRARY_SITE_ID },
				mediaStorageResponse
			);

			expect( result[ 0 ] ).toEqual(
				receiveMediaStorage( mediaStorageResponse, ARBITRARY_SITE_ID )
			);
			expect( result ).toMatchSnapshot();
		} );
	} );

	describe( '#requestMediaStorageError()', () => {
		test( 'should dispatch receive media storage actions', () => {
			const result = requestMediaStorageError(
				{ siteId: ARBITRARY_SITE_ID },
				new Error( 'arbitrary error' )
			);

			expect( result ).toMatchSnapshot();
		} );
	} );
} );
