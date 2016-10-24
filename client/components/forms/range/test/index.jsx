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

describe( 'index', function() {
	require( 'test/helpers/use-fake-dom' )();
	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	it( 'should render beginning content if passed a `minContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange minContent={ <span className="noticon noticon-minus" /> } /> );
		TestUtils.findRenderedDOMComponentWithClass( range, 'noticon-minus' );
	} );

	it( 'should not render ending content if not passed a `maxContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange minContent={ <span className="noticon noticon-minus" /> } /> ),
			content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[0].getAttribute( 'class' ) ).to.contain( 'is-min' );
	} );

	it( 'should render ending content if passed a `maxContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <span className="noticon noticon-plus" /> } /> );
		TestUtils.findRenderedDOMComponentWithClass( range, 'noticon-plus' );
	} );

	it( 'should not render beginning content if not passed a `minContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <span className="noticon noticon-plus" /> } /> ),
			content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[0].getAttribute( 'class' ) ).to.contain( 'is-max' );
	} );

	it( 'should render a value label if passed a truthy `showValueLabel` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange value={ 8 } showValueLabel={ true } readOnly={ true } /> ),
			label = TestUtils.findRenderedDOMComponentWithClass( range, 'range__label' );

		expect( label.textContent ).to.equal( '8' );
	} );
} );
