/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { ProductPurchaseFeaturesList } from '../index';

jest.mock( 'blocks/product-purchase-features-list/google-vouchers', () => 'GoogleVouchers' );
jest.mock( 'blocks/product-purchase-features-list/video-audio-posts', () => 'VideoAudioPosts' );

describe( 'ProductPurchaseFeaturesList basic tests', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } /> );
		expect( comp.find( '.product-purchase-features-list' ) ).toHaveLength( 1 );
	} );
} );

describe( 'ProductPurchaseFeaturesList getFeatures() tests', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	let spy, spyWrong;

	afterEach( () => {
		if ( spy ) {
			spy.mockClear();
		}
		if ( spyWrong ) {
			spyWrong.mockClear();
		}
	} );

	test( 'should not render features if is placeholder', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } isPlaceholder={ true } /> );
		expect( comp.find( '.product-purchase-features-list' ).children() ).toHaveLength( 0 );
	} );

	test( 'should render no features for WP free plan', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_FREE } /> );
		expect( comp.find( '.product-purchase-features-list' ).children() ).toHaveLength( 0 );
	} );

	test( 'should render WP blogger features for WP blogger plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBloggerFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_BLOGGER } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP blogger features for WP blogger plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBloggerFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BLOGGER_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP personal features for WP personal plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_PERSONAL } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP personal features for WP personal plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PERSONAL_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP premium features for WP premium plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_PREMIUM } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP premium features for WP premium plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PREMIUM_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP business features for WP business plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP business features for WP business plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP ecommerce features for WP ecommerce plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getEcommerceFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render WP ecommerce features for WP ecommerce plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getEcommerceFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack free features for jetpack free plans', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackFreeFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_FREE } /> );
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack personal features for jetpack personal plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PERSONAL } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack personal features for jetpack personal plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PERSONAL_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack premium features for jetpack premium plans - yearly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PREMIUM } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack premium features for jetpack premium plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PREMIUM_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack business features for jetpack business plans - yearly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_BUSINESS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );

	test( 'should render Jetpack business features for jetpack business plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );

		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_BUSINESS_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( comp.find( '.product-purchase-features-list' ).children().length ).toBeGreaterThan( 0 );
	} );
} );

describe( 'ProductPurchaseFeaturesList feature functions', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	test( 'getBusinessFeatures() should pass proper plan type to VideoAudioPosts child component', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS } /> );
		const audioPosts = comp.find( 'VideoAudioPosts' );
		expect( audioPosts ).toHaveLength( 1 );
		expect( audioPosts.prop( 'plan' ) ).toBe( PLAN_BUSINESS );
	} );

	test( 'getBusinessFeatures() should pass proper plan type to VideoAudioPosts child component when 2-years plan is used', () => {
		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS_2_YEARS } />
		);
		const audioPosts = comp.find( 'VideoAudioPosts' );
		expect( audioPosts ).toHaveLength( 1 );
		expect( audioPosts.prop( 'plan' ) ).toBe( PLAN_BUSINESS_2_YEARS );
	} );

	test( 'getEcommerceFeatures() should pass proper plan type to VideoAudioPosts child component', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE } /> );
		const audioPosts = comp.find( 'VideoAudioPosts' );
		expect( audioPosts ).toHaveLength( 1 );
		expect( audioPosts.prop( 'plan' ) ).toBe( PLAN_ECOMMERCE );
	} );

	test( 'getEcommerceFeatures() should pass proper plan type to VideoAudioPosts child component when 2-years plan is used', () => {
		const comp = shallow(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE_2_YEARS } />
		);
		const audioPosts = comp.find( 'VideoAudioPosts' );
		expect( audioPosts ).toHaveLength( 1 );
		expect( audioPosts.prop( 'plan' ) ).toBe( PLAN_ECOMMERCE_2_YEARS );
	} );

	test( 'getPremiumFeatures() should pass proper plan type to VideoAudioPosts child component', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_PREMIUM } /> );
		const audioPosts = comp.find( 'VideoAudioPosts' );
		expect( audioPosts ).toHaveLength( 1 );
		expect( audioPosts.prop( 'plan' ) ).toBe( PLAN_PREMIUM );
	} );
} );

describe( '<HappinessSupportCard isJetpackFreePlan', () => {
	const props = {
		plan: PLAN_JETPACK_FREE,
		selectedSite: {
			plan: PLAN_JETPACK_FREE,
		},
	};
	test( 'Should set isJetpackFreePlan for free plan', () => {
		const comp = shallow( <ProductPurchaseFeaturesList { ...props } /> );
		const happinessSupport = comp.find( 'HappinessSupportCard' );
		expect( happinessSupport.prop( 'isJetpackFreePlan' ) ).toBe( true );
	} );
} );

describe( '<HappinessSupportCard isEligibleForLiveChat', () => {
	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		const props = {
			plan: plan,
			isPlaceholder: false,
			selectedSite: {
				plan,
			},
		};
		test( `Should be eligible for live chat for ${ plan }`, () => {
			const comp = shallow( <ProductPurchaseFeaturesList { ...props } /> );
			const happinessSupport = comp.find( 'HappinessSupportCard' );
			expect( happinessSupport.prop( 'showLiveChatButton' ) ).toBe( true );
		} );
	} );
} );
