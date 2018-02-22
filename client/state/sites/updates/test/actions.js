/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { match } from 'sinon';

/**
 * Internal dependencies
 */
import { updateWordPress } from '../actions';
import {
	SITE_WORDPRESS_UPDATE_REQUEST,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const siteId = 2916284;
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#updateWordPress()', () => {
		test( 'should dispatch a site wordpress update request action', () => {
			updateWordPress( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_WORDPRESS_UPDATE_REQUEST,
				siteId,
			} );
		} );

		describe( '#success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/sites/' + siteId + '/core/update' )
					.reply( 200, {
						version: 4.7,
					} );
			} );

			test( 'should dispatch site wordpress update request success action upon success', () => {
				return updateWordPress( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
						siteId,
					} );
				} );
			} );
		} );

		describe( '#failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/sites/' + siteId + '/core/update' )
					.reply( 400, {
						error: 'up_to_date',
						message: 'WordPress is at the latest version.',
					} );
			} );

			test( 'should dispatch site wordpress update request failure action upon error', () => {
				return updateWordPress( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
						siteId,
						error: match( {
							message: 'WordPress is at the latest version.',
						} ),
					} );
				} );
			} );
		} );
	} );
} );
