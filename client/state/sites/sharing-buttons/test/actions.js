/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	receiveSharingButtons,
	requestSharingButtons,
	saveSharingButtons,
	updateSharingButtons,
} from '../actions';
import {
	SHARING_BUTTONS_RECEIVE,
	SHARING_BUTTONS_REQUEST,
	SHARING_BUTTONS_REQUEST_FAILURE,
	SHARING_BUTTONS_REQUEST_SUCCESS,
	SHARING_BUTTONS_SAVE,
	SHARING_BUTTONS_SAVE_FAILURE,
	SHARING_BUTTONS_SAVE_SUCCESS,
	SHARING_BUTTONS_UPDATE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( 'receiveSharingButtons()', () => {
		test( 'should return an action object', () => {
			const settings = [ { ID: 'facebook', name: 'Facebook' } ];
			const action = receiveSharingButtons( 2916284, settings );

			expect( action ).to.eql( {
				type: SHARING_BUTTONS_RECEIVE,
				siteId: 2916284,
				settings,
			} );
		} );
	} );

	describe( 'updateSharingButtons()', () => {
		test( 'should return an action object', () => {
			const settings = [ { ID: 'facebook', name: 'Facebook' } ];
			const action = updateSharingButtons( 2916284, settings );

			expect( action ).to.eql( {
				type: SHARING_BUTTONS_UPDATE,
				siteId: 2916284,
				settings,
			} );
		} );
	} );

	describe( 'requestSharingButtons()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/sharing-buttons' )
				.reply( 200, {
					sharing_buttons: [ { ID: 'facebook', name: 'Facebook' } ],
				} )
				.get( '/rest/v1.1/sites/2916285/sharing-buttons' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSharingButtons( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SHARING_BUTTONS_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestSharingButtons( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveSharingButtons( 2916284, [ { ID: 'facebook', name: 'Facebook' } ] )
				);
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestSharingButtons( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SHARING_BUTTONS_REQUEST_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestSharingButtons( 2916285 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SHARING_BUTTONS_REQUEST_FAILURE,
					siteId: 2916285,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( 'saveSharingButtons()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/sharing-buttons' )
				.reply( 200, {
					updated: [ { ID: 'facebook', name: 'Facebook' } ],
				} )
				.post( '/rest/v1.1/sites/2916285/sharing-buttons' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action and an optimistic update when thunk triggered', () => {
			saveSharingButtons( 2916284, [ { ID: 'twitter', name: 'Twitter' } ] )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SHARING_BUTTONS_SAVE,
				siteId: 2916284,
			} );
			expect( spy ).to.have.been.calledWith(
				updateSharingButtons( 2916284, [ { ID: 'twitter', name: 'Twitter' } ] )
			);
		} );

		test( 'should dispatch update action when request completes', () => {
			return saveSharingButtons( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					updateSharingButtons( 2916284, [ { ID: 'facebook', name: 'Facebook' } ] )
				);
			} );
		} );

		test( 'should dispatch save success action when request completes', () => {
			return saveSharingButtons( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SHARING_BUTTONS_SAVE_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return saveSharingButtons( 2916285 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SHARING_BUTTONS_SAVE_FAILURE,
					siteId: 2916285,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
