/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../edits-reducer';

import {
	editProduct,
	editProductVariationType,
} from '../actions';

describe( 'edits-reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	it( 'should create "updates" upon first edit', () => {
		const product = { id: 1 };
		const edits = reducer( undefined, editProduct( product, { name: 'A Product' } ) );

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;
		expect( edits.updates[ 0 ] ).to.eql( { id: 1, name: 'A Product' } );
	} );

	it( 'should modify "updates" on second edit', () => {
		const product = { id: 1 };
		const edits1 = reducer( undefined, editProduct( product, {
			name: 'After first edit',
		} ) );

		const edits2 = reducer( undefined, editProduct( product, {
			name: 'After second edit',
			description: 'Description',
		} ) );

		expect( edits1.updates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits2.updates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits1.updates[ 0 ].description ).to.not.exist;
		expect( edits2.updates[ 0 ].description ).to.eql( 'Description' );
	} );

	it( 'should create updates for more than one existing product', () => {
		const product1 = { id: 1 };
		const edits1 = reducer( undefined, editProduct( product1, {
			name: 'First product',
		} ) );

		const product2 = { id: 2 };
		const edits2 = reducer( edits1, editProduct( product2, {
			name: 'Second product',
		} ) );

		expect( edits2.updates[ 0 ].id ).to.eql( 1 );
		expect( edits2.updates[ 0 ].name ).to.eql( 'First product' );
		expect( edits2.updates[ 1 ].id ).to.eql( 2 );
		expect( edits2.updates[ 1 ].name ).to.eql( 'Second product' );
	} );

	it( 'should create "creates" on first edit', () => {
		const edits = reducer( undefined, editProduct( null, {
			name: 'A new product',
		} ) );

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ] ).to.exist;
		expect( edits.creates[ 0 ].id ).to.eql( { index: 0 } );
		expect( edits.creates[ 0 ].name ).to.eql( 'A new product' );
	} );

	it( 'should modify "creates" on second edit', () => {
		const edits1 = reducer( undefined, editProduct( null, {
			name: 'After first edit',
		} ) );

		expect( edits1.creates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits1.creates[ 0 ].description ).to.not.exist;

		const edits2 = reducer( edits1, editProduct( edits1.creates[ 0 ], {
			name: 'After second edit',
			description: 'Description',
		} ) );

		expect( edits2.creates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits2.creates[ 0 ].description ).to.eql( 'Description' );
	} );

	it( 'should create more than one new product', () => {
		const edits1 = reducer( undefined, editProduct( null, {
			name: 'First product',
		} ) );

		const edits2 = reducer( edits1, editProduct( null, {
			name: 'Second product',
		} ) );

		expect( edits2.creates[ 0 ].id ).to.eql( { index: 0 } );
		expect( edits2.creates[ 0 ].name ).to.eql( 'First product' );
		expect( edits2.creates[ 1 ].id ).to.eql( { index: 1 } );
		expect( edits2.creates[ 1 ].name ).to.eql( 'Second product' );
	} );

	it( 'should create new product in "creates" when editing variation type the first time', () => {
		const edits = reducer( undefined, editProductVariationType( null, null, {
			name: 'New Variation Type',
		} ) );

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ].attributes ).to.exist;
		expect( edits.creates[ 0 ].attributes[ 0 ].name ).to.eql( 'New Variation Type' );
		expect( edits.creates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits.creates[ 0 ].attributes[ 0 ].options ).to.eql( [] );
	} );

	it( 'should modify product in "creates" when editing variation type a second time', () => {
		const edits1 = reducer( undefined, editProductVariationType( null, null, {
			name: 'Edited once',
		} ) );

		const edits2 = reducer( edits1, editProductVariationType( edits1.creates[ 0 ], 0, {
			name: 'Edited twice',
		} ) );

		expect( edits2.creates[ 0 ].attributes[ 0 ].name ).to.eql( 'Edited twice' );
		expect( edits2.creates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits2.creates[ 0 ].attributes[ 0 ].options ).to.eql( [] );
	} );

	it( 'should create more than one variation type for a newly created product', () => {
		const edits1 = reducer( undefined, editProductVariationType( null, null, {
			name: 'Variation Type One',
		} ) );

		expect( edits1.creates[ 0 ].attributes[ 0 ].name ).to.eql( 'Variation Type One' );
		expect( edits1.creates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits1.creates[ 0 ].attributes[ 0 ].options ).to.eql( [] );

		const edits2 = reducer( edits1, editProductVariationType( edits1.creates[ 0 ], null, {
			name: 'Variation Type Two',
		} ) );

		expect( edits2.creates[ 0 ].attributes[ 1 ].name ).to.eql( 'Variation Type Two' );
		expect( edits2.creates[ 0 ].attributes[ 1 ].variation ).to.be.true;
		expect( edits2.creates[ 0 ].attributes[ 1 ].options ).to.eql( [] );
	} );

	it( 'should add product to "updates" when editing variation type the first time', () => {
		const product = {
			id: 1,
		};
		const edits = reducer( undefined, editProductVariationType( product, null, {
			name: 'New Variation Type',
		} ) );

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;
		expect( edits.updates[ 0 ].attributes ).to.exist;
		expect( edits.updates[ 0 ].attributes[ 0 ].name ).to.eql( 'New Variation Type' );
		expect( edits.updates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits.updates[ 0 ].attributes[ 0 ].options ).to.eql( [] );
	} );

	it( 'should modify product in "updates" when editing variation type a second time', () => {
		const product = {
			id: 1,
		};
		const edits1 = reducer( undefined, editProductVariationType( product, null, {
			name: 'Edited once',
		} ) );

		const edits2 = reducer( edits1, editProductVariationType( edits1.updates[ 0 ], 0, {
			name: 'Edited twice',
		} ) );

		expect( edits2.updates[ 0 ].attributes[ 0 ].name ).to.eql( 'Edited twice' );
		expect( edits2.updates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits2.updates[ 0 ].attributes[ 0 ].options ).to.eql( [] );
	} );

	it( 'should create more than one variation type for an existing product', () => {
		const product = {
			id: 1,
		};
		const edits1 = reducer( undefined, editProductVariationType( product, null, {
			name: 'Variation Type One',
		} ) );

		expect( edits1.updates[ 0 ].attributes[ 0 ].name ).to.eql( 'Variation Type One' );
		expect( edits1.updates[ 0 ].attributes[ 0 ].variation ).to.be.true;
		expect( edits1.updates[ 0 ].attributes[ 0 ].options ).to.eql( [] );

		const edits2 = reducer( edits1, editProductVariationType( edits1.updates[ 0 ], null, {
			name: 'Variation Type Two',
		} ) );

		expect( edits2.updates[ 0 ].attributes[ 1 ].name ).to.eql( 'Variation Type Two' );
		expect( edits2.updates[ 0 ].attributes[ 1 ].variation ).to.be.true;
		expect( edits2.updates[ 0 ].attributes[ 1 ].options ).to.eql( [] );
	} );

	it( 'should not edit a non-variation attribute as a variation type', () => {
		const product = {
			attributes: [
				{ name: 'Not a variation', variation: false },
			],
		};

		const state = {
			creates: [
				product
			]
		};

		const edits = reducer( state, editProductVariationType( product, 0, {
			name: 'Attempted variation overwrite',
		} ) );

		expect( edits.creates[ 0 ].attributes[ 0 ].name ).to.eql( 'Not a variation' );
	} );
} );
