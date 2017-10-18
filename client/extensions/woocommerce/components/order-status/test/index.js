/**
 * External dependencies
 *
 * @format
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
		const wrapper = shallow( <OrderStatus status={ 'pending' } translate={ identity } /> );
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only payment label when showShipping is false', () => {
		const wrapper = shallow(
			<OrderStatus status={ 'pending' } showShipping={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 0 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only payment label when shipping does not apply to this status', () => {
		const wrapper = shallow(
			<OrderStatus status={ 'refunded' } showShipping={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 0 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 1 );
	} );

	test( 'should render only shipping label when showPayment is false', () => {
		const wrapper = shallow(
			<OrderStatus status={ 'completed' } showPayment={ false } translate={ identity } />
		);
		expect( wrapper.find( '.order-status__item' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__shipping' ) ).to.have.length( 1 );
		expect( wrapper.find( '.order-status__payment' ) ).to.have.length( 0 );
	} );

	test( 'should not render anything if the status is not recognized', () => {
		const wrapper = shallow( <OrderStatus status={ 'fake-status' } translate={ identity } /> );
		expect( wrapper.getNode() ).to.be.null;
	} );
} );
