/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/translator-jumpstart', () => ( {} ) );
jest.mock( 'lib/plugins/wporg-data/actions', () => ( {} ) );
jest.mock( 'lib/plugins/wporg-data/list-store', () => ( {
	getShortList: () => {},
	getFullList: () => {},
	getSearchList: () => {},
	on: () => {},
} ) );
jest.mock( 'state/ui/guided-tours/selectors', () => ( {} ) );
jest.mock( 'my-sites/plugins/utils', () => ( {
	getExtensionSettingsPath: () => '',
} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'layout/guided-tours/positioning', () => 'Positioning' );
jest.mock( 'layout/guided-tours/tours/main-tour', () => 'MainTour' );
jest.mock( 'layout/guided-tours/tours/jetpack-basic-tour', () => 'JetpackBasicTour' );
jest.mock( 'layout/masterbar/logged-in', () => 'LoggedIn' );
jest.mock( 'layout/community-translator/launcher', () => 'Launcher' );
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
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { PluginMeta } from '../';

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
	plugin: { active: false },
	selectedSiteId: 123,
	translate: x => x,
};

describe( 'PluginMeta basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <PluginMeta { ...props } /> );
		expect( comp.find( '.plugin-meta' ).length ).toBe( 1 );
	} );
	test( 'should show upgrade nudge when appropriate', () => {
		const comp = shallow( <PluginMeta { ...props } selectedSiteId={ 12 } /> );
		expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
			1
		);
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
		expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
			0
		);
	} );
	test( 'should not show upgrade nudge if jetpack site', () => {
		const comp = shallow(
			<PluginMeta { ...props } selectedSite={ { ...selectedSite, jetpack: true } } />
		);
		expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
			0
		);
	} );
	test( 'should not show upgrade nudge has business plan', () => {
		const comp = shallow(
			<PluginMeta
				{ ...props }
				selectedSite={ { ...selectedSite, plan: { product_slug: PLAN_BUSINESS } } }
			/>
		);
		expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
			0
		);
	} );
} );

describe( 'Upsell Banner should get appropriate plan constant', () => {
	const myProps = {
		...props,
		showUpgradeNudge: true,
		isJetpackSite: false,
		hasBusinessPlan: false,
	};

	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( product_slug => {
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
			expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
				1
			);
			expect(
				comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).props().plan
			).toBe( PLAN_BUSINESS );
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( product_slug => {
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
			expect( comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).length ).toBe(
				1
			);
			expect(
				comp.find( 'Banner[event="calypso_plugin_detail_page_upgrade_nudge"]' ).props().plan
			).toBe( PLAN_BUSINESS_2_YEARS );
		} );
	} );
} );
