/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { areAllRequiredPluginsActive, isWcsEnabled } from '../plugins';
import config from '@automattic/calypso-config';
import plugins from './fixtures/plugins.js';

const state = deepFreeze( { plugins } );

/*
 * state.plugins has four sites:
 *  - 1: all plugins installed and active
 *  - 2: all plugins installed, WCS inactive
 *  - 3: 2/3 plugins installed, WCS not installed
 *  - 4: plugin state is still loading
 */

describe( 'plugins', () => {
	describe( '#areAllRequiredPluginsActive', () => {
		it( 'should be null if the plugin list is being requested', () => {
			expect( areAllRequiredPluginsActive( state, 4 ) ).to.be.null;
		} );

		it( 'should be false if a required plugin is not installed', () => {
			expect( areAllRequiredPluginsActive( state, 3 ) ).to.be.false;
		} );

		it( 'should be false if a required plugin is not active', () => {
			expect( areAllRequiredPluginsActive( state, 2 ) ).to.be.false;
		} );

		it( 'should be true if the plugin is installed and active', () => {
			expect( areAllRequiredPluginsActive( state, 1 ) ).to.be.true;
		} );
	} );

	describe( '#isWcsEnabled', () => {
		it( 'should be false if WCS is disabled in the config', () => {
			const configStub = sinon.stub( config, 'isEnabled' );
			configStub.withArgs( 'woocommerce/extension-wcservices' ).returns( false );

			expect( isWcsEnabled( state, 1 ) ).to.be.false;
			configStub.restore();
		} );

		it( 'should be false if the plugin list is being requested', () => {
			expect( isWcsEnabled( state, 4 ) ).to.be.false;
		} );

		it( 'should be false if the plugin is not installed', () => {
			expect( isWcsEnabled( state, 3 ) ).to.be.false;
		} );

		it( 'should be false if the plugin is not active', () => {
			expect( isWcsEnabled( state, 2 ) ).to.be.false;
		} );

		it( 'should be true if the plugin is installed and active', () => {
			expect( isWcsEnabled( state, 1 ) ).to.be.true;
		} );
	} );
} );
