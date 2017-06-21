/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	generateProductCategoryId,
	editProductCategory,
} from '../actions';

const siteId = 123;

describe( 'actions', () => {
	describe( '#generateProductCategoryId', () => {
		it( 'should generate a unique string id each time.', () => {
			const id1 = generateProductCategoryId();
			const id2 = generateProductCategoryId();
			const id3 = generateProductCategoryId();

			expect( typeof id1 ).to.equal( 'string' );
			expect( id1 ).to.not.equal( id2 );
			expect( id1 ).to.not.equal( id3 );
			expect( id2 ).to.not.equal( id3 );
		} );
	} );

	describe( '#editProductCategory', () => {
		it( 'should create a placeholder id if category is not passed in', () => {
			const action = editProductCategory( siteId, null, { name: 'Cat 1' } );

			expect( action.category ).to.exist;
			expect( typeof action.category.id ).to.equal( 'object' );
			expect( typeof action.category.id.placeholder ).to.equal( 'string' );
		} );

		it( 'should not create a placeholder if category is passed in', () => {
			const category = { id: 101, name: 'Cat 1' };
			const action = editProductCategory( siteId, category, { name: 'Updated Cat 1' } );

			expect( action.category ).to.equal( category );
		} );
	} );
} );
