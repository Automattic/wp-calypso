// @ts-nocheck - TODO: Fix TypeScript issues
import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { COMPARE_PLANS_QUERY_PARAM } from '../constants';
import {
	getComparePlansFromContext,
	getItemSlugByDuration,
	getPlanRecommendationFromContext,
} from '../utils';

const PURCHASABLE_ITEMS = [ 'jetpack_personal', 'jetpack_backup_daily', 'jetpack_scan' ];
const NON_PURCHASABLE_ITEMS = [ 'jetpack_abc', 'jetpack_qwerty' ];

function buildContextQueryObject( plans?: string ) {
	if ( ! plans ) {
		return { query: {} };
	}
	return { query: { [ COMPARE_PLANS_QUERY_PARAM ]: plans } };
}

describe( 'getComparePlansFromContext', () => {
	it( 'returns an empty array if there are no query parameters', () => {
		expect( getComparePlansFromContext( buildContextQueryObject() ) ).toEqual( [] );
	} );

	it( 'returns the list of purchasable Jetpack items', () => {
		expect(
			getComparePlansFromContext( buildContextQueryObject( PURCHASABLE_ITEMS.join( ',' ) ) )
		).toEqual( [ 'jetpack_personal', 'jetpack_backup_daily', 'jetpack_scan' ] );
	} );

	it( 'filters out non purchasable items', () => {
		expect(
			getComparePlansFromContext(
				buildContextQueryObject( [ ...PURCHASABLE_ITEMS, ...NON_PURCHASABLE_ITEMS ].join( ',' ) )
			)
		).toEqual( [ 'jetpack_personal', 'jetpack_backup_daily', 'jetpack_scan' ] );

		expect(
			getComparePlansFromContext( buildContextQueryObject( NON_PURCHASABLE_ITEMS.join( ',' ) ) )
		).toEqual( [] );
	} );
} );

describe( 'getPlanRecommendationFromContext', () => {
	it( 'returns undefined when no plans are provided', () => {
		expect( getPlanRecommendationFromContext( buildContextQueryObject() ) ).toBeUndefined();
	} );

	it( 'returns undefined when only one plan is provided', () => {
		expect(
			getPlanRecommendationFromContext( buildContextQueryObject( 'jetpack_personal' ) )
		).toBeUndefined();
	} );

	it( 'returns undefined if the first item is not a legacy plan', () => {
		expect(
			getPlanRecommendationFromContext( buildContextQueryObject( 'jetpack_scan,jetpack_personal' ) )
		).toBeUndefined();

		expect(
			getPlanRecommendationFromContext(
				buildContextQueryObject( 'jetpack_personal,jetpack_backup_daily' )
			)
		).toBeTruthy();
	} );

	it( 'returns undefined if all provided plans are legacy plans', () => {
		expect(
			getPlanRecommendationFromContext(
				buildContextQueryObject( 'jetpack_premium,jetpack_personal' )
			)
		).toBeUndefined();
		expect(
			getPlanRecommendationFromContext(
				buildContextQueryObject( 'jetpack_premium,jetpack_personal,jetpack_business' )
			)
		).toBeUndefined();
	} );

	it( 'returns a tupe being the first element the legacy item and the second an array of new items', () => {
		const [ legacyItem, ...newItems ] = PURCHASABLE_ITEMS;
		expect(
			getPlanRecommendationFromContext( buildContextQueryObject( PURCHASABLE_ITEMS.join( ',' ) ) )
		).toEqual( [ legacyItem, newItems ] );
	} );
} );

describe( 'getItemSlugByDuration', () => {
	it( 'returns the monthly version of an item slug', () => {
		expect( getItemSlugByDuration( 'jetpack_scan', TERM_MONTHLY ) ).toBe( 'jetpack_scan_monthly' );
		expect( getItemSlugByDuration( 'jetpack_scan_monthly', TERM_MONTHLY ) ).toBe(
			'jetpack_scan_monthly'
		);
	} );

	it( 'returns the yearly version of an item slug', () => {
		expect( getItemSlugByDuration( 'jetpack_scan', TERM_ANNUALLY ) ).toBe( 'jetpack_scan' );
		expect( getItemSlugByDuration( 'jetpack_scan_monthly', TERM_ANNUALLY ) ).toBe( 'jetpack_scan' );
	} );
} );
