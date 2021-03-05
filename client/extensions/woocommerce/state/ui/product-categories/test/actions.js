/**
 * External dependencies
 */
import { expect } from 'chai';
import { isObject, isString } from 'lodash';

/**
 * Internal dependencies
 */
import { generateProductCategoryId, editProductCategory } from '../actions';

const siteId = 123;

describe( 'actions', () => {
	describe( '#generateProductCategoryId', () => {
		test( 'should generate a unique string id each time.', () => {
			const id1 = generateProductCategoryId();
			const id2 = generateProductCategoryId();
			const id3 = generateProductCategoryId();

			expect( isObject( id1 ) ).to.be.true;
			expect( id1 ).to.not.equal( id2 );
			expect( id1 ).to.not.equal( id3 );
			expect( id2 ).to.not.equal( id3 );
		} );
	} );

	describe( '#editProductCategory', () => {
		test( 'should create a placeholder id if category is not passed in', () => {
			const action = editProductCategory( siteId, null, { name: 'Cat 1' } );

			expect( action.category ).to.exist;
			expect( isObject( action.category.id ) ).to.be.true;
			expect( isString( action.category.id.placeholder ) ).to.be.true;
		} );

		test( 'should not create a placeholder if category is passed in', () => {
			const category = { id: 101, name: 'Cat 1' };
			const action = editProductCategory( siteId, category, { name: 'Updated Cat 1' } );

			expect( action.category ).to.equal( category );
		} );
	} );
} );
