/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'Theme', function() {
	let ReactDom, React, TestUtils, Theme, togglePopoverStub;

	useFakeDom();

	useMockery( mockery => {
		ReactDom = require( 'react-dom' );
		React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );

		let EmptyComponent = React.createClass( {
			render: function() {
				return <div/>;
			}
		} );

		mockery.registerMock( 'components/popover/menu', EmptyComponent );
		mockery.registerMock( 'components/popover/menu-item', EmptyComponent );

		togglePopoverStub = sinon.stub().returnsArg( 0 );
		let MockMoreButton = require( '../more-button' );
		MockMoreButton.prototype.togglePopover = togglePopoverStub;
		mockery.registerMock( './more-button', MockMoreButton );

		Theme = require( '../' );
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

	describe( 'rendering', function() {
		context( 'with default display buttonContents', function() {
			beforeEach( function() {
				this.props.onScreenshotClick = sinon.spy();
				let themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, this.props ) );
				this.themeNode = ReactDom.findDOMNode( themeElement );
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
				assert( togglePopoverStub.calledOnce, 'More button press does not trigger state toggle' );
			} );
		} );

		context( 'with empty buttonContents', function() {
			beforeEach( function() {
				this.props.buttonContents = {};
				let themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, this.props ) );
				this.themeNode = ReactDom.findDOMNode( themeElement );
			} );

			it( 'should not render a More button', function() {
				var more = this.themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 0, 'More button container found' );
			} );
		} );
	} );

	context( 'when isPlaceholder is set to true', function() {
		beforeEach( function() {
			let themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, { theme: { id: 'placeholder-1', name: 'Loading' }, isPlaceholder: true } )
			);
			this.themeNode = ReactDom.findDOMNode( themeElement );
		} );

		it( 'should render a <div> with an is-placeholder class', function() {
			assert( this.themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
			assert.include( this.themeNode.className, 'is-placeholder', 'no is-placeholder' );
		} );
	} );

	context( 'when the theme has a price', function() {
		beforeEach( function() {
			this.props.theme.price = '$50';
			let themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, this.props )
			);
			this.themeNode = ReactDom.findDOMNode( themeElement );
		} );

		it( 'should show a price', function() {
			assert( this.themeNode.getElementsByClassName( 'price' )[0].textContent === '$50' );
		} );
	} );
} );
