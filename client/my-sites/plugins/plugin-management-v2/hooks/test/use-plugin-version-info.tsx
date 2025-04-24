/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { plugin as plugin1, site as site1 } from '../../test/utils/constants';
import usePluginVersionInfo from '../use-plugin-version-info';
import type { PluginComponentProps } from '../../types';

describe( 'usePluginVersionInfo', () => {
	const plugin2 = {
		...plugin1,
		version: '12.7',
	};

	const site2 = {
		...site1,
		ID: 123456,
	};

	const initialState = {
		sites: { items: { [ site1.ID ]: site1, [ site2.ID ]: site2 } },
		currentUser: {
			capabilities: {},
		},
		plugins: {
			installed: {
				isRequesting: {},
				isRequestingAll: false,
				plugins: {
					[ `${ site1.ID }` ]: [ plugin1 ],
					[ `${ site2.ID }` ]: [ plugin2 ],
				},
			},
		},
	};

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'should return the correct versions range and updated versions when the plugin is installed on many sites', () => {
		// We don't need all the properties of the plugin, just the ones we use in the hook
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const pluginWithSites = {
			...plugin1,
			sites: {
				[ site1.ID ]: {
					active: true,
					autoupdate: true,
					version: '1.23',
				},
				[ site2.ID ]: {
					active: true,
					autoupdate: true,
					version: '1.23',
				},
			},
		} as PluginComponentProps;

		const { result } = renderHook( () => usePluginVersionInfo( pluginWithSites ), {
			wrapper,
		} );

		expect( result.current.currentVersionsRange ).toEqual( {
			min: '11.3',
			max: '12.7',
		} );
		expect( result.current.updatedVersions ).toEqual( [ '11.5', '11.5' ] );
		expect( result.current.hasUpdate ).toEqual( true );
	} );

	it( 'should return the correct versions range and updated versions when the plugin is installed on one site', () => {
		// We don't need all the properties of the plugin, just the ones we use in the hook
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const { result } = renderHook( () => usePluginVersionInfo( plugin2 ), {
			wrapper,
		} );

		expect( result.current.currentVersionsRange ).toEqual( {
			min: '11.3',
			max: null,
		} );
		expect( result.current.updatedVersions ).toEqual( [ '11.5' ] );
		expect( result.current.hasUpdate ).toEqual( true );
	} );
} );
