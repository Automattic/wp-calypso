/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { editProductCategory, clearProductCategoryEdits } from '../actions';
import reducer from '../edits-reducer';
import {
	createProductCategory,
	updateProductCategory,
	productCategoryUpdated,
} from 'woocommerce/state/sites/product-categories/actions';

const siteId = 123;

describe( 'edits-reducer', () => {
	test( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	test( 'should create "updates" upon first edit', () => {
		const category = { id: 101 };
		const edits = reducer(
			undefined,
			editProductCategory( siteId, category, {
				name: 'Existing Category',
			} )
		);

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;
		expect( edits.updates[ 0 ] ).to.eql( { id: 101, name: 'Existing Category' } );
	} );

	test( 'should modify "updates" upon second edit', () => {
		const category = { id: 101 };
		const edits1 = reducer(
			undefined,
			editProductCategory( siteId, category, {
				name: 'After first edit',
			} )
		);

		const edits2 = reducer(
			edits1,
			editProductCategory( siteId, category, {
				name: 'After second edit',
				description: 'Updated description',
			} )
		);

		expect( edits1.updates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits2.updates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits1.updates[ 0 ].description ).to.not.exist;
		expect( edits2.updates[ 0 ].description ).to.eql( 'Updated description' );
	} );

	test( 'should create updates for more than one existing category', () => {
		const category1 = { id: 101, name: 'c1' };
		const edits1 = reducer(
			undefined,
			editProductCategory( siteId, category1, {
				name: 'First Category',
			} )
		);

		const category2 = { id: 202, name: 'c2' };
		const edits2 = reducer(
			edits1,
			editProductCategory( siteId, category2, {
				name: 'Second Category',
			} )
		);

		expect( edits2.updates[ 0 ].id ).to.equal( 101 );
		expect( edits2.updates[ 0 ].name ).to.equal( 'First Category' );
		expect( edits2.updates[ 1 ].id ).to.equal( 202 );
		expect( edits2.updates[ 1 ].name ).to.equal( 'Second Category' );
	} );

	test( 'should create "creates" on first edit', () => {
		const id1 = { placeholder: 'productCategory_1' };
		const edits = reducer(
			undefined,
			editProductCategory(
				siteId,
				{ id: id1 },
				{
					name: 'New Category',
					slug: 'new-category',
				}
			)
		);

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ] ).to.exist;
		expect( edits.creates[ 0 ].id ).to.eql( id1 );
		expect( edits.creates[ 0 ].name ).to.eql( 'New Category' );
		expect( edits.creates[ 0 ].slug ).to.eql( 'new-category' );
	} );

	test( 'should modify "creates" on second edit', () => {
		const edits1 = reducer(
			undefined,
			editProductCategory( siteId, null, {
				name: 'After first edit',
			} )
		);

		expect( edits1.creates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits1.creates[ 0 ].description ).to.not.exist;

		const edits2 = reducer(
			edits1,
			editProductCategory( siteId, edits1.creates[ 0 ], {
				name: 'After second edit',
				description: 'Description',
			} )
		);

		expect( edits2.creates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits2.creates[ 0 ].description ).to.eql( 'Description' );
	} );

	test( 'should create more than one category', () => {
		const id1 = { placeholder: 'productCategory_1' };
		const edits1 = reducer(
			undefined,
			editProductCategory(
				siteId,
				{ id: id1 },
				{
					name: 'First Category',
					slug: 'first-category',
				}
			)
		);

		const id2 = { placeholder: 'productCategory_2' };
		const edits2 = reducer(
			edits1,
			editProductCategory(
				siteId,
				{ id: id2 },
				{
					name: 'Second Category',
					slug: 'second-category',
				}
			)
		);

		expect( edits2.creates[ 0 ].id ).to.eql( id1 );
		expect( edits2.creates[ 0 ].name ).to.eql( 'First Category' );
		expect( edits2.creates[ 0 ].slug ).to.eql( 'first-category' );
		expect( edits2.creates[ 1 ].id ).to.eql( id2 );
		expect( edits2.creates[ 1 ].name ).to.eql( 'Second Category' );
		expect( edits2.creates[ 1 ].slug ).to.eql( 'second-category' );
	} );

	test( 'should remove a "create"', () => {
		const newCategory = {
			name: 'New Category',
			slug: 'first-category',
		};
		const edits1 = reducer( undefined, editProductCategory( siteId, null, newCategory ) );
		const edits2 = reducer( edits1, editProductCategory( siteId, edits1.creates[ 0 ], null ) );

		expect( edits1.creates[ 0 ].name ).to.eql( 'New Category' );
		expect( edits2.creates[ 0 ] ).to.not.exist;
	} );

	test( 'should remove an "update"', () => {
		const category = { id: 101 };
		const categoryUpdate = { name: 'After first edit' };
		const edits1 = reducer( undefined, editProductCategory( siteId, category, categoryUpdate ) );
		const edits2 = reducer( edits1, editProductCategory( siteId, edits1.updates[ 0 ], null ) );

		expect( edits1.updates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits2.updates[ 0 ] ).to.not.exist;
	} );

	test( 'should set currentlyEditingId when editing a new category', () => {
		const edits1 = reducer(
			undefined,
			editProductCategory( siteId, null, {
				name: 'First Category',
				slug: 'first-category',
			} )
		);

		const edits2 = reducer(
			edits1,
			editProductCategory( siteId, null, {
				name: 'Second Category',
				slug: 'second-category',
			} )
		);

		expect( edits1.currentlyEditingId ).to.eql( edits1.creates[ 0 ].id );
		expect( edits2.currentlyEditingId ).to.eql( edits2.creates[ 1 ].id );
	} );

	test( 'should clear category from creates upon successful save', () => {
		const category1 = {
			id: { placeholder: 'productCategory_1' },
			name: 'Category 1',
		};

		const createdCategory1 = {
			id: 22,
			name: 'Category 1',
		};

		const edits1 = {
			creates: [ category1 ],
		};

		const originatingAction = createProductCategory( siteId, category1 );
		const action = productCategoryUpdated( siteId, createdCategory1, originatingAction );

		const edits2 = reducer( edits1, action );

		expect( edits1.creates[ 0 ] ).to.eql( category1 );
		expect( edits2.creates ).to.not.exist;
	} );

	test( 'should clear category from updates upon successful save', () => {
		const category = {
			id: 22,
			name: 'Category 1',
		};

		const updatedCategory = {
			id: 22,
			name: 'Category 1',
		};

		const edits1 = {
			updates: [ category ],
		};

		const originatingAction = updateProductCategory( siteId, category );
		const action = productCategoryUpdated( siteId, updatedCategory, originatingAction );

		const edits2 = reducer( edits1, action );

		expect( edits1.updates[ 0 ] ).to.eql( category );
		expect( edits2.updates ).to.not.exist;
	} );

	test( 'should clear all product category edit data', () => {
		const edits1 = {
			creates: [ { id: { placeholder: 'productCategory_1' }, name: 'New Category' } ],
			updates: [ { id: 525, name: 'Updated name' } ],
			deletes: [ 252 ],
		};

		const action = clearProductCategoryEdits( siteId );

		const edits2 = reducer( edits1, action );

		expect( edits1.creates ).to.exist;
		expect( edits1.updates ).to.exist;
		expect( edits1.deletes ).to.exist;
		expect( edits2 ).to.equal( null );
	} );
} );
