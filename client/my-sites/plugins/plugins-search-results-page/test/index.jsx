/** @jest-environment jsdom */

jest.mock( 'page' );
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
	useWPORGInfinitePlugins: jest.fn( () => ( {
		data: { plugins: mockPlugins },
		fetchNextPage: jest.fn(),
	} ) ),
} ) );

jest.mock( 'calypso/data/marketplace/use-es-query', () => ( {
	useSiteSearchPlugins: jest.fn( () => ( {
		data: { plugins: mockPlugins },
		fetchNextPage: jest.fn(),
	} ) ),
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

import { PLAN_FREE } from '@automattic/calypso-products';
import { mount } from 'enzyme';
import { merge } from 'lodash';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import PluginsSearchResultsPage from '../';

window.__i18n_text_domain__ = JSON.stringify( 'default' );
window.IntersectionObserver = jest.fn( () => ( { observe: jest.fn(), disconnect: jest.fn() } ) );

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
		const comp = mountWithRedux( <PluginsSearchResultsPage { ...myProps } /> );
		expect( comp.find( 'NoResults' ).length ).toBe( 1 );
	} );

	test( 'should show plugin list when there are results', () => {
		mockPlugins = [ {} ];
		const comp = mountWithRedux( <PluginsSearchResultsPage { ...myProps } /> );
		expect( comp.find( 'PluginsBrowserList' ).length ).toBe( 1 );
	} );
} );
