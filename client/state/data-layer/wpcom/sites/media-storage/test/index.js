import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestMediaStorage } from '..';

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
} );
