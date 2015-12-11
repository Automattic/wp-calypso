require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	sinon = require( 'sinon' ),
	mockery = require( 'mockery' ),
	TestUtils = React.addons.TestUtils;

describe( 'SingleDoc', function () {

	beforeEach( function () {
		mockery.registerMock( './service', {
			fetch: function ( path, cb ) {
				cb( this.fetchResponse || '' );
			}.bind( this )
		} );
		mockery.enable();
		mockery.warnOnUnregistered( false );

		this.singleDocClass = require( '../doc.jsx' );
		this.singleDocClass.prototype.__reactAutoBindMap.translate = sinon.stub();

	} );

	afterEach( function () {
		mockery.deregisterMock( './service' );
		mockery.disable();

		delete this.fetchResponse;
		delete this.singleDocClass.prototype.__reactAutoBindMap.translate;
	} );

	describe( 'makeSnip', function () {

		context( 'render test', function () {
			beforeEach( function () {
				this.fetchResponse = '<div><p>something hello</p></div>';
				this.path = '/example';
				this.term = 'hello';
				this.singleDocElement = React.createElement( this.singleDocClass, {
					path: this.path,
					term: this.term
				} );
				this.rendered = TestUtils.renderIntoDocument( this.singleDocElement );
			} );

			it( 'should render html with marked text', function () {
				this.rendered.setState( { body: this.fetchResponse } );
				this.rendered.render();
				var html = ReactDom.findDOMNode( this.rendered.refs.body ).innerHTML;
				expect( html ).to.equal( '<div><p>something <mark>hello</mark></p></div>' );
			} );
		} );

	} );

} );

