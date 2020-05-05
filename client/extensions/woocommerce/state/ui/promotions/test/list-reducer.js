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
	WOOCOMMERCE_PROMOTIONS_SEARCH,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should initialize to default values', () => {
		const state = reducer( undefined, { type: '%%NONE%%' } );

		expect( state ).to.exist;
		expect( state.currentPage ).to.equal( 1 );
		expect( state.perPage ).to.equal( 10 );
		expect( state.searchFilter ).to.equal( '' );
	} );

	test( 'should store current page', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 6,
			perPage: 10,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 6 );
		expect( state.perPage ).to.equal( 10 );
	} );

	test( 'should ignore an invalid page number', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 0,
			perPage: 30,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 1 );
		expect( state.perPage ).to.equal( 30 );
	} );

	test( 'should ignore an invalid perPage', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
			currentPage: 4,
			perPage: 0,
		};
		const state = reducer( undefined, action );

		expect( state.currentPage ).to.equal( 4 );
		expect( state.perPage ).to.equal( 10 );
	} );

	test( 'should set the search filter', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_SEARCH,
			searchFilter: 'searchfilter terms',
		};
		const state = reducer( undefined, action );

		expect( state.searchFilter ).to.equal( 'searchfilter terms' );
	} );

	test( 'should reset the page number when setting a new search filter', () => {
		const action = {
			type: WOOCOMMERCE_PROMOTIONS_SEARCH,
			searchFilter: 'searchfilter terms',
		};
		const state = reducer( { currentPage: 4, perPage: 13 }, action );

		expect( state.currentPage ).to.equal( 1 );
		expect( state.perPage ).to.equal( 13 );
	} );
} );
