/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { PromoteWidgetStatus, showDSP, usePromoteWidget } from '../';
import { getHotjarSiteSettings, mayWeLoadHotJarScript } from '../../analytics/hotjar';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

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

	test( 'Should disallow Blaze usage', async () => {
		function Blaze() {
			const canUseBlaze = usePromoteWidget();
			expect( canUseBlaze ).toBe( PromoteWidgetStatus.DISABLED );
			return <div />;
		}

		initialState.sites.items[ 1 ].options.can_blaze = false;

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

		initialState.sites.items[ 1 ].options.can_blaze = true;

		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<Blaze />
			</Provider>
		);
	} );

	test( 'Should call showDSP with hotjarSiteSettings', async () => {
		global.window.BlazePress = {};
		let mockBlazePressMockCall = null;

		global.window.BlazePress.render = jest.fn( ( args ) => {
			mockBlazePressMockCall = args;
			args.onLoaded();
		} );

		isJetpackCloud.mockReturnValue( true );
		const jetpackCloudEnableReturn = {
			...getHotjarSiteSettings(),
			isEnabled: mayWeLoadHotJarScript(),
		};

		await showDSP( 'example.wordpress.com' );
		expect( mockBlazePressMockCall.hotjarSiteSettings ).toEqual( jetpackCloudEnableReturn );

		isJetpackCloud.mockReturnValue( false );
		const jetpackCloudDisableReturn = {
			...getHotjarSiteSettings(),
			isEnabled: mayWeLoadHotJarScript(),
		};

		await showDSP( 'example.wordpress.com' );
		expect( mockBlazePressMockCall.hotjarSiteSettings ).toEqual( jetpackCloudDisableReturn );

		expect( jetpackCloudEnableReturn ).not.toEqual( jetpackCloudDisableReturn );
	} );
} );
