/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { PluginsList } from '..';
import { sites } from './fixtures';
import { createReduxStore } from 'state';

jest.mock( 'lib/analytics/ga', () => ( {
	recordEvent: () => {},
} ) );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
	} ),
} ) );
jest.mock( 'my-sites/plugins/plugin-item/plugin-item', () =>
	require( 'components/empty-component' )
);
jest.mock( 'my-sites/plugins/plugin-list-header', () => require( 'components/empty-component' ) );

describe( 'PluginsList', () => {
	describe( 'rendering bulk actions', () => {
		let renderedPluginsList, plugins, props;

		beforeAll( () => {
			plugins = [
				{ sites, slug: 'hello', name: 'Hello Dolly' },
				{ sites, slug: 'jetpack', name: 'Jetpack' },
			];

			props = {
				plugins,
				header: 'Plugins',
				selectedSite: sites[ 0 ],
				isPlaceholder: false,
				pluginUpdateCount: plugins.length,
			};
		} );

		beforeEach( () => {
			renderedPluginsList = mount( <PluginsList { ...props } />, {
				wrappingComponent: Provider,
				wrappingComponentProps: { store: createReduxStore() },
			} );
		} );

		test( 'should be intialized with no selectedPlugins', () => {
			expect( renderedPluginsList.state().selectedPlugins ).toEqual( {} );
		} );

		test( 'should select all plugins when toggled on', () => {
			renderedPluginsList.instance().toggleBulkManagement();
			expect( renderedPluginsList.state().selectedPlugins ).toEqual( {
				hello: expect.anything(),
				jetpack: expect.anything(),
			} );
		} );

		test( 'should always reset to all selected when toggled on', () => {
			renderedPluginsList.instance().togglePlugin( plugins[ 0 ] );
			expect( Object.keys( renderedPluginsList.state().selectedPlugins ) ).toHaveLength( 1 );

			renderedPluginsList.instance().toggleBulkManagement();
			expect( renderedPluginsList.state().selectedPlugins ).toEqual( {
				hello: expect.anything(),
				jetpack: expect.anything(),
			} );
		} );
	} );
} );
