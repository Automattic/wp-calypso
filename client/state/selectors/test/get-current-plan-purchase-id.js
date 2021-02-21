/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';

describe( 'getCurrentPlanPurchaseId()', () => {
	it( 'should return null if the site is unknown', () => {
		const state = {
			currentUser: {
				capabilities: {},
			},
			sites: {
				plans: {
					456: {
						data: [
							{
								currentPlan: true,
								id: 98765,
							},
						],
					},
				},
				items: {
					456: {},
				},
			},
		};

		expect( getCurrentPlanPurchaseId( state ) ).to.be.null;
		expect( getCurrentPlanPurchaseId( state, 123 ) ).to.be.null;
	} );

	it( 'should return null if the current purchase ID is unknown', () => {
		const siteId = 123;
		const state = {
			currentUser: {
				capabilities: {},
			},
			sites: {
				plans: {
					[ siteId ]: {
						data: [
							{
								currentPlan: false,
								id: 98765,
							},
							{
								currentPlan: true,
							},
						],
					},
				},
				items: {
					[ siteId ]: {},
				},
			},
		};

		expect( getCurrentPlanPurchaseId( state, siteId ) ).to.be.null;
	} );

	it( 'should return null if there is no plans data, but there is site plan data', () => {
		const siteId = 123;
		const state = {
			currentUser: {
				capabilities: {},
			},
			sites: {
				plans: {
					[ siteId ]: {
						data: [],
					},
				},
				items: {
					[ siteId ]: {
						plan: {},
					},
				},
			},
		};

		expect( getCurrentPlanPurchaseId( state, siteId ) ).to.be.null;
	} );

	it( 'should return the purchase ID for a site', () => {
		const siteId = 123;
		const purchaseId = 123456;
		const state = {
			currentUser: {
				capabilities: {},
			},
			sites: {
				plans: {
					[ siteId ]: {
						data: [
							{
								currentPlan: true,
								id: purchaseId,
							},
						],
					},
				},
				items: {
					[ siteId ]: {
						plan: { some: 'plan' },
					},
				},
			},
		};

		expect( getCurrentPlanPurchaseId( state, siteId ) ).to.equal( purchaseId );
	} );
} );
