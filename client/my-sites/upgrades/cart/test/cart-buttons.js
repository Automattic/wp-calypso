/**
 * External Dependencies
 */
const sinon = require( 'sinon' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	TestUtils = require( 'react-addons-test-utils' ),
	{ expect } = require( 'chai' );

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'cart-buttons', function() {
	useFakeDom();

	beforeEach( function() {
		this.CartButtons = require( '../cart-buttons.jsx' );
		this.CartButtons.prototype.translate = sinon.stub();
		this.recordStub = this.CartButtons.prototype.__reactAutoBindMap.recordEvent = sinon.stub();
	} );

	afterEach( function() {
		delete this.CartButtons.prototype.translate;
		delete this.CartButtons.prototype.__reactAutoBindMap.recondEvent;
	} );

	describe( 'Click on Keep Searching Button', function() {
		beforeEach( function() {
			this.onKeepSearchingClick = sinon.stub();
			this.cartButtonsComponent = TestUtils.renderIntoDocument(
				<this.CartButtons
					selectedSite={ {slug: 'example.com'} }
					showKeepSearching={ true }
					onKeepSearchingClick={ this.onKeepSearchingClick }
					/>
			);
		} );

		it( 'should track "keepSearchButtonClick" event', function() {
			TestUtils.Simulate.click( ReactDom.findDOMNode( this.cartButtonsComponent.refs.keepSearchingButton ) );
			expect( this.recordStub ).to.have.been.calledWith( 'keepSearchButtonClick' );
		} );

		it( 'call props.onKeepSearchingClick', function() {
			TestUtils.Simulate.click( ReactDom.findDOMNode( this.cartButtonsComponent.refs.keepSearchingButton ) );
			expect( this.onKeepSearchingClick ).to.have.been.called;
		} );
	} );
	describe( 'Click on Checkout Button', function() {
		beforeEach( function() {
			this.cartButtonsComponent = TestUtils.renderIntoDocument(
				<this.CartButtons
					selectedSite={ {slug: 'example.com'} }
					/>
			);
		} );

		it( 'should track "checkoutButtonClick" event', function() {
			TestUtils.Simulate.click( ReactDom.findDOMNode( this.cartButtonsComponent.refs.checkoutButton ) );
			expect( this.recordStub ).to.have.been.calledWith( 'checkoutButtonClick' );
		} );
	} );
} );
