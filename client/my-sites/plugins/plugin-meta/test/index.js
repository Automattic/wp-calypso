/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { PluginMeta } from '../';
import {
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
} from '@automattic/calypso-products';

jest.mock( 'calypso/lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/lib/translator-jumpstart', () => ( {} ) );
jest.mock( 'calypso/state/guided-tours/selectors', () => ( {} ) );
jest.mock( 'calypso/my-sites/plugins/utils', () => ( {
	getExtensionSettingsPath: () => '',
} ) );
jest.mock( 'calypso/layout/guided-tours/positioning', () => 'Positioning' );
jest.mock( 'calypso/layout/guided-tours/tours/main-tour', () => 'MainTour' );
jest.mock( 'calypso/layout/masterbar/logged-in', () => 'LoggedIn' );
jest.mock( 'calypso/layout/community-translator/launcher', () => 'Launcher' );
jest.mock( 'calypso/blocks/upsell-nudge', () => 'UpsellNudge' );
jest.mock( 'calypso/components/notice', () => 'Notice' );
jest.mock( 'calypso/components/notice/notice-action', () => 'NoticeAction' );

const selectedSite = {
	plan: {
		product_slug: PLAN_FREE,
	},
	options: {
		software_version: 2,
	},
};

const props = {
	selectedSite,
	sites: [ [ {} ] ],
	pluginsOnSites: {
		sites: {},
	},
	plugin: { active: false },
	selectedSiteId: 123,
	translate: ( x ) => x,
};

describe( 'PluginMeta basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <PluginMeta { ...props } /> );
		expect( comp.find( '.plugin-meta' ) ).toHaveLength( 1 );
	} );
	test( 'should show upgrade nudge when appropriate', () => {
		const comp = shallow( <PluginMeta { ...props } selectedSiteId={ 12 } /> );
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 1 );
	} );
	test( 'should not show upgrade nudge if no site is selected', () => {
		const comp = shallow(
			<PluginMeta
				{ ...props }
				selectedSite={ null }
				isJetpackSite={ false }
				hasBusinessPlan={ false }
			/>
		);
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 0 );
	} );
	test( 'should not show upgrade nudge if jetpack site', () => {
		const comp = shallow(
			<PluginMeta { ...props } selectedSite={ { ...selectedSite, jetpack: true } } />
		);
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 0 );
	} );
	test( 'should not show upgrade nudge has business plan', () => {
		const comp = shallow(
			<PluginMeta
				{ ...props }
				selectedSite={ { ...selectedSite, plan: { product_slug: PLAN_BUSINESS } } }
			/>
		);
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 0 );
	} );
	test( 'should not show upgrade nudge has monthly business plan', () => {
		const comp = shallow(
			<PluginMeta
				{ ...props }
				selectedSite={ { ...selectedSite, plan: { product_slug: PLAN_BUSINESS_MONTHLY } } }
			/>
		);
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 0 );
	} );
	test( 'should not show upgrade nudge has ecommerce plan', () => {
		const comp = shallow(
			<PluginMeta
				{ ...props }
				selectedSite={ { ...selectedSite, plan: { product_slug: PLAN_ECOMMERCE } } }
			/>
		);
		expect(
			comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
		).toHaveLength( 0 );
	} );
} );

describe( 'Upsell Nudge should get appropriate plan constant', () => {
	const myProps = {
		...props,
		showUpgradeNudge: true,
		isJetpackSite: false,
		hasBusinessPlan: false,
	};

	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( product_slug ) => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = shallow(
				<PluginMeta
					{ ...myProps }
					selectedSite={ {
						...selectedSite,
						plan: { product_slug },
					} }
				/>
			);
			expect(
				comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
			).toHaveLength( 1 );
			expect(
				comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' ).props().plan
			).toBe( PLAN_BUSINESS );
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach(
		( product_slug ) => {
			test( `Business 2 year for (${ product_slug })`, () => {
				const comp = shallow(
					<PluginMeta
						{ ...myProps }
						selectedSite={ {
							...selectedSite,
							plan: { product_slug },
						} }
					/>
				);
				expect(
					comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' )
				).toHaveLength( 1 );
				expect(
					comp.find( 'UpsellNudge[event="calypso_plugin_detail_page_upgrade_nudge"]' ).props().plan
				).toBe( PLAN_BUSINESS_2_YEARS );
			} );
		}
	);
} );
