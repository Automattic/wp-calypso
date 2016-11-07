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
import { useSandbox } from 'test/helpers/use-sinon';
import wp from 'lib/wp';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );
	describe( '#activateJetpackModule', () => {
		const siteId = 123456;
		let sandbox;

		useSandbox( newSandbox => sandbox = newSandbox );

		it( 'should dispatch JETPACK_MODULE_ACTIVATE when trying to activate a module', () => {
			sandbox.stub( wp, 'undocumented', () => ( {
				jetpackModulesActivate: () => Promise.resolve( {} )
			} ) );

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
		let sandbox;

		useSandbox( newSandbox => sandbox = newSandbox );

		it( 'should dispatch complete success when API activates a module', () => {
			sandbox.stub( wp, 'undocumented', () => ( {
				jetpackModulesActivate: () => Promise.resolve( {} )
			} ) );

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
		let sandbox;

		useSandbox( newSandbox => sandbox = newSandbox );

		it( 'should dispatch JETPACK_MODULE_ACTIVATE_FAILURE when activating a module fails', () => {
			sandbox.stub( wp, 'undocumented', () => ( {
				jetpackModulesActivate: () => Promise.reject( {
					message: 'error_message'
				} )
			} ) );

			const result = activateModule( siteId, 'module-a' )( spy );
			return result.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug: 'module-a',
					error: 'error_message'
				} );
			} );
		} );
	} );
} );
