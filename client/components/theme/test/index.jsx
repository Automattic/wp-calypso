require( 'lib/react-test-env-setup' )( '<html><body><div id="container"></div></body></html>' );

/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	sinon = require( 'sinon' ),
	mockery = require( 'mockery' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	TestUtils = require( 'react-addons-test-utils' );

var EmptyComponent = React.createClass( {
	render: function() {
		return <div/>;
	}
} );

describe( 'Theme', function() {
	before( function() {
		var MockMoreButton;

		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		mockery.registerMock( 'components/popover/menu', EmptyComponent );
		mockery.registerMock( 'components/popover/menu-item', EmptyComponent );

		this.togglePopoverStub = sinon.stub().returnsArg( 0 );
		MockMoreButton = require( '../more-button' );
		MockMoreButton.prototype.__reactAutoBindMap.togglePopover = this.togglePopoverStub;
		MockMoreButton.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
		mockery.registerMock( './more-button', MockMoreButton );

		this.Theme = require( '../' );
		this.container = document.getElementById( 'container' );
		this.Theme.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
	} );

	beforeEach( function() {
		this.props = {
			theme: {
				id: 'atheme',
				name: 'Theme name',
				screenshot: '/theme/screenshot.png',
			},
			buttonContents: { dummyAction: { label: 'Dummy action', action: sinon.spy() } } // TODO: test if called when clicked
		};
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( this.container );
	} );

	describe( 'rendering', function() {
		context( 'with default display buttonContents', function() {
			beforeEach( function() {
				this.props.onScreenshotClick = sinon.spy();

				this.theme = ReactDom.render(
					React.createElement( this.Theme, this.props ),
					this.container
				);

				this.themeNode = ReactDom.findDOMNode( this.theme );
			} );

			it( 'should render a <div> with a className of "theme"', function() {
				assert( this.themeNode !== null, 'DOM node doesn\'t exist' );
				assert( this.themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
				assert.include( this.themeNode.className, 'theme is-actionable', 'className does not contain "theme is-actionable"' );

				assert( this.themeNode.getElementsByTagName( 'h2' )[0].textContent === 'Theme name' );
			} );

			it( 'should render a screenshot', function() {
				var imgNode = this.themeNode.getElementsByTagName( 'img' )[0];
				assert.include( imgNode.getAttribute( 'src' ), '/theme/screenshot.png' );
			} );

			it( 'should call onScreenshotClick() on click on screenshot', function() {
				var imgNode = this.themeNode.getElementsByTagName( 'img' )[0];
				TestUtils.Simulate.click( imgNode );
				assert( this.props.onScreenshotClick.calledOnce, 'onClick did not trigger onScreenshotClick' );
			} );

			it( 'should not show a price when there is none', function() {
				assert( this.themeNode.getElementsByClassName( 'price' ).length === 0, 'price should not appear' );
			} );

			it( 'should render a More button', function() {
				var more = this.themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 1, 'More button container not found' );
				assert( more[0].getElementsByTagName( 'button' ).length === 1, 'More button not found' );
				TestUtils.Simulate.click( more[0].getElementsByTagName( 'button' )[0] );
				assert( this.togglePopoverStub.calledOnce, 'More button press does not trigger state toggle' );
			} );
		} );

		context( 'with empty buttonContents', function() {
			beforeEach( function() {
				this.props.buttonContents = {};

				this.theme = ReactDom.render(
					React.createElement( this.Theme, this.props ),
					this.container
				);

				this.themeNode = ReactDom.findDOMNode( this.theme );
			} );

			it( 'should not render a More button', function() {
				var more = this.themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 0, 'More button container found' );
			} );
		} );
	} );

	context( 'when isPlaceholder is set to true', function() {
		beforeEach( function() {
			this.theme = ReactDom.render(
				React.createElement( this.Theme, { theme: { id: 'placeholder-1', name: 'Loading' }, isPlaceholder: true } ),
				this.container
			);

			this.themeNode = ReactDom.findDOMNode( this.theme );
		} );

		it( 'should render a <div> with an is-placeholder class', function() {
			assert( this.themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
			assert.include( this.themeNode.className, 'is-placeholder', 'no is-placeholder' );
		} );
	} );

	context( 'when the theme has a price', function() {
		beforeEach( function() {
			this.props.theme.price = '$50';
			this.theme = ReactDom.render(
				React.createElement( this.Theme, this.props ),
				this.container
			);

			this.themeNode = ReactDom.findDOMNode( this.theme );
		} );

		it( 'should show a price', function() {
			assert( this.themeNode.getElementsByClassName( 'price' )[0].textContent === '$50' );
		} );
	} );
} );
