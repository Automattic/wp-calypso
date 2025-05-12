/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import PluginActionStatus from '../plugin-action-status';
import { plugin, site } from './utils/constants';

const currentStatus = {
	action: ACTIVATE_PLUGIN,
	pluginId: plugin.id,
	siteId: site.ID,
	status: 'inProgress',
};

const props = {
	currentSiteStatuses: [ currentStatus ],
	selectedSite: site,
};

describe( '<PluginActionStatus>', () => {
	const mockStore = configureStore();
	const store = mockStore( {} );

	test( 'should render correctly and show activating status on single-site', () => {
		const { container } = render(
			<Provider store={ store }>
				<PluginActionStatus { ...props } />
			</Provider>
		);

		const [ status ] = container.getElementsByClassName( 'plugin-action-status' );
		expect( status.textContent ).toEqual( 'Activating' );
	} );

	test( 'should render correctly and show removing status on single-site', () => {
		currentStatus.action = REMOVE_PLUGIN;
		const { container } = render(
			<Provider store={ store }>
				<PluginActionStatus { ...props } />
			</Provider>
		);

		const [ status ] = container.getElementsByClassName( 'plugin-action-status' );
		expect( status.textContent ).toEqual( 'Removing Plugin' );
	} );

	test( 'should render correctly and show deactivated status on single-site', () => {
		currentStatus.action = DEACTIVATE_PLUGIN;
		currentStatus.status = 'completed';
		const { container } = render(
			<Provider store={ store }>
				<PluginActionStatus { ...props } />
			</Provider>
		);
		const [ status ] = container.getElementsByClassName( 'plugin-action-status' );
		expect( status.textContent ).toEqual( 'Deactivated' );
	} );

	test( 'should render correctly and show failed to enable auto-update status on multi-site(1 site)', () => {
		const props = { currentSiteStatuses: [ currentStatus ] };
		currentStatus.action = ENABLE_AUTOUPDATE_PLUGIN;
		currentStatus.status = 'error';
		const { container } = render(
			<Provider store={ store }>
				<PluginActionStatus { ...props } />
			</Provider>
		);
		const [ status ] = container.getElementsByClassName( 'plugin-action-status' );
		expect( status.textContent ).toEqual( 'Failed to enable auto-updates on 1 site' );
	} );

	test( 'should render correctly and show failed to enable auto-update status on multi-site(2 sites)', () => {
		const props = { currentSiteStatuses: [ currentStatus, currentStatus ] };
		currentStatus.action = DISABLE_AUTOUPDATE_PLUGIN;
		const { container } = render(
			<Provider store={ store }>
				<PluginActionStatus { ...props } />
			</Provider>
		);
		const [ status ] = container.getElementsByClassName( 'plugin-action-status' );
		expect( status.textContent ).toEqual( 'Failed to disable auto-updates on 2 sites' );
	} );
} );
