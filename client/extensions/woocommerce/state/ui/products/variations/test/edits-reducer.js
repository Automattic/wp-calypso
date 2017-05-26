/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../edits-reducer';

import {
	editProductVariation,
} from '../actions';

import {
	editProductAttribute
} from '../../actions';

describe( 'edits-reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	it( 'should create "updates" on first edit', () => {
		const product = { id: 48 };
		const variation = { id: 23, regular_price: '0.99' };
		const edits = reducer( undefined, editProductVariation( product, variation, { regular_price: '1.99' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].updates ).to.exist;
		expect( edits[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
	} );

	it( 'should modify "updates" on second edit', () => {
		const product = { id: 48 };
		let variation = { id: 23, regular_price: '0.99' };
		const edits1 = reducer( undefined, editProductVariation( product, variation, { regular_price: '1.99' } ) );

		variation = edits1[ 0 ].updates[ 0 ];
		const edits2 = reducer( edits1, editProductVariation( product, variation, { regular_price: '3.99' } ) );

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '3.99' } );
	} );

	it( 'should create updates for more than one existing variation', () => {
		const product = { id: 48 };
		const variation1 = { id: 23, regular_price: '0.99', attributes: [ { name: 'Color', option: 'Red' } ] };
		const variation2 = { id: 24, regular_price: '0.99', attributes: [ { name: 'Color', option: 'Blue' } ] };

		const edits1 = reducer( undefined, editProductVariation( product, variation1, { regular_price: '1.99' } ) );

		const edits2 = reducer( edits1, editProductVariation( product, variation2, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
		expect( edits2[ 0 ].updates[ 1 ] ).to.eql( { id: 24, regular_price: '2.99' } );
	} );

	it( 'should create "creates" on first edit', () => {
		const product = { id: 48 };

		const edits = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].creates ).to.exist;
		expect( edits[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
	} );

	it( 'should modify "creates" on second edit', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );

		const variation = edits1[ 0 ].creates[ 0 ];
		const edits2 = reducer( edits1, editProductVariation( product, variation, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should create more than one new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( product, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 0 ].creates[ 0 ].id ).to.not.eql( edits2[ 0 ].creates[ 1 ].id );
		expect( edits2[ 0 ].creates[ 1 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should allow variation creates for more than one product', () => {
		const product1 = { id: 48 };
		const product2 = { id: 49 };

		const edits1 = reducer( undefined, editProductVariation( product1, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( product2, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].productId ).to.eql( 48 );
		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 1 ].productId ).to.eql( 49 );
		expect( edits2[ 1 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should set currentlyEditingId when editing a new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );
		const productEdits1 = edits1.find( function( p ) {
			if ( product.id === p.productId ) {
				return p;
			}
		} );

		expect( productEdits1.currentlyEditingId ).to.eql( productEdits1.creates[ 0 ].id );

		const edits2 = reducer( edits1, editProductVariation( product, null, { regular_price: '2.99' } ) );
		const productEdits2 = edits2.find( function( p ) {
			if ( product.id === p.productId ) {
				return p;
			}
		} );

		expect( productEdits2.currentlyEditingId ).to.eql( productEdits2.creates[ 1 ].id );
	} );

	it( 'should set currentlyEditingId when editing an existing variation', () => {
		const product = { id: 48 };
		const variation1 = { id: 23, regular_price: '0.99', attributes: [ { name: 'Color', option: 'Red' } ] };

		const edits1 = reducer( undefined, editProductVariation( product, variation1, { regular_price: '1.99' } ) );
		const _edits1 = edits1.find( function( p ) {
			if ( product.id === p.productId ) {
				return p;
			}
		} );

		expect( _edits1.currentlyEditingId ).to.eql( variation1.id );
	} );

	describe( 'editProductVariationsAction', () => {
		it( 'should add variations that do not exist yet to "creates"', () => {
			const product = { id: 48 };
			const attributes = [ { name: 'Color', option: 'Blue' } ];

			const edits1 = reducer( undefined, editProductAttribute( product, null, {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true
			} ) );

			expect( edits1[ 0 ].creates[ 0 ].attributes ).to.eql( attributes );
		} );

		it( 'should remove invalid variations from "creates"', () => {
			const product = { id: 48, attributes: [] };
			const attributes = [ { name: 'Color', option: 'Blue' } ];

			const edits1 = reducer( undefined, editProductAttribute( product, null, {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true
			} ) );

			expect( edits1[ 0 ].creates[ 0 ].attributes ).to.eql( attributes );

			const smallAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Small' } ];
			const mediumAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Medium' } ];

			product.attributes.push( {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true,
				uid: 'edit_0'
			} );

			const edits2 = reducer( edits1, editProductAttribute( product, null, {
				name: 'Size',
				options: [ 'Small', 'Medium' ],
				variation: true
			} ) );

			expect( edits2[ 0 ].creates.length ).to.eql( 2 );
			expect( edits2[ 0 ].creates[ 0 ].attributes ).to.eql( smallAttributes );
			expect( edits2[ 0 ].creates[ 1 ].attributes ).to.eql( mediumAttributes );
		} );

		it( 'should preserve variations that are still valid', () => {
			const product = { id: { index: 0 }, attributes: [] };

			const edits1 = reducer( undefined, editProductAttribute( product, null, {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true
			} ) );

			product.attributes.push( {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true,
				uid: 'edit_0'
			} );

			const edits2 = reducer( edits1, editProductAttribute( product, null, {
				name: 'Size',
				options: [ 'Small', 'Medium' ],
				variation: true
			} ) );

			product.attributes.push( {
				name: 'Size',
				options: [ 'Small', 'Medium' ],
				variation: true,
				uid: 'edit_1'
			} );

			const blueMediumVariation = edits2[ 0 ].creates[ 1 ];
			const edits3 = reducer( edits2, editProductVariation( product, blueMediumVariation, { regular_price: '2.99' } ) );

			const blueMediumAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Medium' } ];

			const edits4 = reducer( edits3, editProductAttribute( product, product.attributes[ 0 ], { options: [ 'Blue', 'Red' ] } ) );
			expect( edits4[ 0 ].creates.length ).to.eql( 4 );
			expect( edits4[ 0 ].creates[ 1 ].attributes ).to.eql( blueMediumAttributes );
			expect( edits4[ 0 ].creates[ 1 ].regular_price ).to.equal( '2.99' );
		} );
	} );
} );
