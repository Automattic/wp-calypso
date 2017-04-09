/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	TestUtils = require( 'react-addons-test-utils' );

/**
 * Internal dependencies
 */
var FormRange = require( '../' );
var Gridicon = require( 'gridicons' );

describe( 'index', function() {
	require( 'test/helpers/use-fake-dom' )();
	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	it( 'should render beginning content if passed a `minContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange minContent={ <Gridicon icon="minus-small" /> } /> );
		TestUtils.findRenderedDOMComponentWithClass( range, 'gridicons-minus-small' );
	} );

	it( 'should not render ending content if not passed a `maxContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange minContent={ <Gridicon icon="minus-small" /> } /> ),
			content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).to.contain( 'is-min' );
	} );

	it( 'should render ending content if passed a `maxContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <Gridicon icon="plus-small" /> } /> );
		TestUtils.findRenderedDOMComponentWithClass( range, 'gridicons-plus-small' );
	} );

	it( 'should not render beginning content if not passed a `minContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <Gridicon icon="plus-small" /> } /> ),
			content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).to.contain( 'is-max' );
	} );

	it( 'should render a value label if passed a truthy `showValueLabel` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange value={ 8 } showValueLabel={ true } readOnly={ true } /> ),
			label = TestUtils.findRenderedDOMComponentWithClass( range, 'range__label' );

		expect( label.textContent ).to.equal( '8' );
	} );
} );
