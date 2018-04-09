/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { regeneratePostByEmail } from '../actions';
import {
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	const siteId = 12345678;

	describe( '#regeneratePostByEmail()', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( { post_by_email_address: 'regenerate' } ),
					} )
					.reply(
						200,
						{
							data: {
								post_by_email_address: 'example123456@automattic.com',
							},
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a regenerate action object when called', () => {
				regeneratePostByEmail( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
					siteId,
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return regeneratePostByEmail( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
						siteId,
						email: 'example123456@automattic.com',
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/rest-api/', {
						path: '/jetpack/v4/settings/',
						body: JSON.stringify( { post_by_email_address: 'regenerate' } ),
					} )
					.reply(
						400,
						{
							message: 'Invalid request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should return a receive action when an error occurs', () => {
				return regeneratePostByEmail( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
						siteId,
						error: 'Invalid request.',
					} );
				} );
			} );
		} );
	} );
} );
