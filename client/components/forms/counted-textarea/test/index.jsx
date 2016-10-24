/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	TestUtils = require( 'react-addons-test-utils' ),
	expect = require( 'chai' ).expect,
	i18n = require( 'i18n-calypso' );

describe( 'index', function() {
	var CountedTextarea, renderer;

	before( function() {
		ReactInjection.Class.injectMixin( i18n.mixin );
		CountedTextarea = require( '../' );
	} );

	beforeEach( function() {
		renderer = TestUtils.createRenderer();
	} );

	it( 'should render the character count of the passed value', function() {
		var result;

		renderer.render( <CountedTextarea value="Hello World!" /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[1].props.children[0] ).to.equal( '12 characters' );
	} );

	it( 'should render warning styles when the acceptable length is exceeded', function() {
		var result;

		renderer.render( <CountedTextarea value="Hello World!" acceptableLength={ 10 } /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea is-exceeding-acceptable-length' );
	} );

	it( 'should apply className to the wrapper element', function() {
		var result;

		renderer.render( <CountedTextarea value="Hello World!" className="custom-class" /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea custom-class' );
	} );

	it( 'should pass props to the child textarea', function() {
		var value = 'Hello World!',
			placeholder = 'placeholder test',
			result;

		renderer.render( <CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[0].props.value ).to.equal( value );
		expect( result.props.children[0].props.placeholder ).to.equal( placeholder );
		expect( result.props.children[0].props.className ).to.equal( 'counted-textarea__input' );
	} );

	it( 'should not use the placeholder as the counted item if value is empty and countPlaceholderLength is not set', function() {
		var value = '',
			placeholder = 'placeholder test',
			result;

		renderer.render( <CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children[1].props.children[0] ).to.equal( '0 characters' );
	} );

	it( 'should use the placeholder as the counted item if value is empty and countPlaceholderLength is true', function() {
		var value = '',
			placeholder = 'placeholder test',
			result;

		renderer.render( <CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } countPlaceholderLength={ true } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children[1].props.children[0] ).to.equal( '16 characters' );
	} );

	it( 'should use the value as the counted item if value is set', function() {
		var value = 'Hello World!',
			placeholder = 'placeholder test',
			result;

		renderer.render( <CountedTextarea value={ value } className="custom-class" placeholder={ placeholder }/> );
		result = renderer.getRenderOutput();

		expect( result.props.children[1].props.children[0] ).to.equal( '12 characters' );
	} );

	it( 'should not pass acceptableLength prop to the child textarea', function() {
		var value = 'Hello World!',
			acceptableLength = 140,
			result;

		renderer.render( <CountedTextarea value={ value } className="custom-class" acceptableLength={ acceptableLength } /> );
		result = renderer.getRenderOutput();

		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[0].props.value ).to.equal( value );
		expect( result.props.children[0].props.acceptableLength ).to.be.undefined;
		expect( result.props.children[0].props.className ).to.equal( 'counted-textarea__input' );
	} );

	it( 'should render a reversed count when set to showRemainingCount', function() {
		var value = 'Hello World!',
			acceptableLength = 140,
			result;

		renderer.render( <CountedTextarea value={ value } acceptableLength={ acceptableLength } showRemainingCharacters={ true } /> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[1].props.children[0] ).to.equal( '128 characters remaining' );
	} );

	it( 'should render additional panel content when set', function() {
		var value = 'Hello World!',
			acceptableLength = 140,
			additionalPanelContent = 'Extra stuff',
			result;

		renderer.render( <CountedTextarea value={ value } acceptableLength={ acceptableLength } showRemainingCharacters={ true } > { additionalPanelContent } </CountedTextarea> );
		result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[1].props.children[0] ).to.equal( '128 characters remaining' );
		expect( result.props.children[1].props.children[1][1] ).to.equal( 'Extra stuff' );
	} );
} );
