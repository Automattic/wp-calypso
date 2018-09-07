/**
 * @format
 * @jest-environment jsdom
 */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'components/banner', () => 'Banner' );
jest.mock( 'components/notice', () => 'Notice' );
jest.mock( 'components/notice/notice-action', () => 'NoticeAction' );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

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
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { GoogleAnalyticsForm } from '../form-analytics';

const props = {
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: x => x,
	onChangeField: x => x,
	eventTracker: x => x,
	uniqueEventTracker: x => x,
	fields: {},
};

describe( 'GoogleAnalyticsForm basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <GoogleAnalyticsForm { ...props } /> );
		expect( comp.find( '#analytics' ) ).toHaveLength( 1 );
	} );
	test( 'should not show upgrade nudge if disabled', () => {
		const comp = shallow( <GoogleAnalyticsForm { ...props } showUpgradeNudge={ false } /> );
		expect( comp.find( 'Banner[event="google_analytics_settings"]' ) ).toHaveLength( 0 );
	} );
} );

describe( 'Upsell Banner should get appropriate plan constant', () => {
	const myProps = {
		...props,
		showUpgradeNudge: true,
	};

	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( product_slug => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = shallow(
				<GoogleAnalyticsForm
					{ ...myProps }
					siteIsJetpack={ false }
					site={ { plan: { product_slug } } }
				/>
			);
			expect( comp.find( 'Banner[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
			expect( comp.find( 'Banner[event="google_analytics_settings"]' ).props().plan ).toBe(
				PLAN_BUSINESS
			);
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( product_slug => {
		test( `Business 2 year for (${ product_slug })`, () => {
			const comp = shallow(
				<GoogleAnalyticsForm
					{ ...myProps }
					siteIsJetpack={ false }
					site={ { plan: { product_slug } } }
				/>
			);
			expect( comp.find( 'Banner[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
			expect( comp.find( 'Banner[event="google_analytics_settings"]' ).props().plan ).toBe(
				PLAN_BUSINESS_2_YEARS
			);
		} );
	} );

	[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ].forEach(
		product_slug => {
			test( `Jetpack Premium for (${ product_slug })`, () => {
				const comp = shallow(
					<GoogleAnalyticsForm
						{ ...myProps }
						siteIsJetpack={ true }
						site={ { plan: { product_slug } } }
					/>
				);
				expect( comp.find( 'Banner[event="google_analytics_settings"]' ) ).toHaveLength( 1 );
				expect( comp.find( 'Banner[event="google_analytics_settings"]' ).props().plan ).toBe(
					PLAN_JETPACK_PREMIUM
				);
			} );
		}
	);
} );
