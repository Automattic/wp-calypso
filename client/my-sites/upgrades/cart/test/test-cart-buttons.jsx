require( 'lib/react-test-env-setup' )();

/**
 * External Dependencies
 */
var	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	chai = require( 'chai' );

chai.use( sinonChai );

describe( 'Cart Buttons', function() {
	beforeEach( function() {
		this.CartButtons = require( '../cart-buttons.jsx' );
		this.CartButtons.prototype.__reactAutoBindMap.translate = sinon.stub();
		this.recordStub = this.CartButtons.prototype.__reactAutoBindMap.recordEvent = sinon.stub();
	} );

	afterEach( function() {
		delete this.CartButtons.prototype.__reactAutoBindMap.translate;
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
			chai.expect( this.recordStub ).to.have.been.calledWith( 'keepSearchButtonClick' );
		} );

		it( 'call props.onKeepSearchingClick', function() {
			TestUtils.Simulate.click( ReactDom.findDOMNode( this.cartButtonsComponent.refs.keepSearchingButton ) );
			chai.expect( this.onKeepSearchingClick ).to.have.been.called;
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
			chai.expect( this.recordStub ).to.have.been.calledWith( 'checkoutButtonClick' );
		} );
	} );
} );
