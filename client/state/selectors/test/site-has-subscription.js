/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import siteHasSubscription from '../site-has-subscription';

const siteId = 174989851;

const JETPACK_BACKUP_PRODUCTS = [
	'jetpack_backup_daily',
	'jetpack_backup_realtime',
	'jetpack_backup_daily_monthly',
	'jetpack_backup_realtime_monthly',
];

const planJetpackFree = {
	product_id: 2002,
	product_slug: 'jetpack_free',
	expired: false,
};

const planJetpackSecurity = {
	product_id: 2010,
	product_slug: 'jetpack_security_daily',
	expired: false,
};

const productJetpackBackup = {
	product_id: '2102',
	product_slug: 'jetpack_backup_daily',
	expired: false,
};

const siteState = {
	sites: {
		items: {
			[ siteId ]: {
				ID: siteId,
				jetpack: true,
				plan: {
					...planJetpackFree,
				},
				products: [],
			},
		},
	},
};

describe( 'siteHasSubscription()', () => {
	test( 'should return null if siteId is undefined', () => {
		const state = {
			...siteState,
		};

		const thisSiteId = undefined;
		expect( siteHasSubscription( state, thisSiteId, JETPACK_BACKUP_PRODUCTS ) ).to.be.null;
	} );

	test( 'should return false if subscriptionSlug is undefined', () => {
		const state = {
			...siteState,
		};

		expect( siteHasSubscription( state, siteId, undefined ) ).to.be.false;
	} );

	test( 'should return true if the site has non-expired subscription to subscriptionSlug product(s)', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						jetpack: true,
						plan: {
							...planJetpackFree,
						},
						products: [
							{
								...productJetpackBackup,
							},
						],
					},
				},
			},
		};

		expect( siteHasSubscription( state, siteId, JETPACK_BACKUP_PRODUCTS ) ).to.be.true;
	} );

	test( 'should return false if the site has expired subscription to subscriptionSlug product(s)', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						jetpack: true,
						plan: {
							...planJetpackFree,
						},
						products: [
							{
								...productJetpackBackup,
								expired: true,
							},
						],
					},
				},
			},
		};

		expect( siteHasSubscription( state, siteId, JETPACK_BACKUP_PRODUCTS ) ).to.be.false;
	} );

	test( 'should return true if the site has non-expired subscription to subscriptionSlug plan', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						jetpack: true,
						plan: {
							...planJetpackSecurity,
						},
						products: [],
					},
				},
			},
		};

		expect( siteHasSubscription( state, siteId, 'jetpack_security_daily' ) ).to.be.true;
	} );

	test( 'should return false if the site has expired subscription to subscriptionSlug plan', () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						jetpack: true,
						plan: {
							...planJetpackSecurity,
							expired: true,
						},
						products: [],
					},
				},
			},
		};

		expect( siteHasSubscription( state, siteId, 'jetpack_security_daily' ) ).to.be.false;
	} );

	test( "should return true if site has subscription to a product that is included in the site's plan", () => {
		const state = {
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						jetpack: true,
						plan: {
							...planJetpackSecurity,
						},
						products: [],
					},
				},
			},
		};

		expect( siteHasSubscription( state, siteId, 'jetpack_backup_daily' ) ).to.be.true;
	} );
} );
