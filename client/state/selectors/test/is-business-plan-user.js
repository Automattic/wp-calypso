import { PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import isBusinessPlanUser from 'calypso/state/selectors/is-business-plan-user';

describe( 'isBusinessPlanUser()', () => {
	test( 'should return true if any purchase is a business plan.', () => {
		const state = deepFreeze( {
			currentUser: {
				id: 123,
			},
			purchases: {
				data: [
					{
						user_id: '123',
						product_slug: 'some-other-plan',
					},
					{
						user_id: '123',
						product_slug: PLAN_BUSINESS,
					},
				],
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( isBusinessPlanUser( state ) ).toBe( true );
	} );

	test( 'should return true if any purchase is a business plan (2y).', () => {
		const state = deepFreeze( {
			currentUser: {
				id: 123,
			},
			purchases: {
				data: [
					{
						user_id: '123',
						product_slug: 'some-other-plan',
					},
					{
						user_id: '123',
						product_slug: PLAN_BUSINESS_2_YEARS,
					},
				],
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( isBusinessPlanUser( state ) ).toBe( true );
	} );

	test( 'should return false if non of the purchases is a business plan.', () => {
		const state = deepFreeze( {
			currentUser: {
				id: 123,
			},
			purchases: {
				data: [
					{
						user_id: '123',
						product_slug: 'some-other-plan',
					},
					{
						user_id: '123',
						product_slug: 'yet-another-plan',
					},
				],
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( isBusinessPlanUser( state ) ).toBe( false );
	} );

	test( 'should return false if purchasing data is null.', () => {
		const state = deepFreeze( {
			currentUser: {
				id: 123,
			},
			purchases: {
				data: [
					{
						// intentionally put a purchase that doesn't belong to the user 123 here.
						user_id: '789',
						product_slug: PLAN_BUSINESS,
					},
				],
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( isBusinessPlanUser( state ) ).toBe( false );
	} );
} );
