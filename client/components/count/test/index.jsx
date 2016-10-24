/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	sinon = require( 'sinon' ),
	useMockery = require( 'test/helpers/use-mockery' );

describe( 'Count', function() {
	var React, ReactInjection, TestUtils, Count, renderer;

	// really only using Mockery for the clean module cache
	useMockery();

	before( function() {
		React = require( 'react' );
		ReactInjection = require( 'react/lib/ReactInjection' );
		TestUtils = require( 'react-addons-test-utils' );

		ReactInjection.Class.injectMixin( require( 'i18n-calypso' ).mixin );
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

	it( 'should warn when passing something that is not a number', sinon.test( function() {
		this.stub( console, 'error' );
		renderer.render( <Count count={ "17" } /> );
		expect( console.error ).to.have.been.called;
	} ) );
} );
