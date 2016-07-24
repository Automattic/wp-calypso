/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import identity from 'lodash/identity';
import { stub } from 'sinon';
import { EVERY_FIVE_SECONDS } from 'lib/interval';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'LoginTest', function() {
	let Login, loginStub, pushAuthLoginStub, page, React, ReactInjection;

	useFakeDom.withContainer();
	useMockery( ( mockery ) => {
		loginStub = stub();
		pushAuthLoginStub = stub();
		mockery.registerMock( 'lib/oauth-store/actions', {
			login: loginStub,
			pushAuthLogin: pushAuthLoginStub
		} );
	} );

	beforeEach( () => {
		loginStub.reset();
		pushAuthLoginStub.reset();
	} );

	before( () => {
		React = require( 'react' );
		ReactInjection = require( 'react/lib/ReactInjection' );
		ReactInjection.Class.injectMixin( { translate: identity } );
		Login = require( '../login.jsx' );
		page = shallow( <Login /> );
	} );

	it( 'OTP is not present on first render', function() {
		page = page.setState( { auth: { required2faType: null } } );

		expect( page.find( { name: 'auth_code' } ).length ).to.equal( 0 );
	} );

	it( 'cannot submit until login details entered', function() {
		page.setState( { login: 'test', password: 'test', inProgress: false } );

		expect( page.find( 'FormsButton' ).props().disabled ).to.be.false;
	} );

	it( 'shows OTP box with valid login', function() {
		page.setState( { login: 'test', password: 'test', auth: { required2faType: 'code' } } );

		expect( page.find( { name: 'auth_code' } ).length ).to.equal( 1 );
	} );

	it( 'prevents change of login when asking for OTP', function() {
		page.setState( { login: 'test', password: 'test', auth: { required2faType: 'code' } } );

		expect( page.find( { name: 'login' } ).props().disabled ).to.be.true;
		expect( page.find( { name: 'password' } ).props().disabled ).to.be.true;
	} );

	it( 'submits login form', function() {
		page.setState( { login: 'user', password: 'pass', auth_code: 'otp' } );

		const noop = () => {};
		page.find( 'form' ).simulate( 'submit', { preventDefault: noop, stopPropagation: noop } );

		expect( loginStub ).to.have.been.calledOnce;
		expect( loginStub.calledWith( 'user', 'pass', { auth_code: 'otp' } ) ).to.be.true;
	} );

	it( 'allows user to switch to the OTP form while waiting for push auth', function() {
		page.setState( { login: 'test', password: 'test', auth: { required2faType: 'push-verification' } } );

		expect( page.find( { name: 'login' } ).props().disabled ).to.be.true;
		expect( page.find( { name: 'password' } ).props().disabled ).to.be.true;
		expect( page.find( { name: 'use_auth_code' } ).length ).to.equal( 1 );
	} );

	it( 'verifying of push authentication calls push auth login', function() {
		const pushauth = { push_token: 'foo', user_id: 1234 };
		page.setState( { login: 'test', password: 'pass', auth: { required2faType: 'push-verification', pushauth } } );

		page.instance().verifyPushAuthentication();

		expect( pushAuthLoginStub ).to.have.been.calledOnce;
		expect( pushAuthLoginStub.calledWith( 'test', 'pass', pushauth ) ).to.be.true;
	} );

	it( 'polls for push token validation', function() {
		const pushauth = { push_token: 'foo', user_id: 1234 };
		page.setState( { login: 'test', password: 'pass', auth: { required2faType: 'push-verification', pushauth } } );

		const interval = page.find( 'Interval' );
		expect( interval ).to.have.length( 1 );
		expect( interval.props().onTick ).to.equal( page.instance().verifyPushAuthentication );
		expect( interval.props().period ).to.equal( EVERY_FIVE_SECONDS );
	} );

	it( 'stops polling upon switch to OTP code mode', function() {
		const pushauth = { push_token: 'foo', user_id: 1234 };
		page.setState( { login: 'test', password: 'pass', auth: { required2faType: 'push-verification', pushauth } } );

		page.setState( { auth: { required2faType: 'code' } } );

		expect( page.find( 'Interval' ) ).to.have.length( 0 );
	} );
} );
