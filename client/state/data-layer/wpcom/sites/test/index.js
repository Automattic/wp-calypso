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
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_SUCCESS,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
} from 'state/action-types';
import { receiveSite, receiveDeletedSite } from 'state/sites/actions';
import {
	deleteSite,
	deleteSiteError,
	deleteSiteSuccess,
	requestSite,
	receiveSiteError,
	receiveSiteSuccess
} from '../';

describe( 'wpcom-api', () => {
	describe( 'delete site', () => {
		const action = {
			type: SITE_DELETE,
			siteId: 32232232
		};
		describe( '#deleteSite()', () => {
			it( 'should dispatch an HTTP request to delete the site', () => {
				const dispatch = spy();
				deleteSite( { dispatch }, action );
				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'POST',
					path: `/sites/${ action.siteId }/delete`,
				}, action )	);
			} );
		} );

		describe( '#deleteSiteError()', () => {
			it( 'should dispatch an error action', () => {
				const dispatch = spy();
				const error = 'DUMMY_ERROR';
				deleteSiteError( { dispatch }, action, null, error );
				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: SITE_DELETE_FAILURE,
					siteId: action.siteId,
					error
				} );
			} );
		} );

		describe( '#deleteSiteSuccess()', () => {
			it( 'should dispatch correct actions when request is successful', () => {
				const dispatch = spy();
				deleteSiteSuccess( { dispatch }, action );
				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( receiveDeletedSite( action.siteId ) );
				expect( dispatch ).to.have.been.calledWith( {
					type: SITE_DELETE_SUCCESS,
					siteId: action.siteId
				} );
			} );
		} );
	} );

	describe( 'request site', () => {
		const action = {
			type: SITE_REQUEST,
			siteId: 32232232
		};
		describe( '#requestSite()', () => {
			it( 'should dispatch an HTTP request to request the site', () => {
				const dispatch = spy();
				requestSite( { dispatch }, action );
				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: `/sites/${ action.siteId }`,
				}, action )	);
			} );
		} );

		describe( '#receiveSiteError()', () => {
			it( 'should dispatch an error action', () => {
				const dispatch = spy();
				const error = 'DUMMY_ERROR';
				receiveSiteError( { dispatch }, action, null, error );
				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: SITE_REQUEST_FAILURE,
					siteId: action.siteId,
					error
				} );
			} );
		} );

		describe( '#receiveSiteSuccess()', () => {
			it( 'should dispatch correct actions when request is successful', () => {
				const dispatch = spy();
				const response = { ID: 23232 };
				receiveSiteSuccess( { dispatch }, action, null, response );
				expect( dispatch ).to.have.been.calledTwice;
				expect( dispatch ).to.have.been.calledWith( receiveSite( response ) );
				expect( dispatch ).to.have.been.calledWith( {
					type: SITE_REQUEST_SUCCESS,
					siteId: action.siteId
				} );
			} );
		} );
	} );
} );
