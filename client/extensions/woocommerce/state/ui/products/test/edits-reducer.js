/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { clearProductEdits, editProduct, editProductAttribute } from '../actions';
import reducer from '../edits-reducer';
import { WOOCOMMERCE_PRODUCT_DELETE } from 'woocommerce/state/action-types';
import {
	createProductCategory,
	productCategoryUpdated,
} from 'woocommerce/state/sites/product-categories/actions';
import {
	createProduct,
	updateProduct,
	productUpdated,
} from 'woocommerce/state/sites/products/actions';

const siteId = 123;

describe( 'edits-reducer', () => {
	test( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	test( 'should create "updates" upon first edit', () => {
		const product = { id: 1 };
		const edits = reducer( undefined, editProduct( siteId, product, { name: 'A Product' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;
		expect( edits.updates[ 0 ] ).to.eql( { id: 1, name: 'A Product' } );
	} );

	test( 'should modify "updates" on second edit', () => {
		const product = { id: 1 };
		const edits1 = reducer(
			undefined,
			editProduct( siteId, product, {
				name: 'After first edit',
			} )
		);

		const edits2 = reducer(
			undefined,
			editProduct( siteId, product, {
				name: 'After second edit',
				description: 'Description',
			} )
		);

		expect( edits1.updates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits2.updates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits1.updates[ 0 ].description ).to.not.exist;
		expect( edits2.updates[ 0 ].description ).to.eql( 'Description' );
	} );

	test( 'should create updates for more than one existing product', () => {
		const product1 = { id: 1 };
		const edits1 = reducer(
			undefined,
			editProduct( siteId, product1, {
				name: 'First product',
			} )
		);

		const product2 = { id: 2 };
		const edits2 = reducer(
			edits1,
			editProduct( siteId, product2, {
				name: 'Second product',
			} )
		);

		expect( edits2.updates[ 0 ].id ).to.eql( 1 );
		expect( edits2.updates[ 0 ].name ).to.eql( 'First product' );
		expect( edits2.updates[ 1 ].id ).to.eql( 2 );
		expect( edits2.updates[ 1 ].name ).to.eql( 'Second product' );
	} );

	test( 'should create "creates" on first edit', () => {
		const edits = reducer(
			undefined,
			editProduct( siteId, null, {
				name: 'A new product',
			} )
		);

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ] ).to.exist;
		expect( edits.creates[ 0 ].id ).to.exist;
		expect( edits.creates[ 0 ].id.placeholder ).to.exist;
		expect( edits.creates[ 0 ].name ).to.eql( 'A new product' );
	} );

	test( 'should modify "creates" on second edit', () => {
		const edits1 = reducer(
			undefined,
			editProduct( siteId, null, {
				name: 'After first edit',
			} )
		);

		expect( edits1.creates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits1.creates[ 0 ].description ).to.not.exist;

		const edits2 = reducer(
			edits1,
			editProduct( siteId, edits1.creates[ 0 ], {
				name: 'After second edit',
				description: 'Description',
			} )
		);

		expect( edits2.creates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits2.creates[ 0 ].description ).to.eql( 'Description' );
	} );

	test( 'should create more than one new product', () => {
		const edits1 = reducer(
			undefined,
			editProduct( siteId, null, {
				name: 'First product',
			} )
		);

		const edits2 = reducer(
			edits1,
			editProduct( siteId, null, {
				name: 'Second product',
			} )
		);

		expect( edits2.creates[ 0 ].id ).to.exist;
		expect( edits2.creates[ 0 ].id.placeholder ).to.exist;
		expect( edits2.creates[ 0 ].name ).to.eql( 'First product' );
		expect( edits2.creates[ 1 ].id ).to.exist;
		expect( edits2.creates[ 1 ].id.placeholder ).to.exist;
		expect( edits2.creates[ 1 ].name ).to.eql( 'Second product' );

		expect( edits2.creates[ 1 ].id ).to.not.eql( edits2.creates[ 0 ].id );
	} );

	test( 'should create new product in "creates" when editing attribute the first time', () => {
		const edits = reducer(
			undefined,
			editProductAttribute( siteId, null, null, {
				name: 'New Attribute',
			} )
		);

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ].attributes ).to.exist;
		expect( edits.creates[ 0 ].attributes[ 0 ].name ).to.eql( 'New Attribute' );
	} );

	test( 'should modify product in "creates" when editing attribute a second time', () => {
		const edits1 = reducer(
			undefined,
			editProductAttribute( siteId, null, null, {
				name: 'Edited once',
			} )
		);

		let product = edits1.creates[ 0 ];
		let attribute = product.attributes[ 0 ];

		const edits2 = reducer(
			edits1,
			editProductAttribute( siteId, product, attribute, {
				name: 'Edited twice',
			} )
		);

		product = edits2.creates[ 0 ];
		attribute = product.attributes[ 0 ];

		expect( attribute.name ).to.eql( 'Edited twice' );
	} );

	test( 'should create more than one attribute for a newly created product', () => {
		const edits1 = reducer(
			undefined,
			editProductAttribute( siteId, null, null, {
				name: 'Attribute One',
			} )
		);

		let product = edits1.creates[ 0 ];
		let attribute1 = product.attributes[ 0 ];

		const edits2 = reducer(
			edits1,
			editProductAttribute( siteId, product, null, {
				name: 'Attribute Two',
			} )
		);

		product = edits2.creates[ 0 ];
		attribute1 = product.attributes[ 0 ];
		const attribute2 = product.attributes[ 1 ];

		expect( attribute1.name ).to.eql( 'Attribute One' );
		expect( attribute2.name ).to.eql( 'Attribute Two' );
	} );

	test( 'should add product to "updates" when editing attribute the first time', () => {
		let product = {
			id: 1,
		};
		const edits = reducer(
			undefined,
			editProductAttribute( siteId, product, null, {
				name: 'New Attribute',
			} )
		);

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;

		product = edits.updates[ 0 ];
		expect( product.attributes ).to.exist;

		const attribute = product.attributes[ 0 ];
		expect( attribute.name ).to.eql( 'New Attribute' );
	} );

	test( 'should modify product in "updates" when editing attribute a second time', () => {
		let product = {
			id: 1,
		};
		const edits1 = reducer(
			undefined,
			editProductAttribute( siteId, product, null, {
				name: 'Edited once',
			} )
		);

		product = edits1.updates[ 0 ];
		let attribute = product.attributes[ 0 ];

		const edits2 = reducer(
			edits1,
			editProductAttribute( siteId, product, attribute, {
				name: 'Edited twice',
			} )
		);

		product = edits2.updates[ 0 ];
		attribute = product.attributes[ 0 ];

		expect( attribute.name ).to.eql( 'Edited twice' );
	} );

	test( 'should create more than one attribute for an existing product', () => {
		let product = {
			id: 1,
		};
		const edits1 = reducer(
			undefined,
			editProductAttribute( siteId, product, null, {
				name: 'Attribute One',
			} )
		);

		product = edits1.updates[ 0 ];
		let attribute1 = product.attributes[ 0 ];

		const edits2 = reducer(
			edits1,
			editProductAttribute( siteId, product, null, {
				name: 'Attribute Two',
			} )
		);

		product = edits2.updates[ 0 ];
		attribute1 = product.attributes[ 0 ];
		const attribute2 = product.attributes[ 1 ];

		expect( attribute1.name ).to.eql( 'Attribute One' );
		expect( attribute2.name ).to.eql( 'Attribute Two' );
	} );

	test( 'should set currentlyEditingId when editing a new product', () => {
		const edits1 = reducer(
			undefined,
			editProduct( siteId, null, {
				name: 'A new product',
			} )
		);

		expect( edits1.currentlyEditingId ).to.eql( edits1.creates[ 0 ].id );

		const edits2 = reducer(
			edits1,
			editProduct( siteId, null, {
				name: 'Second product',
			} )
		);

		expect( edits2.currentlyEditingId ).to.eql( edits2.creates[ 1 ].id );
	} );

	test( 'should set currentlyEditingId when editing an existing product', () => {
		const product1 = { id: 1 };
		const edits1 = reducer(
			undefined,
			editProduct( siteId, product1, {
				name: 'First product',
			} )
		);
		expect( edits1.currentlyEditingId ).to.eql( edits1.updates[ 0 ].id );
	} );

	test( 'should not add a create edit entry, only set currentlyEditingId, when data is empty', () => {
		const edits1 = reducer( undefined, editProduct( siteId, null, {} ) );

		expect( edits1.currentlyEditingId ).to.exist;
		expect( edits1.currentlyEditingId.placeholder ).to.exist;
		expect( edits1.creates ).to.not.exist;
	} );

	test( 'should not add an update edit entry, only set currentlyEditingId, when data is empty', () => {
		const product1 = { id: 1 };
		const edits1 = reducer( undefined, editProduct( siteId, product1, {} ) );

		expect( edits1.currentlyEditingId ).to.exist;
		expect( edits1.currentlyEditingId ).to.equal( 1 );
		expect( edits1.updates ).to.not.exist;
	} );

	test( 'should update product category placeholder ids when they are updated', () => {
		const category1 = {
			id: { placeholder: 'productCategory_1' },
			name: 'New Category',
		};

		const createdCategory1 = { ...category1, id: 22 };

		const product1 = {
			id: { placeholder: 'product_1' },
			categories: [ { id: { placeholder: 'productCategory_1' } } ],
		};

		const product2 = {
			id: 42,
			categories: [ { id: { placeholder: 'productCategory_1' } } ],
		};

		const edits1 = {
			creates: [ product1 ],
			updates: [ product2 ],
		};

		const originatingAction = createProductCategory( siteId, category1 );
		const action = productCategoryUpdated( siteId, createdCategory1, originatingAction );

		const edits2 = reducer( edits1, action );

		expect( edits1.creates[ 0 ].categories[ 0 ].id ).to.eql( { placeholder: 'productCategory_1' } );
		expect( edits1.updates[ 0 ].categories[ 0 ].id ).to.eql( { placeholder: 'productCategory_1' } );
		expect( edits2.creates[ 0 ].categories[ 0 ].id ).to.eql( 22 );
		expect( edits2.updates[ 0 ].categories[ 0 ].id ).to.eql( 22 );
	} );

	test( 'should clear product from creates upon successful save', () => {
		const product1 = {
			id: { placeholder: 'product_1' },
			name: 'Product 1',
		};

		const createdProduct1 = { ...product1, id: 27 };

		const edits1 = {
			creates: [ product1 ],
		};

		const originatingAction = createProduct( siteId, product1 );
		const action = productUpdated( siteId, createdProduct1, originatingAction );

		const edits2 = reducer( edits1, action );

		expect( edits1.creates[ 0 ] ).to.eql( product1 );
		expect( edits2.creates ).to.not.exist;
	} );

	test( 'should clear product from updates upon successful save', () => {
		const product1 = { id: 27, name: 'Product 1', sku: 'product-1' };
		const product1Update = { id: 27, name: 'Updated name' };
		const updatedProduct1 = { ...product1, ...product1Update };

		const edits1 = {
			updates: [ { id: 27, name: 'Updated name' } ],
		};

		const originatingAction = updateProduct( siteId, updatedProduct1 );
		const action = productUpdated( siteId, updatedProduct1, originatingAction );

		const edits2 = reducer( edits1, action );

		expect( edits1.updates[ 0 ] ).to.eql( product1Update );
		expect( edits2.updates ).to.not.exist;
	} );

	test( 'should clear all product edit data', () => {
		const edits1 = {
			creates: [ { id: { placeholder: 'product_1' }, name: 'Product 1' } ],
			updates: [ { id: 27, name: 'Updated name' } ],
			deletes: [ 32 ],
		};

		const action = clearProductEdits( siteId );

		const edits2 = reducer( edits1, action );

		expect( edits1.creates ).to.exist;
		expect( edits1.updates ).to.exist;
		expect( edits1.deletes ).to.exist;
		expect( edits2 ).to.equal( null );
	} );

	test( 'should clear product from updates upon successful delete', () => {
		const product1 = {
			id: 5,
			name: 'Product 1',
		};

		const product2 = {
			id: 6,
			name: 'Product 2',
		};

		const edits1 = {
			updates: [ product1, product2 ],
		};

		const action = {
			type: WOOCOMMERCE_PRODUCT_DELETE,
			siteId,
			productId: 6,
		};

		const edits2 = reducer( edits1, action );

		expect( edits1.updates[ 0 ] ).to.eql( product1 );
		expect( edits1.updates[ 1 ] ).to.eql( product2 );
		expect( edits2.updates.length ).to.eql( 1 );
	} );
} );
