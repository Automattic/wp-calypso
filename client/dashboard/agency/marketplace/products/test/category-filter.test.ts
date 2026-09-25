import {
	dropEmptyCategoryFilter,
	getInitialCategoryFilters,
	getTileCategory,
	setTileCategory,
} from '../category-filter';
import type { Filter } from '@wordpress/dataviews';

const typeFilter: Filter = { field: 'type', operator: 'is', value: 'plan' };

describe( 'getInitialCategoryFilters', () => {
	test( 'filters by a tile category from the deep link', () => {
		expect( getInitialCategoryFilters( 'security' ) ).toEqual( [
			{ field: 'category', operator: 'isAny', value: [ 'security' ] },
		] );
	} );

	test( 'maps category aliases to the tile values', () => {
		expect( getInitialCategoryFilters( 'pressable-addon' ) ).toEqual( [
			{ field: 'category', operator: 'isAny', value: [ 'pressable' ] },
		] );
		expect( getInitialCategoryFilters( 'shipping-delivery-fulfillment' ) ).toEqual( [
			{ field: 'category', operator: 'isAny', value: [ 'shipping' ] },
		] );
	} );

	test( 'ignores a missing or unknown category', () => {
		expect( getInitialCategoryFilters() ).toEqual( [] );
		expect( getInitialCategoryFilters( 'not-a-category' ) ).toEqual( [] );
	} );
} );

describe( 'getTileCategory', () => {
	test( 'selects the tile when it is the only category set', () => {
		expect( getTileCategory( setTileCategory( [ typeFilter ], 'woocommerce' ) ) ).toBe(
			'woocommerce'
		);
	} );

	test( 'selects no tile for several categories, none, or an unknown value', () => {
		expect(
			getTileCategory( [
				{ field: 'category', operator: 'isAny', value: [ 'security', 'social' ] },
			] )
		).toBeNull();
		expect( getTileCategory( [ typeFilter ] ) ).toBeNull();
		expect( getTileCategory() ).toBeNull();
		expect(
			getTileCategory( [ { field: 'category', operator: 'isAny', value: [ 'nope' ] } ] )
		).toBeNull();
	} );
} );

describe( 'setTileCategory', () => {
	test( 'replaces the category filter and keeps the others', () => {
		const filters = setTileCategory( [ typeFilter ], 'security' );
		expect( setTileCategory( filters, 'social' ) ).toEqual( [
			typeFilter,
			{ field: 'category', operator: 'isAny', value: [ 'social' ] },
		] );
	} );

	test( 'clears the category filter when no tile is selected', () => {
		expect( setTileCategory( setTileCategory( [ typeFilter ], 'security' ), null ) ).toEqual( [
			typeFilter,
		] );
	} );
} );

describe( 'dropEmptyCategoryFilter', () => {
	test( 'drops a category filter with no values left', () => {
		expect(
			dropEmptyCategoryFilter( [ typeFilter, { field: 'category', operator: 'isAny', value: [] } ] )
		).toEqual( [ typeFilter ] );
		expect(
			dropEmptyCategoryFilter( [ { field: 'category', operator: 'isAny', value: undefined } ] )
		).toEqual( [] );
	} );

	test( 'keeps a category filter that still has values', () => {
		const filters: Filter[] = [ { field: 'category', operator: 'isAny', value: [ 'security' ] } ];
		expect( dropEmptyCategoryFilter( filters ) ).toEqual( filters );
	} );
} );
