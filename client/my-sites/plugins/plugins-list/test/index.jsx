/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PluginsList } from '..';
import { sites } from './fixtures';

describe( 'PluginsList', () => {
	describe( 'rendering bulk actions', () => {
		let renderedPluginsList;
		let plugins;
		let props;

		beforeAll( () => {
			plugins = [
				{ sites, slug: 'hello', name: 'Hello Dolly' },
				{ sites, slug: 'jetpack', name: 'Jetpack' },
			];

			props = {
				plugins,
				header: 'Plugins',
				selectedSite: sites[ 0 ],
				selectedSiteId: sites[ 0 ].ID,
				isPlaceholder: false,
				pluginUpdateCount: plugins.length,
				inProgressStatuses: [],
			};
		} );

		beforeEach( () => {
			renderedPluginsList = shallow( <PluginsList { ...props } /> );
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
