/**
 * External dependencies
 */
import nock from 'nock';
import { match } from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	PAGE_TEMPLATES_RECEIVE,
	PAGE_TEMPLATES_REQUEST,
	PAGE_TEMPLATES_REQUEST_SUCCESS,
	PAGE_TEMPLATES_REQUEST_FAILURE
} from 'state/action-types';
import {
	receivePageTemplates,
	requestPageTemplates
} from '../actions';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	after( () => {
		nock.cleanAll();
	} );

	describe( 'receivePageTemplates()', () => {
		it( 'should return an action object', () => {
			const action = receivePageTemplates( 2916284, [
				{ label: 'Full Width', file: 'fullwidth.php' }
			] );

			expect( action ).to.eql( {
				type: PAGE_TEMPLATES_RECEIVE,
				siteId: 2916284,
				templates: [
					{ label: 'Full Width', file: 'fullwidth.php' }
				]
			} );
		} );
	} );

	describe( 'requestPageTemplates()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/page-templates' )
				.reply( 200, {
					found: 2,
					templates: [
						{ label: 'Full Width', file: 'fullwidth.php' }
					]
				} )
				.get( '/rest/v1.1/sites/77203074/page-templates' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPageTemplates( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PAGE_TEMPLATES_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPageTemplates( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePageTemplates( 2916284, [
						{ label: 'Full Width', file: 'fullwidth.php' }
					] )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPageTemplates( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PAGE_TEMPLATES_REQUEST_SUCCESS,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPageTemplates( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PAGE_TEMPLATES_REQUEST_FAILURE,
					siteId: 77203074,
					error: match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
