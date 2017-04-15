/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
	SITE_WORDPRESS_UPDATE_REQUEST,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
} from 'state/action-types';
import {
	siteUpdatesReceiveAction,
	siteUpdatesRequestAction,
	siteUpdatesRequestSuccessAction,
	siteUpdatesRequestFailureAction,
	updateWordPress,
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const siteId = 2916284;
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#siteUpdatesReceiveAction()', () => {
		it( 'should return a site updates receive action object', () => {
			const updates = {
				plugins: 1,
			};
			const action = siteUpdatesReceiveAction( siteId, updates );

			expect( action ).to.eql( {
				type: SITE_UPDATES_RECEIVE,
				siteId,
				updates,
			} );
		} );
	} );

	describe( '#siteUpdatesRequestAction()', () => {
		it( 'should return a site updates request action object', () => {
			const action = siteUpdatesRequestAction( siteId );

			expect( action ).to.eql( {
				type: SITE_UPDATES_REQUEST,
				siteId,
			} );
		} );
	} );

	describe( '#siteUpdatesRequestSuccessAction()', () => {
		it( 'should return a site updates request success action object', () => {
			const action = siteUpdatesRequestSuccessAction( siteId );

			expect( action ).to.eql( {
				type: SITE_UPDATES_REQUEST_SUCCESS,
				siteId,
			} );
		} );
	} );

	describe( '#siteUpdatesRequestFailureAction()', () => {
		it( 'should return a site updates request failure action object', () => {
			const error = 'There was an error while getting the update data for this site.';
			const action = siteUpdatesRequestFailureAction( siteId, error );

			expect( action ).to.eql( {
				type: SITE_UPDATES_REQUEST_FAILURE,
				siteId,
				error,
			} );
		} );
	} );

	describe( '#updateWordPress()', () => {
		it( 'should dispatch a site wordpress update request action', () => {
			updateWordPress( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_WORDPRESS_UPDATE_REQUEST,
				siteId,
			} );
		} );

		describe( '#success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/sites/' + siteId + '/core/update' )
					.reply( 200, {
						version: 4.7
					} );
			} );

			it( 'should dispatch site wordpress update request success action upon success', () => {
				return updateWordPress( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
						siteId,
					} );
				} );
			} );
		} );

		describe( '#failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/sites/' + siteId + '/core/update' )
					.reply( 400, {
						error: 'up_to_date',
						message: 'WordPress is at the latest version.',
					} );
			} );

			it( 'should dispatch site wordpress update request failure action upon error', () => {
				return updateWordPress( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
						siteId,
						error: match( {
							message: 'WordPress is at the latest version.'
						} )
					} );
				} );
			} );
		} );
	} );
} );
