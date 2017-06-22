/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../edits-reducer';

import {
	editProductCategory,
} from '../actions';

const siteId = 123;

describe( 'edits-reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( null );
	} );

	it( 'should create "updates" upon first edit', () => {
		const category = { id: 101 };
		const edits = reducer( undefined, editProductCategory( siteId, category, {
			name: 'Existing Category',
		} ) );

		expect( edits ).to.not.equal( null );
		expect( edits.updates ).to.exist;
		expect( edits.updates[ 0 ] ).to.eql( { id: 101, name: 'Existing Category' } );
	} );

	it( 'should modify "updates" upon second edit', () => {
		const category = { id: 101 };
		const edits1 = reducer( undefined, editProductCategory( siteId, category, {
			name: 'After first edit',
		} ) );

		const edits2 = reducer( edits1, editProductCategory( siteId, category, {
			name: 'After second edit',
			description: 'Updated description',
		} ) );

		expect( edits1.updates[ 0 ].name ).to.eql( 'After first edit' );
		expect( edits2.updates[ 0 ].name ).to.eql( 'After second edit' );
		expect( edits1.updates[ 0 ].description ).to.not.exist;
		expect( edits2.updates[ 0 ].description ).to.eql( 'Updated description' );
	} );

	it( 'should create updates for more than one existing category', () => {
		const category1 = { id: 101, name: 'c1' };
		const edits1 = reducer( undefined, editProductCategory( siteId, category1, {
			name: 'First Category',
		} ) );

		const category2 = { id: 202, name: 'c2' };
		const edits2 = reducer( edits1, editProductCategory( siteId, category2, {
			name: 'Second Category',
		} ) );

		expect( edits2.updates[ 0 ].id ).to.equal( 101 );
		expect( edits2.updates[ 0 ].name ).to.equal( 'First Category' );
		expect( edits2.updates[ 1 ].id ).to.equal( 202 );
		expect( edits2.updates[ 1 ].name ).to.equal( 'Second Category' );
	} );

	it( 'should create "creates" on first edit', () => {
		const id1 = { placeholder: 'productCategory_1' };
		const edits = reducer( undefined, editProductCategory( siteId, { id: id1 }, {
			name: 'New Category',
			slug: 'new-category',
		} ) );

		expect( edits ).to.not.equal( null );
		expect( edits.creates ).to.exist;
		expect( edits.creates[ 0 ] ).to.exist;
		expect( edits.creates[ 0 ].id ).to.eql( id1 );
		expect( edits.creates[ 0 ].name ).to.eql( 'New Category' );
		expect( edits.creates[ 0 ].slug ).to.eql( 'new-category' );
	} );

	it( 'should create more than one category', () => {
		const id1 = { placeholder: 'productCategory_1' };
		const edits1 = reducer( undefined, editProductCategory( siteId, { id: id1 }, {
			name: 'First Category',
			slug: 'first-category',
		} ) );

		const id2 = { placeholder: 'productCategory_2' };
		const edits2 = reducer( edits1, editProductCategory( siteId, { id: id2 }, {
			name: 'Second Category',
			slug: 'second-category',
		} ) );

		expect( edits2.creates[ 0 ].id ).to.eql( id1 );
		expect( edits2.creates[ 0 ].name ).to.eql( 'First Category' );
		expect( edits2.creates[ 0 ].slug ).to.eql( 'first-category' );
		expect( edits2.creates[ 1 ].id ).to.eql( id2 );
		expect( edits2.creates[ 1 ].name ).to.eql( 'Second Category' );
		expect( edits2.creates[ 1 ].slug ).to.eql( 'second-category' );
	} );

	it( 'should set currentlyEditingId when editing a new category', () => {
		const edits1 = reducer( undefined, editProductCategory( siteId, null, {
			name: 'First Category',
			slug: 'first-category',
		} ) );

		const edits2 = reducer( edits1, editProductCategory( siteId, null, {
			name: 'Second Category',
			slug: 'second-category',
		} ) );

		expect( edits1.currentlyEditingId ).to.eql( edits1.creates[ 0 ].id );
		expect( edits2.currentlyEditingId ).to.eql( edits2.creates[ 1 ].id );
	} );
} );

