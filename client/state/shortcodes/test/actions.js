/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchShortcode } from '../actions';
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( '#fetchShortcode()', () => {
		const siteId = 12345678;
		const shortcode = '[gallery ids="1,2,3"]';

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com' )
					.persist()
					.get( `/rest/v1.1/sites/${ siteId }/shortcodes/render` )
					.query( {
						shortcode,
					} )
					.reply( 200, {
						result: '<html></html>',
						shortcode: '[gallery ids="1,2,3"]',
						scripts: {},
						styles: {},
					} );
			} );

			test( 'should return a fetch action object when called', () => {
				return fetchShortcode(
					siteId,
					shortcode
				)( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SHORTCODE_REQUEST,
						siteId,
						shortcode,
					} );
				} );
			} );

			test( 'should return a receive action when request successfully completes', () => {
				return fetchShortcode(
					siteId,
					shortcode
				)( spy ).then( () => {
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
							result: '<html></html>',
							shortcode: '[gallery ids="1,2,3"]',
							scripts: {},
							styles: {},
						},
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com' )
					.persist()
					.get( `/rest/v1.1/sites/${ siteId }/shortcodes/render` )
					.query( {
						shortcode,
					} )
					.reply( 400, {
						error: 'The requested shortcode does not exist.',
					} );
			} );

			test( 'should return a receive action when an error occurs', () => {
				return fetchShortcode(
					siteId,
					shortcode
				)( spy ).catch( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SHORTCODE_REQUEST_FAILURE,
						siteId,
						shortcode,
						error: 'The requested shortcode does not exist.',
					} );
				} );
			} );
		} );
	} );
} );
