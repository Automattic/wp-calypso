/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { login as loginStub } from 'lib/oauth-store/actions';
import { Login } from '../login.jsx';
import FormButton from 'components/forms/form-button';

jest.mock( 'lib/oauth-store/actions', () => ( {
	login: require( 'sinon' ).stub(),
} ) );
jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {},
	},
} ) );

describe( 'LoginTest', function() {
	const page = shallow( <Login translate={ identity } /> );

	it( 'OTP is not present on first render', function( done ) {
		page.setState( { requires2fa: false }, function() {
			expect( page.find( { name: 'auth_code' } ) ).to.have.length( 0 );
			done();
		} );
	} );

	it( 'cannot submit until login details entered', function( done ) {
		expect( page.find( FormButton ).props().disabled ).to.be.true;
		page.setState( { login: 'test', password: 'test', inProgress: false }, function() {
			expect( page.find( FormButton ).props().disabled ).to.be.false;
			done();
		} );
	} );

	it( 'shows OTP box with valid login', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: true }, function() {
			expect( page.find( { name: 'auth_code' } ) ).to.have.length( 1 );
			done();
		} );
	} );

	it( 'prevents change of login when asking for OTP', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: true }, function() {
			expect( page.find( { name: 'login' } ).props().disabled ).to.be.true;
			expect( page.find( { name: 'password' } ).props().disabled ).to.be.true;
			done();
		} );
	} );

	it( 'submits login form', function( done ) {
		page.setState( { login: 'user', password: 'pass', auth_code: 'otp' }, function() {
			page.find( 'form' ).simulate( 'submit', { preventDefault: noop, stopPropagation: noop } );

			expect( loginStub ).to.have.been.calledOnce;
			expect( loginStub.calledWith( 'user', 'pass', 'otp' ) ).to.be.true;
			done();
		} );
	} );
} );
