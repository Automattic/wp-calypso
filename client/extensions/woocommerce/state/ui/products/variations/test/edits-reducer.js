/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import reducer from '../edits-reducer';

import { editProductVariation } from '../actions';
import {
	editProduct,
	editProductAttribute
} from '../../actions';
import { actionAppendProductVariations } from 'woocommerce/state/data-layer/ui/products';

const siteId = 123;

describe( 'edits-reducer', () => {
	const newVariableProduct1 = {
		id: { index: 1 },
		type: 'variable',
		name: 'New Variable Product',
		attributes: [
			{ uid: 'edit_0', name: 'Color', options: [ 'Black' ], variation: true },
		],
	};

	const existingVariableProduct1 = {
		id: 101,
		type: 'variable',
		name: 'Existing Simple Product',
		attributes: [
			{ uid: 'edit_1', name: 'Color', options: [ 'Black' ], variation: true },
		],
	};

	const variationBlack = {
		id: { index: 4 },
		attributes: [
			{ name: 'Color', option: 'Black' },
		],
	};

	const variationBlue = {
		id: { index: 4 },
		attributes: [
			{ name: 'Color', option: 'Blue' },
		],
	};

	let rootState;

	beforeEach( () => {
		rootState = {
			extensions: {
				woocommerce: {
					ui: {
						products: {
							[ siteId ]: {
								edits: {
								},
								variations: {
									edits: {
									}
								},
							},
						},
					},
					sites: {
						[ siteId ]: {
							products: [ existingVariableProduct1 ],
							productVariations: {
								101: [ variationBlack ]
							},
						},
					},
				}
			}
		};
	} );

	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	it( 'should create "updates" on first edit', () => {
		const product = { id: 48 };
		const variation = { id: 23, regular_price: '0.99' };
		const edits = reducer( undefined, editProductVariation( siteId, product, variation, { regular_price: '1.99' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].updates ).to.exist;
		expect( edits[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
	} );

	it( 'should modify "updates" on second edit', () => {
		const product = { id: 48 };
		let variation = { id: 23, regular_price: '0.99' };
		const edits1 = reducer( undefined, editProductVariation( siteId, product, variation, { regular_price: '1.99' } ) );

		variation = edits1[ 0 ].updates[ 0 ];
		const edits2 = reducer( edits1, editProductVariation( siteId, product, variation, { regular_price: '3.99' } ) );

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '3.99' } );
	} );

	it( 'should create updates for more than one existing variation', () => {
		const product = { id: 48 };
		const variation1 = { id: 23, regular_price: '0.99', attributes: [ { name: 'Color', option: 'Red' } ] };
		const variation2 = { id: 24, regular_price: '0.99', attributes: [ { name: 'Color', option: 'Blue' } ] };

		const edits1 = reducer( undefined, editProductVariation( siteId, product, variation1, { regular_price: '1.99' } ) );

		const edits2 = reducer( edits1, editProductVariation( siteId, product, variation2, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
		expect( edits2[ 0 ].updates[ 1 ] ).to.eql( { id: 24, regular_price: '2.99' } );
	} );

	it( 'should create "creates" on first edit', () => {
		const product = { id: 48 };

		const edits = reducer( undefined, editProductVariation( siteId, product, null, { regular_price: '1.99' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].creates ).to.exist;
		expect( edits[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
	} );

	it( 'should modify "creates" on second edit', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( siteId, product, null, { regular_price: '1.99' } ) );

		const variation = edits1[ 0 ].creates[ 0 ];
		const edits2 = reducer( edits1, editProductVariation( siteId, product, variation, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should create more than one new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( siteId, product, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( siteId, product, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 0 ].creates[ 0 ].id ).to.not.eql( edits2[ 0 ].creates[ 1 ].id );
		expect( edits2[ 0 ].creates[ 1 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should allow variation creates for more than one product', () => {
		const product1 = { id: 48 };
		const product2 = { id: 49 };

		const edits1 = reducer( undefined, editProductVariation( siteId, product1, null, { regular_price: '1.99' } ) );
		const edits2 = reducer( edits1, editProductVariation( siteId, product2, null, { regular_price: '2.99' } ) );

		expect( edits2[ 0 ].productId ).to.eql( 48 );
		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 1 ].productId ).to.eql( 49 );
		expect( edits2[ 1 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	it( 'should set currentlyEditingId when editing a new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer( undefined, editProductVariation( siteId, product, null, { regular_price: '1.99' } ) );
		const productEdits1 = edits1.find( function( p ) {
			if ( product.id === p.productId ) {
				return p;
			}
		} );

		expect( productEdits1.currentlyEditingId ).to.eql( productEdits1.creates[ 0 ].id );

		const edits2 = reducer( edits1, editProductVariation( siteId, product, null, { regular_price: '2.99' } ) );
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

		const edits1 = reducer( undefined, editProductVariation( siteId, product, variation1, { regular_price: '1.99' } ) );
		const _edits1 = edits1.find( function( p ) {
			if ( product.id === p.productId ) {
				return p;
			}
		} );

		expect( _edits1.currentlyEditingId ).to.eql( variation1.id );
	} );

	describe( '#editProductVariationsAction', () => {
		it( 'should clear any existing variation creates for a simple product', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlack ],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'variations', 'edits' ], variationEditsBefore );

			const action = editProduct( siteId, newVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.not.exist;
		} );

		it( 'should clear any existing variation updates for a simple product', () => {
			const productEditsBefore = {
				updates: [ existingVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{ id: variationBlack.id, attributes: [ { name: 'Color', option: 'Black', sku: 'black' } ] },
					],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'variations', 'edits' ], variationEditsBefore );

			const action = editProduct( siteId, existingVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].updates ).to.not.exist;
		} );

		it( 'should add deletes for a simple product with existing varations', () => {
			const productEditsBefore = {
				updates: [ existingVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{ id: variationBlack.id, attributes: [ { name: 'Color', option: 'Black', sku: 'black' } ] },
					],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'variations', 'edits' ], variationEditsBefore );

			const action = editProduct( siteId, existingVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.exist;
			expect( variationEditsAfter[ 0 ].deletes[ 0 ] ).to.equal( variationBlack.id );
		} );

		it( 'should add a variation create when a new variation type option is added', () => {
			const newVariableProductNoAttributes = { ...newVariableProduct1, attributes: [] };
			const productEditsBefore = {
				creates: [ newVariableProductNoAttributes ],
			};
			const variationEditsBefore = [];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'variations', 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, newVariableProductNoAttributes, null, {
				name: 'Color',
				options: [ 'Black' ],
				variation: true,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ] ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].name ).to.equal( 'Color' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].option ).to.equal( 'Black' );
		} );

		it( 'should keep existing variation creates when adding a new variation type option', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlack ],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, newVariableProduct1, newVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [ 'Black', 'Blue' ],
				variation: true,
				uid: newVariableProduct1.attributes[ 0 ].uid,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 2 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ] ).to.eql( variationBlack );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].id ).to.be.an.Object;
			expect( variationEditsAfter[ 0 ].creates[ 1 ].attributes[ 0 ].name ).to.eql( 'Color' );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].attributes[ 0 ].option ).to.eql( 'Blue' );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].sku ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 1 ].status ).to.eql( 'publish' );
		} );

		it( 'should keep existing variation updates when adding a new variation type option', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [ {
						id: { index: 4 },
						regular_price: '5.99',
					} ],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, existingVariableProduct1, existingVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [ 'Black', 'Blue' ],
				variation: true,
				uid: existingVariableProduct1.attributes[ 0 ].uid,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].productId ).to.eql( existingVariableProduct1.id );
			expect( variationEditsAfter[ 0 ].updates ).to.exist;
			expect( variationEditsAfter[ 0 ].updates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].updates[ 0 ].id ).to.eql( { index: 4 } );
			expect( variationEditsAfter[ 0 ].updates[ 0 ].regular_price ).to.eql( '5.99' );
			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].id ).to.be.an.Object;
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].name ).to.eql( 'Color' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].option ).to.eql( 'Blue' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].sku ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 0 ].status ).to.eql( 'publish' );
		} );

		it( 'should remove a variation from creates when its type options are removed', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlack, variationBlue ],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, newVariableProduct1, newVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [ 'Blue' ],
				variation: true,
				uid: newVariableProduct1.attributes[ 0 ].uid,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ] ).to.eql( variationBlue );
		} );

		it( 'should remove a variation from updates when its type options are removed', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [ {
						id: { index: 4 },
						attributes: [
							{ name: 'Color', option: 'Darker than Black' },
						],
					} ],
				},
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, existingVariableProduct1, existingVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [],
				variation: true,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].updates ).to.not.exist;
		} );

		it( 'should add a delete when an existing variation has its variation type option removed', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, existingVariableProduct1, existingVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [],
				variation: true,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.exist;
			expect( variationEditsAfter[ 0 ].deletes.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].deletes[ 0 ] ).to.equal( variationBlack.id );
		} );

		it( 'should not retain any deletes if they become valid within the calculated variations', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					deletes: [ variationBlue.id ],
				}
			];
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], productEditsBefore );
			set( rootState.extensions.woocommerce.ui, [ 'products', siteId, 'edits' ], variationEditsBefore );

			const action = editProductAttribute( siteId, existingVariableProduct1, existingVariableProduct1.attributes[ 0 ], {
				name: 'Color',
				options: [ 'Black', 'Blue' ],
				variation: true,
			} );

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.not.exist;
		} );
	} );
} );
