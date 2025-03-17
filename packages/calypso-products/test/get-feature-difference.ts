import {
	FEATURE_DEV_TOOLS,
	FEATURE_PRIORITY_24_7_SUPPORT,
	FEATURE_UPLOAD_PLUGINS,
	getFeatureDifference,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_CONNECT_ANALYTICS,
	FEATURE_UPLOAD_VIDEO,
	FEATURE_STATS_ADVANCED_20250206,
	PLAN_ECOMMERCE,
	FEATURE_THEMES_PREMIUM_AND_STORE,
	FEATURE_WOOCOMMERCE_HOSTING,
	PLAN_FREE,
	FEATURE_AD_FREE_EXPERIENCE,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	FEATURE_FAST_SUPPORT_FROM_EXPERTS,
	FEATURE_STATS_BASIC_20250206,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_INVENTORY,
	FEATURE_CUSTOM_MARKETING_AUTOMATION,
	getPlan,
	FEATURE_SUPPORT_FROM_EXPERTS,
} from '../src';

describe( 'getFeatureDifference function related tests', () => {
	it( 'get2023PricingGridSignupWpcomFeatures bundle selector extractor: Free --> Personal difference', () => {
		expect(
			getFeatureDifference( PLAN_FREE, PLAN_PERSONAL, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
			FEATURE_SUPPORT_FROM_EXPERTS,
			FEATURE_STATS_BASIC_20250206,
		] );
	} );

	it( 'get2023PricingGridSignupWpcomFeatures bundle selector extractor: Personal --> Premium difference', () => {
		expect(
			getFeatureDifference( PLAN_PERSONAL, PLAN_PREMIUM, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			FEATURE_FAST_SUPPORT_FROM_EXPERTS,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_CONNECT_ANALYTICS,
			FEATURE_UPLOAD_VIDEO,
			FEATURE_STATS_ADVANCED_20250206,
		] );
	} );

	it( 'get2023PricingGridSignupWpcomFeatures bundle selector: Premium --> Business difference', () => {
		expect(
			getFeatureDifference( PLAN_PREMIUM, PLAN_BUSINESS, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [ FEATURE_PRIORITY_24_7_SUPPORT, FEATURE_UPLOAD_PLUGINS, FEATURE_DEV_TOOLS ] );
	} );

	it( 'get2023PricingGridSignupWpcomFeatures bundle selector extractor: Business --> Woo difference', () => {
		expect(
			getFeatureDifference( PLAN_BUSINESS, PLAN_ECOMMERCE, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [ FEATURE_THEMES_PREMIUM_AND_STORE, FEATURE_WOOCOMMERCE_HOSTING ] );
	} );

	it( 'Other feature bundle selector, differentiates plan featurescorrectly, Business', () => {
		expect( getFeatureDifference( PLAN_BUSINESS, PLAN_ECOMMERCE, 'getCheckoutFeatures' ) ).toEqual(
			[
				FEATURE_ACCEPT_PAYMENTS,
				FEATURE_SHIPPING_CARRIERS,
				FEATURE_UNLIMITED_PRODUCTS_SERVICES,
				FEATURE_INVENTORY,
				FEATURE_CUSTOM_MARKETING_AUTOMATION,
			]
		);
	} );

	it( 'If no feature difference should return emtpty array', () => {
		expect( getFeatureDifference( PLAN_BUSINESS, PLAN_BUSINESS, 'getCheckoutFeatures' ) ).toEqual(
			[]
		);
	} );

	it( 'Returns empty array when feature bundle selector does not exist', () => {
		expect(
			getFeatureDifference( PLAN_PREMIUM, PLAN_BUSINESS, 'nonExistentSelector' as any )
		).toEqual( [] );
	} );

	it( 'Handles case when feature bundle selector returns a function instead of array', () => {
		const mockPlan = getPlan( PLAN_BUSINESS );
		jest
			.spyOn( mockPlan as any, 'getCheckoutFeatures' )
			.mockImplementation( () => [ FEATURE_PRIORITY_24_7_SUPPORT, FEATURE_UPLOAD_PLUGINS ] );

		expect( getFeatureDifference( PLAN_PREMIUM, PLAN_BUSINESS, 'getCheckoutFeatures' ) ).toEqual( [
			FEATURE_PRIORITY_24_7_SUPPORT,
			FEATURE_UPLOAD_PLUGINS,
		] );
	} );

	it( 'Difference should not contain features from smaller plan', () => {
		const mockFeatureSelector = 'get2023PricingGridSignupWpcomFeatures';

		const difference = getFeatureDifference( PLAN_PERSONAL, PLAN_PREMIUM, mockFeatureSelector );

		const planPersonalFeatures = getPlan( PLAN_PERSONAL )?.[
			mockFeatureSelector
		]?.() as unknown as Array< string >;

		planPersonalFeatures.forEach( ( f ) => {
			expect( difference ).not.toContain( f );
		} );
	} );
} );
