/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isBusinessPlanUser } from '../';
import { PLAN_BUSINESS } from 'lib/plans/constants';

describe( 'isBusinessPlanUser()', () => {
	it( 'should return true if any purchase is a business plan.', () => {
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

		assert.isTrue( isBusinessPlanUser( state ) );
	} );

	it( 'should return false if non of the purchases is a business plan.', () => {
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

		assert.isFalse( isBusinessPlanUser( state ) );
	} );

	it( 'should return false if current user id is null.', () => {
		const state = deepFreeze( {
			currentUser: {},
		} );

		assert.isFalse( isBusinessPlanUser( state ) );
	} );

	it( 'should return false if purchasing data is null.', () => {
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

		assert.isFalse( isBusinessPlanUser( state ) );
	} );
} );
