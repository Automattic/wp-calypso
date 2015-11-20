/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */

var expect = require( 'chai' ).expect,
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */

const LOGOUT_WITH_DOMAIN = '/url-with-|subdomain|';
const LOGOUT_WITHOUT_DOMAIN = '/url-without-domain';

describe( 'UserUtils', function() {
	var user, UserUtils;
	var logout_URL;
	var always_use_logout_url = false;
	var mockedConfig = function() {
		return logout_URL;
	}

	mockedConfig.isEnabled = function( feature ) {
		if ( feature === 'desktop' ) {
			return false;
		}

		if ( feature === 'always_use_logout_url' ) {
			return always_use_logout_url;
		}

		return true;
	};

	beforeEach( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		mockery.registerMock( 'config', mockedConfig );

		user = require( 'lib/user' )();
		UserUtils = require( '../utils' );
	} );

	afterEach( function() {
		mockery.disable();
		mockery.deregisterMock( 'config' );
	} );

	it( 'uses userData.logout_URL when available', function() {
		sinon.stub( user, 'get', function() {
			return {
				logout_URL: '/userdata'
			};
		} );

		always_use_logout_url = false;
		logout_URL = LOGOUT_WITH_DOMAIN;
		expect( UserUtils.getLogoutUrl() ).to.be.equals( '/userdata' );

		user.get.restore();
	} );

	it( 'works when |subdomain| is not present', function() {
		always_use_logout_url = true;
		logout_URL = LOGOUT_WITHOUT_DOMAIN;
		expect( UserUtils.getLogoutUrl() ).to.be.equals( '/url-without-domain' );
	} );

	it( 'replaces |subdomain| when present and have domain', function() {
		sinon.stub( user, 'get', function() {
			return {
				localeSlug: 'es'
			};
		} );

		always_use_logout_url = true;
		logout_URL = LOGOUT_WITH_DOMAIN;
		expect( UserUtils.getLogoutUrl() ).to.be.equals( '/url-with-es.' );

		user.get.restore();
	} );

	it( 'replaces |subdomain| when present but no domain', function() {
		always_use_logout_url = true;
		logout_URL = LOGOUT_WITH_DOMAIN;

		expect( UserUtils.getLogoutUrl() ).to.be.equals( '/url-with-' );
	} );
} );
