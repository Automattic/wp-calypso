/**
 * @jest-environment jsdom
 */
jest.mock( 'config', () => {
	const { stub } = require( 'sinon' );

	const configMock = stub();
	configMock.isEnabled = stub();

	return configMock;
} );
jest.mock( 'lib/wp', () => ( {
	me: () => ( {
		get: () => {}
	} )
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import configMock from 'config';
import UserUtils from '../utils';

describe( 'UserUtils', () => {
	let user;

	before( () => {
		user = require( 'lib/user' )();
	} );

	beforeEach( () => {
		configMock.returns( '/url-with-|subdomain|' );
	} );

	context( 'without logout url', () => {
		before( () => {
			configMock.isEnabled
				.withArgs( 'always_use_logout_url' )
				.returns( false );
		} );

		it( 'uses userData.logout_URL when available', () => {
			sinon.stub( user, 'get' ).returns( { logout_URL: '/userdata' } );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/userdata' );
			user.get.restore();
		} );
	} );

	context( 'with logout url', () => {
		before( () => {
			configMock.isEnabled
				.withArgs( 'always_use_logout_url' )
				.returns( true );
		} );

		it( 'works when |subdomain| is not present', () => {
			configMock.returns( '/url-without-domain' );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-without-domain' );
		} );

		it( 'replaces |subdomain| when present and have domain', () => {
			sinon.stub( user, 'get' ).returns( { localeSlug: 'es' } );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-with-es.' );
			user.get.restore();
		} );

		it( 'replaces |subdomain| when present but no domain', () => {
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-with-' );
		} );
	} );
} );
