/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/oauth-store/actions', () => ( {
	login: require( 'sinon' ).stub()
} ) );
jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {}
	}
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { login as loginStub } from 'lib/oauth-store/actions';

describe( 'LoginTest', function() {
	let Login, page, React, ReactDom, ReactClass, TestUtils;

	before( () => {
		React = require( 'react' );
		ReactDom = require( 'react-dom' );
		ReactClass = require( 'react/lib/ReactClass' );
		TestUtils = require( 'react-addons-test-utils' );
		ReactClass.injection.injectMixin( { translate: identity } );
		Login = require( '../login.jsx' );

		const container = document.createElement( 'div' );
		page = ReactDom.render( <Login />, container );
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
		page.setState( { login: 'test', password: 'test', requires2fa: true }, function() {
			expect( page.refs.auth_code ).to.not.be.undefined;
			done();
		} );
	} );

	it( 'prevents change of login when asking for OTP', function( done ) {
		page.setState( { login: 'test', password: 'test', requires2fa: true }, function() {
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
			expect( loginStub.calledWith( 'user', 'pass', 'otp' ) ).to.be.true;
			done();
		} );
	} );
} );
