/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	isWcsEnabled,
} from '../plugins';

const siteId = 123;

const getState = ( loaded = false, installed = false, active = false ) => {
	const pluginArray = [];
	if ( loaded && installed ) {
		pluginArray.push( {
			id: 'woocommerce-services/woocommerce-services',
			slug: 'woocommerce-services',
			active,
		} );
	}

	return {
		plugins: {
			installed: {
				plugins: {
					[ siteId ]: pluginArray,
				},
				isRequesting: {
					[ siteId ]: ! loaded,
				},
			},
		},
	};
};

describe( 'plugins', () => {
	describe( '#isWcsEnabled', () => {
		it( 'should be false if WCS is disabled in the config', () => {
			const configStub = sinon.stub( config, 'isEnabled' );
			configStub.withArgs( 'woocommerce/extension-wcservices' ).returns( false );

			expect( isWcsEnabled( getState(), siteId ) ).to.be.false;
			configStub.restore();
		} );

		it( 'should be false if the plugin list is being requested', () => {
			expect( isWcsEnabled( getState( false ), siteId ) ).to.be.false;
		} );

		it( 'should be false if the plugin is not installed', () => {
			expect( isWcsEnabled( getState( true, false ), siteId ) ).to.be.false;
		} );

		it( 'should be false if the plugin is not active', () => {
			expect( isWcsEnabled( getState( true, true, false ), siteId ) ).to.be.false;
		} );

		it( 'should be true if the plugin is installed and active', () => {
			expect( isWcsEnabled( getState( true, true, true ), siteId ) ).to.be.true;
		} );
	} );
} );
