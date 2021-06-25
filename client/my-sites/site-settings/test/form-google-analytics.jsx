/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => 'UpsellNudge' );
jest.mock( 'calypso/components/notice', () => 'Notice' );
jest.mock( 'calypso/components/notice/notice-action', () => 'NoticeAction' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
} from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import GoogleAnalyticsSimpleForm from '../analytics/form-google-analytics-simple';
import GoogleAnalyticsJetpackForm from '../analytics/form-google-analytics-jetpack';

const props = {
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: ( x ) => x,
	onChangeField: ( x ) => x,
	eventTracker: ( x ) => x,
	uniqueEventTracker: ( x ) => x,
	fields: {},
};

describe( 'GoogleAnalyticsForm basic tests', () => {
	test( 'simple form should not blow up and have proper CSS class', () => {
		const comp = shallow( <GoogleAnalyticsSimpleForm { ...props } /> );
		expect( comp.find( '#analytics' ) ).toHaveLength( 1 );
	} );
	test( 'jetpack form should not blow up and have proper CSS class', () => {
		const comp = shallow( <GoogleAnalyticsJetpackForm { ...props } /> );
		expect( comp.find( '#analytics' ) ).toHaveLength( 1 );
	} );
	test( 'simple form should not show upgrade nudge if disabled', () => {
		const comp = shallow( <GoogleAnalyticsSimpleForm { ...props } showUpgradeNudge={ false } /> );
		expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ) ).toHaveLength( 0 );
	} );
	test( 'jetpack form should not show upgrade nudge if disabled', () => {
		const comp = shallow( <GoogleAnalyticsJetpackForm { ...props } showUpgradeNudge={ false } /> );
		expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ) ).toHaveLength( 0 );
	} );
} );

describe( 'UpsellNudge should get appropriate plan constant for both forms', () => {
	const myProps = {
		...props,
		showUpgradeNudge: true,
	};

	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL ].forEach( ( product_slug ) => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = shallow(
				<GoogleAnalyticsSimpleForm { ...myProps } site={ { plan: { product_slug } } } />
			);
			expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
			expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ).props().plan ).toBe(
				PLAN_PREMIUM
			);
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS ].forEach( ( product_slug ) => {
		test( `Business 2 year for (${ product_slug })`, () => {
			const comp = shallow(
				<GoogleAnalyticsSimpleForm { ...myProps } site={ { plan: { product_slug } } } />
			);
			expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
			expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ).props().plan ).toBe(
				PLAN_PREMIUM_2_YEARS
			);
		} );
	} );

	[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ].forEach(
		( product_slug ) => {
			test( `Jetpack Security for (${ product_slug })`, () => {
				const comp = shallow(
					<GoogleAnalyticsJetpackForm { ...myProps } site={ { plan: { product_slug } } } />
				);
				expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
				expect( comp.find( 'UpsellNudge[event="google_analytics_settings"]' ).props().plan ).toBe(
					PLAN_JETPACK_SECURITY_DAILY
				);
			} );
		}
	);
} );
