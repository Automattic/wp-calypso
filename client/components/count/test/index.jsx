/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	TestUtils = React.addons.TestUtils,
	expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' );

describe( 'Count', function() {
	var Count, renderer;

	before( function() {
		i18n.initialize();
		ReactInjection.Class.injectMixin( i18n.mixin );
		Count = require( '../' );
	} );

	beforeEach( function() {
		renderer = TestUtils.createRenderer();
	} );

	it( 'should render the passed count', function() {
		var result;

		renderer.render( <Count count={ 23 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'count' );
		expect( result.props.children ).to.equal( '23' );
	} );

	it( 'should use the correct class name', function() {
		var result;

		renderer.render( <Count count={ 23 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'count' );
	} );

	it( 'should internationalize the passed count', function() {
		var result;

		renderer.render( <Count count={ 2317 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.equal( '2,317' );
	} );

	it( 'should render zero', function() {
		var result;

		renderer.render( <Count count={ 0 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.equal( '0' );
	} );

	it( 'should render negative numbers', function() {
		var result;

		renderer.render( <Count count={ -1000 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.equal( '-1,000' );
	} );

	it( 'should cut off floating point numbers', function() {
		var result;

		renderer.render( <Count count={ 3.1415926 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.equal( '3' );
	} );

	it( 'should warn when passing something that is not a number', function() {
		var result, oldWarn;

		// replace console.warn so the warning isn't shown when running the test
		oldWarn = console.warn;
		console.warn = function() {};

		sinon.spy( console, 'warn' );
		renderer.render( <Count count={ "17" } /> );
		expect( console.warn ).to.have.been.called;

		// put back the old console.warn
		console.warn = oldWarn;
	} );

} );
