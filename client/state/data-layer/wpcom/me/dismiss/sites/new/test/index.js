/**
 * Internal dependencies
 */
import { requestSiteDismiss, receiveSiteDismiss, fromApi, receiveSiteDismissError } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dismissSite } from 'calypso/state/reader/site-dismissals/actions';

describe( 'site-dismissals', () => {
	describe( 'requestSiteDismiss', () => {
		test( 'should dispatch an http request', () => {
			const action = dismissSite( 123 );
			expect( requestSiteDismiss( action ) ).toEqual(
				http(
					{
						method: 'POST',
						path: '/me/dismiss/sites/123/new',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveSiteDismiss', () => {
		test( 'should return a success notice', () => {
			expect( receiveSiteDismiss() ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-success',
					} ),
				} )
			);
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful dismissal', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for a successful dismissal', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );

	describe( 'receiveSiteDismissError', () => {
		test( 'should return an error notice', () => {
			expect( receiveSiteDismissError() ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
		} );
	} );
} );
