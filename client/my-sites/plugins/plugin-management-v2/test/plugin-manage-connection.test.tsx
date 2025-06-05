/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PluginManageConnection from '../plugin-manage-connection';
import { site, plugin } from './utils/constants';

const props = {
	site,
	plugin,
};

describe( '<PluginManageConnection>', () => {
	const mockStore = configureStore();
	const store = mockStore( {} );

	test( 'should render correctly and return null', () => {
		const { container } = render(
			<Provider store={ store }>
				<PluginManageConnection { ...props } />
			</Provider>
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render correctly and show manage connection', () => {
		plugin.slug = 'jetpack';
		const { container } = render(
			<Provider store={ store }>
				<PluginManageConnection { ...props } />
			</Provider>
		);

		const [ manageConnection ] = container.getElementsByClassName(
			'plugin-management-v2__actions'
		);
		expect( manageConnection ).toHaveProperty(
			'href',
			`https://example.com/settings/manage-connection/${ site.slug }`
		);
	} );
} );
