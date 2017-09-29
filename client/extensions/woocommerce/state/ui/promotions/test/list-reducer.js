/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../list-reducer';
import {
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should initialize to default values', () => {
		const state = reducer( undefined, { type: '%%NONE%%' } );

		expect( state ).to.exist;
		expect( state.currentPage ).to.equal( 1 );
		expect( state.perPage ).to.equal( 10 );
	} );

	it( 'should store current page', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 6,
			perPage: 30,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 6 );
		expect( state.perPage ).to.equal( 30 );
	} );

	it( 'should ignore an invalid page number', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 0,
			perPage: 30,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 1 );
		expect( state.perPage ).to.equal( 30 );
	} );

	it( 'should ignore an invalid perPage', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 4,
			perPage: 0,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 4 );
		expect( state.perPage ).to.equal( 10 );
	} );
} );

