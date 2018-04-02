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
import config from 'config';
import plugins from './fixtures/plugins.js';

const state = deepFreeze( { plugins } );

/*
 * state.plugins has four sites:
 *  - site.one: all plugins installed and active
 *  - site.two: all plugins installed, WCS inactive
 *  - site.three: 2/3 plugins installed, WCS not installed
 *  - site.four: plugin state is still loading
 */

describe( 'plugins', () => {
	describe( '#areAllRequiredPluginsActive', () => {
		it( 'should be null if the plugin list is being requested', () => {
			expect( areAllRequiredPluginsActive( state, 'site.four' ) ).to.be.null;
		} );

		it( 'should be false if a required plugin is not installed', () => {
			expect( areAllRequiredPluginsActive( state, 'site.three' ) ).to.be.false;
		} );

		it( 'should be false if a required plugin is not active', () => {
			expect( areAllRequiredPluginsActive( state, 'site.two' ) ).to.be.false;
		} );

		it( 'should be true if the plugin is installed and active', () => {
			expect( areAllRequiredPluginsActive( state, 'site.one' ) ).to.be.true;
		} );
	} );

	describe( '#isWcsEnabled', () => {
		it( 'should be false if WCS is disabled in the config', () => {
			const configStub = sinon.stub( config, 'isEnabled' );
			configStub.withArgs( 'woocommerce/extension-wcservices' ).returns( false );

			expect( isWcsEnabled( state, 'site.one' ) ).to.be.false;
			configStub.restore();
		} );

		it( 'should be null if the plugin list is being requested', () => {
			expect( isWcsEnabled( state, 'site.four' ) ).to.be.null;
		} );

		it( 'should be false if the plugin is not installed', () => {
			expect( isWcsEnabled( state, 'site.three' ) ).to.be.false;
		} );

		it( 'should be false if the plugin is not active', () => {
			expect( isWcsEnabled( state, 'site.two' ) ).to.be.false;
		} );

		it( 'should be true if the plugin is installed and active', () => {
			expect( isWcsEnabled( state, 'site.one' ) ).to.be.true;
		} );
	} );
} );
