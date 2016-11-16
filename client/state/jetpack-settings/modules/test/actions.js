/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	activateModule,
	deactivateModule
} from '../actions';

import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_FAILURE
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

		describe( '#success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/123456/jetpack/modules/module-a' )
				.reply( 200, {} );
			} );

			it( 'should dispatch JETPACK_MODULE_ACTIVATE_SUCCESS when API activates a module', () => {
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

		describe( '#failure', () => {
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

	describe( '#deactivateJetpackModule', () => {
		const siteId = 123456;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/123456/jetpack/modules/module-b' )
				.reply( 200, {} );
		} );

		it( 'should dispatch JETPACK_MODULE_DEACTIVATE when trying to deactivate a module', () => {
			deactivateModule( siteId, 'module-b' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: JETPACK_MODULE_DEACTIVATE,
				siteId,
				moduleSlug: 'module-b'
			} );
		} );

		describe( '#success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/123456/jetpack/modules/module-b' )
				.reply( 200, {} );
			} );

			it( 'should dispatch JETPACK_MODULE_DEACTIVATE_SUCCESS when API deactivates a module', () => {
				const result = deactivateModule( siteId, 'module-b' )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
						siteId,
						moduleSlug: 'module-b'
					} );
				} );
			} );
		} );

		describe( '#failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/sites/123456/jetpack/modules/module-b' )
				.reply( 500, {} );
			} );

			it( 'should dispatch JETPACK_MODULE_DEACTIVATE_FAILURE when deactivating a module fails', () => {
				const result = deactivateModule( siteId, 'module-b' )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_DEACTIVATE_FAILURE,
						siteId,
						moduleSlug: 'module-b',
						error: '500 status code for " /rest/v1.1/sites/123456/jetpack/modules/module-b"'
					} );
				} );
			} );
		} );
	} );
} );
