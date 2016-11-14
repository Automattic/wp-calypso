/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	activateModule
} from '../actions';

import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );
	describe( '#activateJetpackModule', () => {
		const siteId = 123456;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/123456/jetpack/modules/module-a' )
			.reply( 200, {} );
		} );

		it( 'should dispatch JETPACK_MODULE_ACTIVATE when trying to activate a module', () => {
			activateModule( siteId, 'module-a' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: JETPACK_MODULE_ACTIVATE,
				siteId,
				moduleSlug: 'module-a'
			} );
		} );
	} );
	describe( '#activateJetpackModuleSuccess', () => {
		const siteId = 123456;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/123456/jetpack/modules/module-a' )
			.reply( 200, {} );
		} );

		it( 'should dispatch complete success when API activates a module', () => {
			const result = activateModule( siteId, 'module-a' )( spy );
			return result.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'module-a'
				} );
			} );
		} );
	} );

	describe( '#activateJetpackModuleFailure', () => {
		const siteId = 123456;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/123456/jetpack/modules/module-a' )
			.reply( 500, {} );
		} );

		it( 'should dispatch JETPACK_MODULE_ACTIVATE_FAILURE when activating a module fails', () => {
			const result = activateModule( siteId, 'module-a' )( spy );
			return result.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug: 'module-a',
					error: '500 status code for " /rest/v1.1/sites/123456/jetpack/modules/module-a"'
				} );
			} );
		} );
	} );
} );
