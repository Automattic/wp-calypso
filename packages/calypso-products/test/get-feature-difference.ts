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
} from '../src';

describe( 'getFeatureDifference function related tests', () => {
	it( 'get2023PricingGridSignupWpcomFeatures bundle selector extractor: Free --> Personal difference', () => {
		expect(
			getFeatureDifference( PLAN_FREE, PLAN_PERSONAL, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
			FEATURE_FAST_SUPPORT_FROM_EXPERTS,
			FEATURE_STATS_BASIC_20250206,
		] );
	} );

	it( 'get2023PricingGridSignupWpcomFeatures bundle selector extractor: Personal --> Premium difference', () => {
		expect(
			getFeatureDifference( PLAN_PERSONAL, PLAN_PREMIUM, 'get2023PricingGridSignupWpcomFeatures' )
		).toEqual( [
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
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
} );
