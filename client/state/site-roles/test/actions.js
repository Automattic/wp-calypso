/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestSiteRoles } from '../actions';
import {
	SITE_ROLES_RECEIVE,
	SITE_ROLES_REQUEST,
	SITE_ROLES_REQUEST_FAILURE,
	SITE_ROLES_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( '#requestSiteRoles()', () => {
		describe( 'success', () => {
			const roles = [
				{
					name: 'administrator',
					display_name: 'Administrator',
					capabilities: {
						activate_plugins: true,
						edit_users: true,
						manage_options: true,
					},
				},
				{
					name: 'customer',
					display_name: 'Customer',
					capabilities: {
						read: true,
					},
				},
			];
			const siteId = 12345678;

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/sites/' + siteId + '/roles' )
					.reply(
						200,
						{
							roles,
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a request action object when called', () => {
				requestSiteRoles( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SITE_ROLES_REQUEST,
					siteId,
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return requestSiteRoles( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_ROLES_REQUEST_SUCCESS,
						siteId,
					} );

					expect( spy ).to.have.been.calledWith( {
						type: SITE_ROLES_RECEIVE,
						siteId,
						roles,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const error = 'unauthorized';
			const message = 'User cannot view roles for specified site';
			const siteId = 87654321;

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/sites/' + siteId + '/roles' )
					.reply(
						403,
						{
							error,
							message,
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a receive action when an error occurs', () => {
				return requestSiteRoles( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITE_ROLES_REQUEST_FAILURE,
						siteId,
					} );
				} );
			} );
		} );
	} );
} );
