/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_EDIT_PRODUCT } from '../../action-types';
import { editProduct } from '../actions.js';

describe( 'actions', () => {
	it( 'should create an action to edit a product', () => {
		const payload = {
			id: 1,
			key: 'title',
			value: 'test product',
		};
		const expectedAction = {
			type: WOOCOMMERCE_EDIT_PRODUCT,
			payload
		};
		expect( editProduct( payload.id, payload.key, payload.value ) ).to.eql( expectedAction );
	} );
} );
