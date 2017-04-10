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
} );
