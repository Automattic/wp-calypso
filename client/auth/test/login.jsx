/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */

const ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	i18n = require( 'lib/mixins/i18n' ),
	expect = require( 'chai' ).expect,
	sinon = require( 'sinon' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	TestUtils = React.addons.TestUtils;

/**
 * Internal dependencies
 */
const AuthActions = require( 'lib/oauth-store/actions' );

// Handle initialization here instead of in `before()` to avoid timeouts. See client/post-editor/test/post-editor.jsx
i18n.initialize();
ReactInjection.Class.injectMixin( i18n.mixin );

let Login = require( '../login.jsx' );
const page = ReactDom.render( <Login />, document.body );

describe( 'LoginTest', function() {
	it( 'OTP is not present on first render', function( done ) {
		page.setState( { requires2fa: false }, function() {
			expect( page.refs.auth_code ).to.be.undefined;
			done();
		} );
	} );

	it( 'cannot submit until login details entered', function( done ) {
		var submit = TestUtils.findRenderedDOMComponentWithTag( page, 'button' );

		page.setState( { login: 'test', password: 'test', inProgress: false }, function() {
			expect( submit.props.disabled ).to.be.false;
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
		var submit = TestUtils.findRenderedDOMComponentWithTag( page, 'form' );

		sinon.stub( AuthActions, 'login' );

		page.setState( { login: 'user', password: 'pass', auth_code: 'otp' }, function() {
			TestUtils.Simulate.submit( submit );

			expect( AuthActions.login ).to.have.been.calledOnce;
			expect( AuthActions.login.calledWith( 'user', 'pass', 'otp' ) ).to.be.true;

			AuthActions.login.restore();
			done();
		} );
	} );
} );
