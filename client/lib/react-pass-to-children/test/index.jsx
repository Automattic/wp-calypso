/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	assign = require( 'lodash/object/assign' ),
	expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var passToChildren = require( '../' );

/**
 * Module variables
 */
var DUMMY_PROPS = { data: [ 1, 2, 3 ] },
	PassThrough;

PassThrough = React.createClass( {
	render: function() {
		return passToChildren( this, DUMMY_PROPS );
	}
} );

describe( '#passToChildren()', function() {
	var renderer;

	beforeEach( function() {
		renderer = TestUtils.createRenderer();
	} );

	it( 'should accept a single child and pass along props', function() {
		var result;

		renderer.render( <PassThrough><div /></PassThrough> );
		result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( DUMMY_PROPS );
	} );

	it( 'should accept multiple children and wrap them in a div', function() {
		var result;

		renderer.render( <PassThrough><div /><div /></PassThrough> );
		result = renderer.getRenderOutput();

		expect( React.Children.count( result ) ).to.equal( 1 );
		expect( result.type ).to.eql( 'div' );
		expect( React.Children.count( result.props.children ) ).to.equal( 2 );
	} );

	it( 'should accept multiple children and pass along props to each', function( done ) {
		var result;

		renderer.render( <PassThrough><div /><div /></PassThrough> );
		result = renderer.getRenderOutput();

		React.Children.forEach( result.props.children, function( child, i ) {
			expect( child.type ).to.equal( 'div' );
			expect( child.props ).to.eql( DUMMY_PROPS );

			if ( 1 === i ) {
				done();
			}
		} );
	} );

	it( 'should accept multiple children, including nulls', function() {
		var result;

		renderer.render( <PassThrough>{ null }<div /></PassThrough> );
		result = renderer.getRenderOutput();

		expect( React.Children.count( result.props.children ) ).to.equal( 1 );
		expect( React.Children.toArray( result.props.children )[ 0 ].props ).to.eql( DUMMY_PROPS );
	} );

	it( 'should preserve props passed to the children', function() {
		var result;

		renderer.render( <PassThrough><div preserve /></PassThrough> );
		result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( assign( {}, DUMMY_PROPS, {
			preserve: true
		} ) );
	} );

	it( 'should preserve props passed to the instance itself', function() {
		var result;

		renderer.render( <PassThrough preserve><div /></PassThrough> );
		result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( assign( {}, DUMMY_PROPS, {
			preserve: true
		} ) );
	} );
} );
