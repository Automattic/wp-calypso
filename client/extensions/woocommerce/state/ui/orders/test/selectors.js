/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getCurrentlyEditingOrderId,
	getOrdersCurrentPage,
	getOrdersCurrentSearch,
	getOrderEdits,
	getOrderWithEdits,
	isCurrentlyEditingOrder,
} from '../selectors';
import { state, order } from './fixtures/detailed-state';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};

describe( 'selectors', () => {
	describe( '#getCurrentlyEditingOrderId', () => {
		it( 'should be null (default) when woocommerce state is not available', () => {
			expect( getCurrentlyEditingOrderId( preInitializedState, 123 ) ).to.be.null;
		} );

		it( 'should get the correct ID when an order is being edited', () => {
			expect( getCurrentlyEditingOrderId( state, 123 ) ).to.eql( 40 );
		} );

		it( 'should get the correct ID when a new order has been created', () => {
			expect( getCurrentlyEditingOrderId( state, 345 ) ).to.eql( { placeholder: 'order_1' } );
		} );

		it( 'should be null when no orders are being edited', () => {
			expect( getCurrentlyEditingOrderId( state, 234 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getCurrentlyEditingOrderId( state ) ).to.eql( 40 );
		} );
	} );

	describe( '#getOrdersCurrentPage', () => {
		it( 'should be 1 (default) when woocommerce state is not available', () => {
			expect( getOrdersCurrentPage( preInitializedState, 123 ) ).to.eql( 1 );
		} );

		it( 'should get the current order page', () => {
			expect( getOrdersCurrentPage( state, 123 ) ).to.eql( 2 );
		} );

		it( 'should get the current order page for a second site in the state', () => {
			expect( getOrdersCurrentPage( state, 234 ) ).to.eql( 5 );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrdersCurrentPage( state ) ).to.eql( 2 );
		} );
	} );

	describe( '#getOrdersCurrentSearch', () => {
		it( 'should be any (default) when woocommerce state is not available', () => {
			expect( getOrdersCurrentSearch( preInitializedState, 123 ) ).to.eql( '' );
		} );

		it( 'should get the current search term', () => {
			expect( getOrdersCurrentSearch( state, 123 ) ).to.eql( 'example' );
		} );

		it( 'should get the current search term for a second site in the state', () => {
			expect( getOrdersCurrentSearch( state, 234 ) ).to.eql( 'test' );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrdersCurrentSearch( state ) ).to.eql( 'example' );
		} );
	} );

	describe( '#getOrderEdits', () => {
		it( 'should be an empty object (default) when woocommerce state is not available', () => {
			expect( getOrderEdits( preInitializedState, 123 ) ).to.eql( {} );
		} );

		it( 'should get the changes when an order is being edited', () => {
			expect( getOrderEdits( state, 123 ) ).to.eql( { billing: { first_name: 'Joan' } } );
		} );

		it( 'should get the new content when a new order has been created', () => {
			expect( getOrderEdits( state, 345 ) ).to.eql( { billing: { email: 'test@example.com' } } );
		} );

		it( 'should be empty object when no orders are being edited', () => {
			expect( getOrderEdits( state, 234 ) ).to.eql( {} );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getOrderEdits( state ) ).to.eql( { billing: { first_name: 'Joan' } } );
		} );
	} );

	describe( '#getOrderWithEdits', () => {
		it( 'should be an empy object when woocommerce state is not available', () => {
			expect( getOrderWithEdits( preInitializedState, 123 ) ).to.eql( {} );
		} );

		it( 'should merge the edited changes into the existing order', () => {
			const mergedOrder = { ...order, billing: { ...order.billing, first_name: 'Joan' } };
			expect( getOrderWithEdits( state, 123 ) ).to.eql( mergedOrder );
		} );

		it( 'should return just the changes for new orders', () => {
			expect( getOrderWithEdits( state, 345 ) ).to.eql( {
				billing: { email: 'test@example.com' },
				id: { placeholder: 'order_1' },
			} );
		} );
	} );

	describe( '#isCurrentlyEditingOrder', () => {
		it( 'should be false (default) when woocommerce state is not available', () => {
			expect( isCurrentlyEditingOrder( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when an order is being edited', () => {
			expect( isCurrentlyEditingOrder( state, 123 ) ).to.be.true;
		} );

		it( 'should be true when a new order is being created', () => {
			expect( isCurrentlyEditingOrder( state, 345 ) ).to.be.true;
		} );

		it( 'should be false when no orders are being edited', () => {
			expect( isCurrentlyEditingOrder( state, 234 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( isCurrentlyEditingOrder( state ) ).to.be.true;
		} );
	} );
} );
