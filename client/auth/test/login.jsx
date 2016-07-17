/**
 * External dependencies
 */
import { expect } from 'chai';
import identity from 'lodash/identity';
import { stub, useFakeTimers } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'LoginTest', function() {
	let Login, loginStub, pushAuthLoginStub, page, React, ReactDom, ReactInjection, TestUtils;

	const POLL_INTERVAL = 6000;

	useFakeDom.withContainer();
	useMockery( ( mockery ) => {
		loginStub = stub();
		pushAuthLoginStub = stub();
		mockery.registerMock( 'lib/oauth-store/actions', {
			login: loginStub,
			pushAuthLogin: pushAuthLoginStub
		} );
	} );

	let clock;
	beforeEach( () => {
		clock = useFakeTimers();
		pushAuthLoginStub.reset();
	} );
	afterEach( () => {
		clock.restore();

		clearTimeout( page.pollTimeout );
		page.pollTimeout = null;
	} );

	before( () => {
		React = require( 'react' );
		ReactDom = require( 'react-dom' );
		ReactInjection = require( 'react/lib/ReactInjection' );
		TestUtils = require( 'react-addons-test-utils' );
		ReactInjection.Class.injectMixin( { translate: identity } );
		Login = require( '../login.jsx' );
		page = ReactDom.render( <Login />, useFakeDom.getContainer() );
	} );

	it( 'OTP is not present on first render', function( done ) {
		page.setState( { requires2fa: false }, function() {
			expect( page.refs.auth_code ).to.be.undefined;
			done();
		} );
	} );

	it( 'cannot submit until login details entered', function( done ) {
		const submit = TestUtils.findRenderedDOMComponentWithTag( page, 'button' );

		page.setState( { login: 'test', password: 'test', inProgress: false }, function() {
			expect( submit.disabled ).to.be.false;
			done();
		} );
	} );

	it( 'shows OTP box with valid login', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: 'code' }, function() {
			expect( page.refs.auth_code ).to.not.be.undefined;
			done();
		} );
	} );

	it( 'prevents change of login when asking for OTP', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: 'code' }, function() {
			expect( page.refs.login.props.disabled ).to.be.true;
			expect( page.refs.password.props.disabled ).to.be.true;
			done();
		} );
	} );

	it( 'submits login form', function( done ) {
		const submit = TestUtils.findRenderedDOMComponentWithTag( page, 'form' );

		page.setState( { login: 'user', password: 'pass', auth_code: 'otp' }, function() {
			TestUtils.Simulate.submit( submit );

			expect( loginStub ).to.have.been.calledOnce;
			expect( loginStub.calledWith( 'user', 'pass', { auth_code: 'otp' } ) ).to.be.true;
			done();
		} );
	} );

	it( 'allows user to switch to the OTP form while waiting for push auth', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: 'push-verification' }, function() {
			expect( page.refs.login.props.disabled ).to.be.true;
			expect( page.refs.password.props.disabled ).to.be.true;
			expect( page.refs.useAuthCode ).to.not.be.undefined;
			done();
		} );
	} );

	it( 'polls for push token validation', function( done ) {
		const pushauth = { push_token: 'foo', user_id: 1234 };
		page.setState( {
			login: 'test',
			password: 'pass',
			requires2fa: 'push-verification',
			pushauth
		}, function() {
			clock.tick( POLL_INTERVAL - 10 );
			expect( pushAuthLoginStub ).to.not.have.been.called;

			clock.tick( POLL_INTERVAL );
			expect( pushAuthLoginStub ).to.have.been.calledOnce;
			expect( pushAuthLoginStub.calledWith( 'test', 'pass', pushauth ) ).to.be.true;
			done();
		} );
	} );

	it( 'stops polling upon switch to OTP code mode', function( done ) {
		page.setState( {
			login: 'test',
			password: 'pass',
			requires2fa: 'push-verification',
			pushauth: { push_token: 'foo', user_id: 1234 }
		}, function() {
			page.setState( { requires2fa: 'code' }, function() {
				clock.tick( POLL_INTERVAL );
				expect( pushAuthLoginStub ).to.not.have.been.called;
				done();
			} );
		} );
	} );
} );
