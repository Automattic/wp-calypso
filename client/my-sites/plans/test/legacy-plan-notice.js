import legacyPlanNotice from 'calypso/my-sites/plans/legacy-plan-notice';

describe( 'Shows legacy plan notice for ex-plans', () => {
	let fakeLegacySiteSlice;

	beforeAll( () => {
		// Sites from store.
		fakeLegacySiteSlice = {
			sites: {
				items: {
					// Free plan site.
					1: {
						ID: 1,
						name: 'Free Inc.',
						jetpack: false,
						is_wpcom_atomic: false,
						options: {},
						plan: {
							product_id: 1,
							product_slug: 'FREE_PLAN',
							product_name_short: 'free',
							expired: false,
							user_is_owner: false,
							is_free: true,
						},
					},
					// Legacy Business plan site.
					2: {
						ID: 2,
						name: 'Business Inc.',
						jetpack: false,
						is_wpcom_atomic: true,
						options: {},
						plan: {
							product_id: 1008,
							product_slug: 'value_bundle',
							product_name_short: 'Business',
							expired: false,
							user_is_owner: false,
							is_free: false,
						},
					},
					// Site with pro plan.
					3: {
						ID: 3,
						name: 'Pro Inc.',
						jetpack: false,
						is_wpcom_atomic: true,
						options: {},
						plan: {
							product_id: 1032,
							product_slug: 'pro-plan',
							product_name_short: 'Pro',
							expired: false,
							user_is_owner: true,
							is_free: false,
						},
					},
				},
			},
		};
	} );

	test( 'Do not show legacy plan notice for users on Free plan', () => {
		const freePlanSite = fakeLegacySiteSlice.sites.items[ '1' ];
		const siteIsEligibleForProPlan = true;
		const legacyPlanNoticeComponent = legacyPlanNotice( siteIsEligibleForProPlan, freePlanSite );

		expect( legacyPlanNoticeComponent ).toBeUndefined;
	} );

	test( 'Show legacy plan notice to users on Business plan', () => {
		const legacyBusinessPlanSite = fakeLegacySiteSlice.sites.items[ '2' ];
		const siteIsEligibleForProPlan = true;
		const legacyPlanNoticeComponent = legacyPlanNotice(
			siteIsEligibleForProPlan,
			legacyBusinessPlanSite
		);

		expect( legacyPlanNoticeComponent.props.text ).toContain( 'You’re currently on a legacy plan' );
	} );

	test( 'Do not show legacy plan notice to users on Pro plan', () => {
		const proPlanSite = fakeLegacySiteSlice.sites.items[ '3' ];

		// Even with this set to true, the notice should not show as the plan is checked for whether it's "pro-plan" or not.
		const siteIsEligibleForProPlan = true;
		const legacyPlanNoticeComponent = legacyPlanNotice( siteIsEligibleForProPlan, proPlanSite );

		expect( legacyPlanNoticeComponent ).toBeUndefined;
	} );
} );
