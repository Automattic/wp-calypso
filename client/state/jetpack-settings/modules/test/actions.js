/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { omit, map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	activateModule,
	deactivateModule,
	fetchModuleList
} from '../actions';
import { moduleData as MODULE_DATA_FIXTURE } from './fixture';
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULES_RECEIVE,
	JETPACK_MODULES_REQUEST,
	JETPACK_MODULES_REQUEST_SUCCESS,
	JETPACK_MODULES_REQUEST_FAILURE
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

import {
	api_module_list_response as API_MODULE_LIST_RESPONSE_FIXTURE
} from './fixture';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#activateJetpackModule', () => {
		const siteId = 123456;

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
					.post( '/rest/v1.1/jetpack-blogs/123456/rest-api/', {
						path: '/jetpack/v4/module/module-a/active/',
						body: JSON.stringify( { active: true } )
					} )
					.reply( 200, {
						data: {
							code: 'success',
							message: 'The requested Jetpack module was activated.'
						}
					} );
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
					.post( '/rest/v1.1/jetpack-blogs/123456/rest-api/', {
						path: '/jetpack/v4/module/module-a/active/',
						body: JSON.stringify( { active: true } )
					} )
					.reply( 400, {
						error: 'activation_error',
						message: 'The Jetpack Module is already activated.'
					} );
			} );

			it( 'should dispatch JETPACK_MODULE_ACTIVATE_FAILURE when activating a module fails', () => {
				const result = activateModule( siteId, 'module-a' )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_ACTIVATE_FAILURE,
						siteId,
						moduleSlug: 'module-a',
						error: 'The Jetpack Module is already activated.'
					} );
				} );
			} );
		} );
	} );

	describe( '#deactivateJetpackModule', () => {
		const siteId = 123456;

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
					.post( '/rest/v1.1/jetpack-blogs/123456/rest-api/', {
						path: '/module/module-b/active/',
						body: JSON.stringify( { active: false } )
					} )
					.reply( 200, {
						data: {
							code: 'success',
							message: 'The requested Jetpack module was deactivated.'
						}
					} );
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
					.post( '/rest/v1.1/jetpack-blogs/123456/rest-api/', {
						path: '/module/module-b/active/',
						body: JSON.stringify( { active: false } )
					} )
					.reply( 400, {
						error: 'deactivation_error',
						message: 'The Jetpack Module is already deactivated.'
					} );
			} );

			it( 'should dispatch JETPACK_MODULE_DEACTIVATE_FAILURE when deactivating a module fails', () => {
				const result = deactivateModule( siteId, 'module-b' )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULE_DEACTIVATE_FAILURE,
						siteId,
						moduleSlug: 'module-b',
						error: 'The Jetpack Module is already deactivated.'
					} );
				} );
			} );
		} );
	} );

	describe( '#fetchModuleList', () => {
		const siteId = 123456;

		describe( '#success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/123456/rest-api/' )
					.query( {
						path: '/jetpack/v4/module/all/'
					} )
					.reply( 200, API_MODULE_LIST_RESPONSE_FIXTURE );
			} );

			it( 'should dispatch JETPACK_MODULES_REQUEST when trying to fetch the list of jetpack modules', () => {
				fetchModuleList( siteId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULES_REQUEST,
					siteId
				} );
			} );

			it( 'should dispatch JETPACK_MODULES_RECEIVE when we get the response from the API', () => {
				const result = fetchModuleList( siteId )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULES_RECEIVE,
						siteId,
						modules: map(
							API_MODULE_LIST_RESPONSE_FIXTURE.data,
							( module ) => ( {
								active: module.activated,
								...omit( module, 'activated' )
							} )
						)
					} );
				} );
			} );

			it( 'should dispatch JETPACK_MODULES_REQUEST_SUCCESS when we get the response from the API', () => {
				const result = fetchModuleList( siteId )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULES_REQUEST_SUCCESS,
						siteId
					} );
				} );
			} );
		} );

		describe( '#failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/123456/rest-api/' )
					.query( {
						path: '/jetpack/v4/module/all/'
					} )
					.reply( 400, {
						message: 'Invalid request.'
					} );
			} );

			it( 'should dispatch JETPACK_MODULES_REQUEST_FAILURE when the requests fails', () => {
				const result = fetchModuleList( siteId )( spy );
				return result.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: JETPACK_MODULES_REQUEST_FAILURE,
						siteId,
						error: 'Invalid request.'
					} );
				} );
			} );
		} );
	} );
} );
