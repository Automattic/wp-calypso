/**
 * External dependencies
 */

import React from 'react';
import { expect } from 'chai';
import { identity } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { OrderStatus } from '../';

describe( 'OrderStatus', () => {
	test( 'should render a label with shipping and payment content', () => {
		const order = {
			status: 'pending',
			payment_method: 'paypal',
		};
		const wrapper = shallow( <OrderStatus order={ order } translate={ identity } /> );
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__item' ).hasClass( 'is-pending' ) ).to.equal( true );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only payment label when showShipping is false', () => {
		const order = { status: 'pending' };
		const wrapper = shallow(
			<OrderStatus order={ order } showShipping={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 0 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only payment label when shipping does not apply to this status', () => {
		const order = { status: 'refunded' };
		const wrapper = shallow(
			<OrderStatus order={ order } showShipping={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__item' ).hasClass( 'is-refunded' ) ).to.equal( true );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 0 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only shipping label when showPayment is false', () => {
		const order = { status: 'completed' };
		const wrapper = shallow(
			<OrderStatus order={ order } showPayment={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__item' ).hasClass( 'is-completed' ) ).to.equal( true );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 0 );
	} );

	test( 'should render correct labels for a processing cash-on-delivery order', () => {
		const order = {
			status: 'processing',
			payment_method: 'cod',
		};
		const wrapper = shallow( <OrderStatus order={ order } translate={ identity } /> );
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__item' ).hasClass( 'is-processing' ) ).to.equal( true );
		expect( wrapper.find( '.order-status__shipping' ).text() ).to.eql( 'New order' );
		expect( wrapper.find( '.order-status__payment' ).text() ).to.eql( 'Paid on delivery' );
	} );

	test( 'should not render anything if the status is not recognized', () => {
		const order = { status: 'fake-status' };
		const wrapper = shallow( <OrderStatus order={ order } translate={ identity } /> );
		expect( wrapper.getElement() ).to.be.null;
	} );
} );
