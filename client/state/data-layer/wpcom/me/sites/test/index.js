/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
} from 'state/action-types';
import { receiveSites } from 'state/sites/actions';
import { requestSites, receiveSitesError, receiveSitesSuccess, SITES_REQUEST_QUERY_PARAMS } from '../';

describe( 'wpcom-api', () => {
	describe( 'sites request', () => {
		describe( '#requestSites()', () => {
			it( 'should dispatch an HTTP request to the me/sites endpoint', () => {
				const dispatch = spy();
				const action = {
					type: SITES_REQUEST,
				};
				requestSites( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/me/sites',
							query: SITES_REQUEST_QUERY_PARAMS
						},
						action,
					),
				);
			} );
		} );

		describe( '#receiveSitesError()', () => {
			it( 'should dispatch an error action', () => {
				const dispatch = spy();
				const error = 'DUMMY_ERROR';

				receiveSitesError( { dispatch }, null, null, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: SITES_REQUEST_FAILURE,
					error
				} );
			} );
		} );

		describe( '#receiveSitesSuccess()', () => {
			it( 'should dispatch correct actions when request is successful', () => {
				const dispatch = spy();
				const response = {
					sites: [ { ID: 'DUMMY' } ]
				};

				receiveSitesSuccess( { dispatch }, null, null, response );

				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( receiveSites( response.sites ) );
				expect( dispatch ).to.have.been.calledWith( {
					type: SITES_REQUEST_SUCCESS
				} );
			} );
		} );
	} );
} );
