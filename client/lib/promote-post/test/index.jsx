/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { PromoteWidgetStatus, usePromoteWidget } from '../';

const sites = [];
sites[ 1 ] = {
	ID: 1,
	URL: 'example.wordpress.com',
	plan: {
		product_slug: 'free_plan',
	},
	options: {},
};

const initialState = {
	sites: {
		items: sites,
		domains: {
			items: [ 'example.wordpress.com' ],
		},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
};

describe( 'index', () => {
	test( 'Should be fetching when undefined', async () => {
		function Blaze() {
			const canUseBlaze = usePromoteWidget();
			expect( canUseBlaze ).toBe( PromoteWidgetStatus.FETCHING );
			return <div />;
		}

		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<Blaze />
			</Provider>
		);
	} );

	test( 'Should dissalow Blaze usage', async () => {
		function Blaze() {
			const canUseBlaze = usePromoteWidget();
			expect( canUseBlaze ).toBe( PromoteWidgetStatus.DISABLED );
			return <div />;
		}

		initialState.sites.items[ 1 ].options.has_promote_widget = false;

		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<Blaze />
			</Provider>
		);
	} );

	test( 'Should allow Blaze usage', async () => {
		function Blaze() {
			const canUseBlaze = usePromoteWidget();
			expect( canUseBlaze ).toBe( PromoteWidgetStatus.ENABLED );
			return <div />;
		}

		initialState.sites.items[ 1 ].options.has_promote_widget = true;

		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<Blaze />
			</Provider>
		);
	} );
} );
