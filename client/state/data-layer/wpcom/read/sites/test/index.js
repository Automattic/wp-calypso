/**
 * Internal dependencies
 */
import { requestReadSite } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestSite } from 'state/reader/sites/actions';

describe( 'read-sites-site', () => {
	describe( 'requestReadSite', () => {
		test( 'should dispatch an http request', () => {
			const blogId = 123;
			const action = requestSite( blogId );

			expect( requestReadSite( action ) ).toMatchObject(
				http(
					{
						apiVersion: '1.1',
						method: 'GET',
						path: `/read/sites/${ blogId }`,
					},
					action
				)
			);
		} );
	} );
} );
