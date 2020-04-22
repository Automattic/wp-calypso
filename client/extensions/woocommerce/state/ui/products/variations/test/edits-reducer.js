/**
 * External dependencies
 */
import { expect } from 'chai';
import { set, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { editProduct, editProductAttribute } from '../../actions';
import { editProductVariation, clearProductVariationEdits } from '../actions';
import reducer from '../edits-reducer';
import { actionAppendProductVariations } from 'woocommerce/state/data-layer/ui/products';
import {
	createProductVariation,
	updateProductVariation,
	productVariationUpdated,
} from 'woocommerce/state/sites/product-variations/actions';
import { createProduct, productUpdated } from 'woocommerce/state/sites/products/actions';

const siteId = 123;

jest.mock( 'lib/analytics/tracks', () => ( {} ) );

describe( 'edits-reducer', () => {
	const newVariableProduct1 = {
		id: { placeholder: 'product_1' },
		type: 'variable',
		name: 'New Variable Product',
		attributes: [ { uid: 'edit_0', name: 'Color', options: [ 'Black' ], variation: true } ],
	};

	const existingVariableProduct1 = {
		id: 101,
		type: 'variable',
		name: 'Existing Variable Product',
		attributes: [ { uid: 'edit_1', name: 'Color', options: [ 'Black' ], variation: true } ],
	};

	const variationBlackNew = {
		id: { placeholder: 'product_variation_4' },
		attributes: [ { name: 'Color', option: 'Black' } ],
	};

	const variationBlackExisting = {
		id: 224,
		attributes: [ { name: 'Color', option: 'Black' } ],
	};

	const variationBlue = {
		id: { placeholder: 'product_variation_4' },
		attributes: [ { name: 'Color', option: 'Blue' } ],
	};

	let rootState;

	beforeEach( () => {
		rootState = {
			extensions: {
				woocommerce: {
					ui: {
						products: {
							[ siteId ]: {
								edits: {},
								variations: {
									edits: {},
								},
							},
						},
					},
					sites: {
						[ siteId ]: {
							products: [ existingVariableProduct1 ],
							productVariations: {
								101: [ variationBlackExisting ],
							},
						},
					},
				},
			},
		};
	} );

	test( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	test( 'should create "updates" on first edit', () => {
		const product = { id: 48 };
		const variation = { id: 23, regular_price: '0.99' };
		const edits = reducer(
			undefined,
			editProductVariation( siteId, product, variation, { regular_price: '1.99' } )
		);

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].updates ).to.exist;
		expect( edits[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
	} );

	test( 'should modify "updates" on second edit', () => {
		const product = { id: 48 };
		let variation = { id: 23, regular_price: '0.99' };
		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, variation, { regular_price: '1.99' } )
		);

		variation = edits1[ 0 ].updates[ 0 ];
		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product, variation, { regular_price: '3.99' } )
		);

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '3.99' } );
	} );

	test( 'should create updates for more than one existing variation', () => {
		const product = { id: 48 };
		const variation1 = {
			id: 23,
			regular_price: '0.99',
			attributes: [ { name: 'Color', option: 'Red' } ],
		};
		const variation2 = {
			id: 24,
			regular_price: '0.99',
			attributes: [ { name: 'Color', option: 'Blue' } ],
		};

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, variation1, { regular_price: '1.99' } )
		);

		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product, variation2, { regular_price: '2.99' } )
		);

		expect( edits2[ 0 ].updates[ 0 ] ).to.eql( { id: 23, regular_price: '1.99' } );
		expect( edits2[ 0 ].updates[ 1 ] ).to.eql( { id: 24, regular_price: '2.99' } );
	} );

	test( 'should create "creates" on first edit', () => {
		const product = { id: 48 };

		const edits = reducer(
			undefined,
			editProductVariation( siteId, product, null, { regular_price: '1.99' } )
		);

		expect( edits ).to.not.equal( null );
		expect( edits[ 0 ] ).to.exist;
		expect( edits[ 0 ].productId ).to.eql( 48 );
		expect( edits[ 0 ].creates ).to.exist;
		expect( edits[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
	} );

	test( 'should modify "creates" on second edit', () => {
		const product = { id: 48 };

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, null, { regular_price: '1.99' } )
		);

		const variation = edits1[ 0 ].creates[ 0 ];
		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product, variation, { regular_price: '2.99' } )
		);

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	test( 'should create more than one new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, null, { regular_price: '1.99' } )
		);
		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product, null, { regular_price: '2.99' } )
		);

		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 0 ].creates[ 0 ].id ).to.not.eql( edits2[ 0 ].creates[ 1 ].id );
		expect( edits2[ 0 ].creates[ 1 ].regular_price ).to.eql( '2.99' );
	} );

	test( 'should allow variation creates for more than one product', () => {
		const product1 = { id: 48 };
		const product2 = { id: 49 };

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product1, null, { regular_price: '1.99' } )
		);
		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product2, null, { regular_price: '2.99' } )
		);

		expect( edits2[ 0 ].productId ).to.eql( 48 );
		expect( edits2[ 0 ].creates[ 0 ].regular_price ).to.eql( '1.99' );
		expect( edits2[ 1 ].productId ).to.eql( 49 );
		expect( edits2[ 1 ].creates[ 0 ].regular_price ).to.eql( '2.99' );
	} );

	test( 'should set currentlyEditingId when editing a new variation', () => {
		const product = { id: 48 };

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, null, { regular_price: '1.99' } )
		);
		const productEdits1 = edits1.find( function ( p ) {
			if ( isEqual( product.id, p.productId ) ) {
				return p;
			}
		} );

		expect( productEdits1.currentlyEditingId ).to.eql( productEdits1.creates[ 0 ].id );

		const edits2 = reducer(
			edits1,
			editProductVariation( siteId, product, null, { regular_price: '2.99' } )
		);
		const productEdits2 = edits2.find( function ( p ) {
			if ( isEqual( product.id, p.productId ) ) {
				return p;
			}
		} );

		expect( productEdits2.currentlyEditingId ).to.eql( productEdits2.creates[ 1 ].id );
	} );

	test( 'should set currentlyEditingId when editing an existing variation', () => {
		const product = { id: 48 };
		const variation1 = {
			id: 23,
			regular_price: '0.99',
			attributes: [ { name: 'Color', option: 'Red' } ],
		};

		const edits1 = reducer(
			undefined,
			editProductVariation( siteId, product, variation1, { regular_price: '1.99' } )
		);
		const _edits1 = edits1.find( function ( p ) {
			if ( isEqual( product.id, p.productId ) ) {
				return p;
			}
		} );

		expect( _edits1.currentlyEditingId ).to.eql( variation1.id );
	} );

	describe( '#editProductVariationsAction', () => {
		test( 'should clear any existing variation creates for a simple product', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlackNew ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const action = editProduct( siteId, newVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.not.exist;
		} );

		test( 'should clear any existing variation updates for a simple product', () => {
			const productEditsBefore = {
				updates: [ existingVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{
							id: variationBlackExisting.id,
							attributes: [ { name: 'Color', option: 'Black', sku: 'black' } ],
						},
					],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const action = editProduct( siteId, existingVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].updates ).to.not.exist;
		} );

		test( 'should add deletes for a simple product with existing varations', () => {
			const productEditsBefore = {
				updates: [ existingVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{
							id: variationBlackExisting.id,
							attributes: [ { name: 'Color', option: 'Black', sku: 'black' } ],
						},
					],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const action = editProduct( siteId, existingVariableProduct1, { type: 'simple' } );
			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.exist;
			expect( variationEditsAfter[ 0 ].deletes[ 0 ] ).to.equal( variationBlackExisting.id );
		} );

		test( 'should add a variation create when a new variation type option is added', () => {
			const newVariableProductNoAttributes = { ...newVariableProduct1, attributes: [] };
			const productEditsBefore = {
				creates: [ newVariableProductNoAttributes ],
			};
			const variationEditsBefore = [];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

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

		test( 'should keep existing variation creates when adding a new variation type option', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlackNew ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				newVariableProduct1,
				newVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [ 'Black', 'Blue' ],
					variation: true,
					uid: newVariableProduct1.attributes[ 0 ].uid,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 2 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ] ).to.eql( variationBlackNew );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].id ).to.be.an( 'object' );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].attributes[ 0 ].name ).to.eql( 'Color' );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].attributes[ 0 ].option ).to.eql( 'Blue' );
			expect( variationEditsAfter[ 0 ].creates[ 1 ].sku ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 1 ].status ).to.eql( 'publish' );
		} );

		test( 'should keep existing variation updates when adding a new variation type option', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{
							id: 224,
							regular_price: '5.99',
						},
					],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				existingVariableProduct1,
				existingVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [ 'Black', 'Blue' ],
					variation: true,
					uid: existingVariableProduct1.attributes[ 0 ].uid,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].productId ).to.eql( existingVariableProduct1.id );
			expect( variationEditsAfter[ 0 ].updates ).to.exist;
			expect( variationEditsAfter[ 0 ].updates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].updates[ 0 ].id ).to.eql( 224 );
			expect( variationEditsAfter[ 0 ].updates[ 0 ].regular_price ).to.eql( '5.99' );
			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].id ).to.be.an( 'object' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].name ).to.eql( 'Color' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].attributes[ 0 ].option ).to.eql( 'Blue' );
			expect( variationEditsAfter[ 0 ].creates[ 0 ].sku ).to.exist;
			expect( variationEditsAfter[ 0 ].creates[ 0 ].status ).to.eql( 'publish' );
		} );

		test( 'should remove a variation from creates when its type options are removed', () => {
			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlackNew, variationBlue ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				newVariableProduct1,
				newVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [ 'Blue' ],
					variation: true,
					uid: newVariableProduct1.attributes[ 0 ].uid,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].creates ).to.exist;
			expect( variationEditsAfter[ 0 ].creates.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].creates[ 0 ] ).to.eql( variationBlue );
		} );

		test( 'should remove a variation from updates when its type options are removed', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					updates: [
						{
							id: { placeholder: 'product_variation_4' },
							attributes: [ { name: 'Color', option: 'Darker than Black' } ],
						},
					],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				existingVariableProduct1,
				existingVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [],
					variation: true,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].updates ).to.not.exist;
		} );

		test( 'should add a delete when an existing variation has its variation type option removed', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				existingVariableProduct1,
				existingVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [],
					variation: true,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.exist;
			expect( variationEditsAfter[ 0 ].deletes.length ).to.equal( 1 );
			expect( variationEditsAfter[ 0 ].deletes[ 0 ] ).to.equal( variationBlackExisting.id );
		} );

		test( 'should not retain any deletes if they become valid within the calculated variations', () => {
			const productEditsBefore = {};
			const variationEditsBefore = [
				{
					productId: existingVariableProduct1.id,
					deletes: [ variationBlue.id ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				variationEditsBefore
			);

			const action = editProductAttribute(
				siteId,
				existingVariableProduct1,
				existingVariableProduct1.attributes[ 0 ],
				{
					name: 'Color',
					options: [ 'Black', 'Blue' ],
					variation: true,
				}
			);

			actionAppendProductVariations( { getState: () => rootState }, action );
			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].deletes ).to.not.exist;
		} );
	} );

	describe( '#productUpdatedAction', () => {
		test( 'should update product placeholder ids to real ids when the product is created', () => {
			const createdVariableProduct1 = { ...newVariableProduct1, id: 55 };

			const productEditsBefore = {
				creates: [ newVariableProduct1 ],
			};
			const variationEditsBefore = [
				{
					productId: newVariableProduct1.id,
					creates: [ variationBlackNew ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'edits' ],
				productEditsBefore
			);
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const originatingAction = createProduct( siteId, newVariableProduct1 );
			const action = productUpdated( siteId, createdVariableProduct1, originatingAction );

			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter[ 0 ].productId ).to.eql( 55 );
		} );
	} );

	describe( '#productVariationUpdatedAction', () => {
		test( 'should clear variation from creates upon successful save', () => {
			const variationEditsBefore = [
				{
					productId: 42,
					creates: [ variationBlackNew ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const originatingAction = createProductVariation( siteId, 42, variationBlackNew );
			const action = productVariationUpdated(
				siteId,
				42,
				variationBlackExisting,
				originatingAction
			);

			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter ).to.equal( null );
		} );

		test( 'should clear variation from updates upon successful save', () => {
			const variationEditsBefore = [
				{
					productId: 42,
					updates: [ variationBlackExisting ],
				},
			];
			set(
				rootState.extensions.woocommerce.ui,
				[ 'products', siteId, 'variations', 'edits' ],
				variationEditsBefore
			);

			const originatingAction = updateProductVariation( siteId, 42, variationBlackExisting );
			const action = productVariationUpdated(
				siteId,
				42,
				variationBlackExisting,
				originatingAction
			);

			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsAfter ).to.equal( null );
		} );
	} );

	describe( '#clearProductVariationEdits', () => {
		test( 'should clear all product variations edit data', () => {
			const variationEditsBefore = [
				{
					productId: 42,
					creates: [
						{
							id: { placeholder: 'product_variation_9' },
							attributes: { name: 'Color', option: 'Green' },
						},
					],
					updates: [ { id: 252, attributes: { name: 'Color', option: 'Black' } } ],
					deletes: [ 525 ],
				},
			];

			const action = clearProductVariationEdits( siteId );

			const variationEditsAfter = reducer( variationEditsBefore, action );

			expect( variationEditsBefore[ 0 ].productId ).to.equal( 42 );
			expect( variationEditsBefore[ 0 ].creates ).to.exist;
			expect( variationEditsBefore[ 0 ].updates ).to.exist;
			expect( variationEditsBefore[ 0 ].deletes ).to.exist;
			expect( variationEditsAfter ).to.equal( null );
		} );
	} );
} );
