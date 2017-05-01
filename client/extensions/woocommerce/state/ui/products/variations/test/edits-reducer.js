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
	updateProductVariations,
} from '../actions';

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
		expect( edits[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, regular_price: '1.99' } );
	} );

	it( 'should modify "creates" on second edit', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );

		const variation = edits1[ 0 ].creates[ 0 ];
		const edits2 = reducer( edits1, editProductVariation( product, variation, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, regular_price: '2.99' } );
	} );

	it( 'should create more than one new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( product, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( product, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, regular_price: '1.99' } );
		expect( edits2[ 0 ].creates[ 1 ] ).to.eql( { id: { index: 1 }, regular_price: '2.99' } );
	} );

	it( 'should allow variation creates for more than one product', () => {
		const product1 = { id: 48 };
		const product2 = { id: 49 };

		const edits1 = reducer( undefined, editProductVariation( product1, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( product2, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].productId ).to.eql( 48 );
		expect( edits2[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, regular_price: '1.99' } );
		expect( edits2[ 1 ].productId ).to.eql( 49 );
		expect( edits2[ 1 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, regular_price: '2.99' } );
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

	describe( 'updateProductVariations', () => {
		it( 'should add variations that do not exist yet to "creates"', () => {
			const product = { id: 48 };
			const attributes = [ { name: 'Color', option: 'Blue' } ];
			const edits1 = reducer( undefined, updateProductVariations( product, null, [ { attributes } ] ) );

			expect( edits1[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 0 }, attributes } );
		} );

		it( 'should remove invalid variations from "creates"', () => {
			const product = { id: 48 };
			const attributes = [ { name: 'Color', option: 'Blue' } ];
			const edits1 = reducer( undefined, updateProductVariations( product, null, [ { attributes } ] ) );

			const smallAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Small' } ];
			const mediumAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Medium' } ];
			const variations = [ { attributes: smallAttributes }, { attributes: mediumAttributes } ];

			const edits2 = reducer( edits1, updateProductVariations( product, edits1[ 0 ].creates, variations ) );

			expect( edits2[ 0 ].creates.length ).to.eql( 2 );
			expect( edits2[ 0 ].creates[ 0 ] ).to.eql( { id: { index: 1 }, attributes: smallAttributes } );
			expect( edits2[ 0 ].creates[ 1 ] ).to.eql( { id: { index: 2 }, attributes: mediumAttributes } );
		} );

		it( 'should preserve variations that are still valid', () => {
			const product = { id: { index: 0 } };
			const blueSmallAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Small' } ];
			const blueMediumAttributes = [ { name: 'Color', option: 'Blue' }, { name: 'Size', option: 'Medium' } ];
			const blueVariations = [ { attributes: blueSmallAttributes }, { attributes: blueMediumAttributes } ];

			const edits1 = reducer( undefined, updateProductVariations( product, null, blueVariations ) );

			const blueMediumVariation = edits1[ 0 ].creates[ 1 ];
			const edits2 = reducer( edits1, editProductVariation( product, blueMediumVariation, { regular_price: '2.99' } ) );

			const redSmallAttributes = [ { name: 'Color', option: 'Red' }, { name: 'Size', option: 'Small' } ];
			const redMediumAttributes = [ { name: 'Color', option: 'Red' }, { name: 'Size', option: 'Medium' } ];
			const allVariations = [
				{ attributes: redSmallAttributes }, { attributes: redMediumAttributes },
				{ attributes: blueSmallAttributes }, { attributes: blueMediumAttributes },
			];

			const edits3 = reducer( edits2, updateProductVariations( product, edits2[ 0 ].creates, allVariations ) );

			expect( edits3[ 0 ].creates.length ).to.eql( 4 );
			expect( edits3[ 0 ].creates[ 1 ] ).to.eql( { id: { index: 1 }, attributes: blueMediumAttributes, regular_price: '2.99' } );
		} );
	} );
} );
