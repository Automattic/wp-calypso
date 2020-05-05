/**
 * Internal dependencies
 */
import siteSupportsRealtimeBackup from 'state/selectors/site-supports-realtime-backup';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';
import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'lib/products-values/constants';

describe( 'siteSupportsRealtimeBackup()', () => {
	test( 'should return false when no data is available', () => {
		const siteId = 123456;
		const state = {
			purchases: {
				data: [],
			},
			sites: {
				plans: {},
			},
		};

		expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when there is an inactive real time backup purchase for that site', () => {
		const siteId = 123456;
		const state = {
			purchases: {
				data: [
					{
						active: false,
						blog_id: siteId,
						product_slug: PRODUCT_JETPACK_BACKUP_REALTIME,
					},
				],
			},
			sites: {
				plans: {},
			},
		};

		expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when there is a daily backup purchase for that site', () => {
		const siteId = 123456;
		const dailyBackupProductSlugs = [
			PRODUCT_JETPACK_BACKUP_DAILY,
			PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		];

		dailyBackupProductSlugs.map( ( productSlug ) => {
			const state = {
				purchases: {
					data: [
						{
							active: true,
							blog_id: siteId,
							product_slug: productSlug,
						},
					],
				},
				sites: {
					plans: {},
				},
			};

			expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( false );
		} );
	} );

	test( 'should return true when there is a yearly real time backup purchase for that site', () => {
		const siteId = 123456;
		const realtimeBackupProductSlugs = [
			PRODUCT_JETPACK_BACKUP_REALTIME,
			PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		];

		realtimeBackupProductSlugs.map( ( productSlug ) => {
			const state = {
				purchases: {
					data: [
						{
							active: true,
							blog_id: siteId,
							product_slug: productSlug,
						},
					],
				},
				sites: {
					plans: {},
				},
			};

			expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( true );
		} );
	} );

	test( 'should return false when site is on a Jetpack Premium yearly plan', () => {
		const siteId = 123456;
		const premiumPlanSlugs = [ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ];

		premiumPlanSlugs.map( ( productSlug ) => {
			const state = {
				purchases: {
					data: [],
				},
				sites: {
					plans: {
						[ siteId ]: {
							data: [
								{
									currentPlan: true,
									productSlug: productSlug,
								},
							],
						},
					},
				},
			};

			expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( false );
		} );
	} );

	test( 'should return true when site is on a Jetpack Professional yearly plan', () => {
		const siteId = 123456;
		const professionalPlanSlugs = [ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ];

		professionalPlanSlugs.map( ( productSlug ) => {
			const state = {
				purchases: {
					data: [],
				},
				sites: {
					plans: {
						[ siteId ]: {
							data: [
								{
									currentPlan: true,
									productSlug: productSlug,
								},
							],
						},
					},
				},
			};

			expect( siteSupportsRealtimeBackup( state, siteId ) ).toBe( true );
		} );
	} );
} );
