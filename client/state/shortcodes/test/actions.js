/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS
} from 'state/action-types';
import { fetchShortcode } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';
import wpcom from 'lib/wp';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#fetchShortcode()', () => {
		const siteId = 12345678;
		const shortcode = '[gallery ids="1,2,3"]';

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/sites/' + siteId + '/shortcodes/render' )
					.query( {
						shortcode
					} )
					.reply( 200, {
						body: '<html></html>',
						scripts: {},
						styles: {}
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a fetch action object when called', () => {
				fetchShortcode( siteId, shortcode )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: SHORTCODE_REQUEST,
					siteId,
					shortcode
				} );
			} );

			it( 'should return a receive action when request successfully completes', () => {
				return wpcom.undocumented().site( siteId ).shortcodes(
					{
						shortcode
					},
					() => {
						expect( spy ).to.have.been.calledWith( {
							type: SHORTCODE_REQUEST_SUCCESS,
							siteId,
							shortcode,
						} );

						expect( spy ).to.have.been.calledWith( {
							type: SHORTCODE_RECEIVE,
							siteId,
							shortcode,
							data: {
								body: '<html></html>',
								scripts: {},
								styles: {}
							}
						} );
					}
				);
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/sites/' + siteId + '/shortcodes/render' )
					.query( {
						shortcode
					} )
					.reply( 400, {
						error: 'The requested shortcode does not exist.'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a receive action when an error occurs', () => {
				return wpcom.undocumented().site( siteId ).shortcodes(
					{
						shortcode
					},
					() => {
						expect( spy ).to.have.been.calledWith( {
							type: SHORTCODE_REQUEST_FAILURE,
							siteId,
							shortcode,
							error: 'The requested shortcode does not exist.'
						} );
					}
				);
			} );
		} );
	} );
} );
