require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils;

/**
 * Internal dependencies
 */
var FormRange = require( '../' );

describe( 'Range', function() {
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
		expect( content[0].props.className ).to.contain( 'is-min' );
	} );

	it( 'should render ending content if passed a `maxContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <span className="noticon noticon-plus" /> } /> );
		TestUtils.findRenderedDOMComponentWithClass( range, 'noticon-plus' );
	} );

	it( 'should not render beginning content if not passed a `minContent` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange maxContent={ <span className="noticon noticon-plus" /> } /> ),
			content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[0].props.className ).to.contain( 'is-max' );
	} );

	it( 'should render a value label if passed a truthy `showValueLabel` prop', function() {
		var range = TestUtils.renderIntoDocument( <FormRange value={ 8 } showValueLabel={ true } readOnly={ true } /> ),
			label = TestUtils.findRenderedDOMComponentWithClass( range, 'range__label' );

		expect( label.getDOMNode().textContent ).to.equal( '8' );
	} );
} );
