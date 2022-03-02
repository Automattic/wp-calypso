/** @jest-environment jsdom */

jest.mock( 'react-query', () => ( {
	useQuery: () => [],
} ) );
jest.mock( 'calypso/lib/wporg', () => ( {
	getWporgLocaleCode: () => 'it_US',
	fetchPluginsList: () => Promise.resolve( [] ),
} ) );
jest.mock( 'calypso/lib/url-search', () => ( Component ) => ( props ) => (
	<Component { ...props } doSearch={ jest.fn() } />
) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/blocks/upsell-nudge', () => 'upsell-nudge' );

let mockPlugins = [];
jest.mock( 'calypso/data/marketplace/use-wporg-plugin-query', () => ( {
	useWPORGPlugins: jest.fn( () => ( { data: { plugins: mockPlugins } } ) ),
} ) );

jest.mock( '@automattic/languages', () => [
	{
		value: 1,
		langSlug: 'it',
		name: 'Italian English',
		wpLocale: 'it_US',
		popular: 1,
		territories: [ '019' ],
	},
] );

import {
	PLAN_FREE,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import { mount } from 'enzyme';
import { merge } from 'lodash';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import PluginsBrowser from '../';

window.__i18n_text_domain__ = JSON.stringify( 'default' );
const initialReduxState = {
	plugins: {
		wporg: {
			lists: {},
			fetchingLists: {},
		},
		installed: {
			isRequesting: {},
			plugins: {},
			status: {},
		},
	},
	ui: { selectedSiteId: 1 },
	sites: {
		items: { 1: { ID: 1, title: 'Test Site', plan: { productSlug: PLAN_FREE } } },
		connection: { items: { 1: true } },
	},
	currentUser: { capabilities: { 1: { manage_options: true } } },
	media: {
		queries: {
			'[]': {
				itemKeys: [ 1 ],
				found: 1,
			},
		},
	},
	documentHead: {},
	preferences: { remoteValues: {} },
	productsList: {},
	marketplace: {
		billingInterval: {
			interval: IntervalLength.MONTHLY,
		},
	},
};

function mountWithRedux( ui, overrideState ) {
	const store = createStore(
		( state ) => state,
		merge( initialReduxState, overrideState ),
		applyMiddleware( thunkMiddleware )
	);
	return mount( <Provider store={ store }>{ ui }</Provider> );
}

describe( 'Search view', () => {
	const myProps = {
		search: 'searchterm',
	};

	test( 'should show NoResults when there are no results', () => {
		const comp = mountWithRedux( <PluginsBrowser { ...myProps } /> );
		expect( comp.find( 'NoResults' ).length ).toBe( 1 );
	} );
	test( 'should show plugin list when there are results', () => {
		mockPlugins = [ {} ];
		const comp = mountWithRedux( <PluginsBrowser { ...myProps } /> );
		expect( comp.find( 'PluginsBrowserList' ).length ).toBe( 1 );
	} );
} );

describe( 'Upsell Nudge should get appropriate plan constant', () => {
	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( product_slug ) => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = mountWithRedux( <PluginsBrowser />, {
				sites: { items: { 1: { jetpack: false, plan: { product_slug } } } },
			} );
			expect(
				comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
			).toBe( 1 );
			expect(
				comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).props().plan
			).toBe( PLAN_WPCOM_PRO );
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach(
		( product_slug ) => {
			test( `Business 2 year for (${ product_slug })`, () => {
				const comp = mountWithRedux( <PluginsBrowser />, {
					sites: { items: { 1: { jetpack: false, plan: { product_slug } } } },
				} );
				expect(
					comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
				).toBe( 1 );
				expect(
					comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).props().plan
				).toBe( PLAN_BUSINESS_2_YEARS );
			} );
		}
	);
} );

describe( 'PluginsBrowser basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = mountWithRedux( <PluginsBrowser /> );
		expect( comp.find( 'main' ).length ).toBe( 1 );
	} );
	test( 'should show upsell nudge when appropriate', () => {
		const comp = mountWithRedux( <PluginsBrowser /> );
		expect(
			comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
		).toBe( 1 );
	} );
	test( 'should not show upsell nudge if no site is selected', () => {
		const comp = mountWithRedux( <PluginsBrowser />, { ui: { selectedSiteId: null } } );
		expect(
			comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
		).toBe( 0 );
	} );
	test( 'should not show upsell nudge if no sitePlan', () => {
		const comp = mountWithRedux( <PluginsBrowser />, {
			ui: { selectedSiteId: 10 },
			sites: { items: { 10: { ID: 10, plan: null } } },
		} );
		expect(
			comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
		).toBe( 0 );
	} );
	test( 'should not show upsell nudge if non-atomic jetpack site', () => {
		const comp = mountWithRedux( <PluginsBrowser />, {
			sites: { items: { 1: { jetpack: true } } },
		} );
		expect(
			comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
		).toBe( 0 );
	} );
	test( 'should not show upsell nudge has business plan', () => {
		const comp = mountWithRedux( <PluginsBrowser />, {
			sites: { items: { 1: { jetpack: true, plan: { productSlug: PLAN_PREMIUM } } } },
		} );
		expect(
			comp.find( 'upsell-nudge[event="calypso_plugins_browser_upgrade_nudge"]' ).length
		).toBe( 0 );
	} );
	test( 'should show notice if site is not connected to wpcom', () => {
		const comp = mountWithRedux( <PluginsBrowser />, {
			ui: { selectedSiteId: 1 },
			sites: {
				items: { 1: { jetpack: false } },
				connection: { items: { 1: false } },
			},
		} );
		expect( comp.containsMatchingElement( <span>I’d like to fix this now</span> ) ).toBeTruthy();
	} );
} );
