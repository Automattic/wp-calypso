/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import UserUtils from '../utils';
import configMock from 'config';

jest.mock( 'config', () => {
	const { stub } = require( 'sinon' );

	const mock = stub();
	mock.isEnabled = stub();

	return mock;
} );

jest.mock( 'lib/wp', () => ( {
	me: () => ( {
		get: async () => ( {} ),
	} ),
} ) );

describe( 'UserUtils', () => {
	let user;

	beforeAll( () => {
		user = require( 'lib/user' )();
	} );

	beforeEach( () => {
		configMock.returns( '/url-with-|subdomain|' );
	} );

	describe( 'without logout url', () => {
		beforeAll( () => {
			configMock.isEnabled.withArgs( 'always_use_logout_url' ).returns( false );
		} );

		test( 'uses userData.logout_URL when available', () => {
			sinon.stub( user, 'get' ).returns( { logout_URL: '/userdata' } );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/userdata' );
			user.get.restore();
		} );
	} );

	describe( 'with logout url', () => {
		beforeAll( () => {
			configMock.isEnabled.withArgs( 'always_use_logout_url' ).returns( true );
		} );

		test( 'works when |subdomain| is not present', () => {
			configMock.returns( '/url-without-domain' );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-without-domain' );
		} );

		test( 'replaces |subdomain| when present and have domain', () => {
			sinon.stub( user, 'get' ).returns( { localeSlug: 'es' } );
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-with-es.' );
			user.get.restore();
		} );

		test( 'replaces |subdomain| when present but no domain', () => {
			expect( UserUtils.getLogoutUrl() ).to.equal( '/url-with-' );
		} );
	} );
} );
