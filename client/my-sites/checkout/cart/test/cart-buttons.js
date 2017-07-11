/**
 * @jest-environment jsdom
 */

/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

describe.skip( 'cart-buttons', function() {
	let recordStub, onKeepSearchingClickStub, CartButtons;

	useSandbox( ( sandbox ) => {
		recordStub = sandbox.stub();
		onKeepSearchingClickStub = sandbox.stub();
	} );

	const AnalyticsMixinStub = () => ( {
		recordEvent: recordStub
	} );

	useMockery( mockery => {
		mockery.registerMock( 'lib/mixins/analytics', AnalyticsMixinStub );
		CartButtons = require( '../cart-buttons.jsx' ).CartButtons;
	} );

	describe( 'Click on Keep Searching Button', function() {
		beforeEach( function() {
			this.cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ {slug: 'example.com'} }
					showKeepSearching={ true }
					onKeepSearchingClick={ onKeepSearchingClickStub }
					translate={ identity }
					/>
			);
		} );

		it( 'should track "keepSearchButtonClick" event', function() {
			this.cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'keepSearchButtonClick' );
		} );

		it( 'call props.onKeepSearchingClick', function() {
			this.cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( onKeepSearchingClickStub ).to.have.been.called;
		} );
	} );
	describe( 'Click on Checkout Button', function() {
		beforeEach( function() {
			this.cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ {slug: 'example.com'} }
					translate={ identity }
					/>
			);
		} );

		it( 'should track "checkoutButtonClick" event', function() {
			this.cartButtonsComponent.find( '.cart-checkout-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'checkoutButtonClick' );
		} );
	} );
} );
