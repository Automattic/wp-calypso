/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CartButtons from '../cart-buttons';
import { recordStub } from 'lib/mixins/analytics';
import page from 'page';
import { useSandbox } from 'test/helpers/use-sinon';

jest.mock( 'lib/mixins/analytics', () => {
	const recordEventStub = require( 'sinon' ).stub();

	const analytics = () => ( {
		recordEvent: recordEventStub,
	} );
	analytics.recordStub = recordEventStub;

	return analytics;
} );

jest.mock( 'page', () => require( 'sinon' ).stub() );

describe( 'cart-buttons', () => {
	let cartButtonsComponent, onKeepSearchingClickStub;

	useSandbox( sandbox => {
		onKeepSearchingClickStub = sandbox.stub();
	} );

	describe( 'Click on Keep Searching Button', () => {
		beforeEach( () => {
			cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ { slug: 'example.com' } }
					showKeepSearching={ true }
					onKeepSearchingClick={ onKeepSearchingClickStub }
					translate={ identity }
				/>
			);
		} );

		test( 'should track "keepSearchButtonClick" event', () => {
			cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'keepSearchButtonClick' );
		} );

		test( 'call props.onKeepSearchingClick', () => {
			cartButtonsComponent.find( '.cart-keep-searching-button' ).simulate( 'click' );
			expect( onKeepSearchingClickStub ).to.have.been.called;
		} );
	} );
	describe( 'Click on Checkout Button', () => {
		beforeEach( () => {
			cartButtonsComponent = mount(
				<CartButtons selectedSite={ { slug: 'example.com' } } translate={ identity } />
			);
		} );

		test( 'should track "checkoutButtonClick" event', () => {
			cartButtonsComponent.find( '.cart-checkout-button' ).simulate( 'click' );
			expect( recordStub ).to.have.been.calledWith( 'checkoutButtonClick' );
			expect( page ).to.have.been.calledWith( '/checkout/example.com' );
		} );
	} );
} );
