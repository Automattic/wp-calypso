/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/mixins/analytics', () => {
	const recordStub = require( 'sinon' ).stub();

	const analytics = () => ( {
		recordEvent: recordStub
	} );
	analytics.recordStub = recordStub;

	return analytics;
} );

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
import CartButtons from '../cart-buttons';
import { recordStub } from 'lib/mixins/analytics';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'cart-buttons', function() {
	let cartButtonsComponent, onKeepSearchingClickStub;

	useSandbox( ( sandbox ) => {
		onKeepSearchingClickStub = sandbox.stub();
	} );

	describe( 'Click on Keep Searching Button', function() {
		beforeEach( function() {
			cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ {slug: 'example.com'} }
					showKeepSearching={ true }
					onKeepSearchingClick={ onKeepSearchingClickStub }
					translate={ identity }
					/>
			);
		} );

		it( 'should track "keepSearchButtonClick" event', function() {
			cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'keepSearchButtonClick' );
		} );

		it( 'call props.onKeepSearchingClick', function() {
			cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( onKeepSearchingClickStub ).to.have.been.called;
		} );
	} );
	describe( 'Click on Checkout Button', function() {
		beforeEach( function() {
			cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ {slug: 'example.com'} }
					translate={ identity }
					/>
			);
		} );

		it( 'should track "checkoutButtonClick" event', function() {
			cartButtonsComponent.find( '.cart-checkout-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'checkoutButtonClick' );
		} );
	} );
} );
