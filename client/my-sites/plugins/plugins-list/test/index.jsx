/** @jest-environment jsdom */
jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {}
	}
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {}
	} )
} ) );
jest.mock( 'my-sites/plugins/plugin-item/plugin-item', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/plugins/plugin-list-header', () => require( 'components/empty-component' ) );
jest.mock( 'matches-selector', () => require( 'component-matches-selector' ), { virtual: true } );
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { Provider as ReduxProvider } from 'react-redux';
import React from 'react';
import {
	renderIntoDocument as testRenderer,
	scryRenderedComponentsWithType
} from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import { PluginsList } from '../';
import { sites } from './fixtures';

describe( 'PluginsList', () => {
	before( () => {
		const ReactClass = require( 'react/lib/ReactClass' );

		ReactClass.injection.injectMixin( require( 'i18n-calypso' ).mixin );
	} );

	describe( 'rendering bulk actions', function() {
		let renderedPluginsList, plugins, props;

		before( () => {
			plugins = [
				{ sites, slug: 'hello', name: 'Hello Dolly' },
				{ sites, slug: 'jetpack', name: 'Jetpack' } ];

			props = {
				plugins,
				header: 'Plugins',
				selectedSite: sites[ 0 ],
				isPlaceholder: false,
				pluginUpdateCount: plugins.length
			};
		} );

		beforeEach( () => {
			renderedPluginsList = testRenderer(
				<ReduxProvider store={ createReduxStore() }>
					<PluginsList { ...props } />
				</ReduxProvider>
			);
			renderedPluginsList = scryRenderedComponentsWithType( renderedPluginsList, PluginsList )[ 0 ];
		} );

		it( 'should be intialized with no selectedPlugins', () => {
			expect( renderedPluginsList.state.selectedPlugins ).to.be.empty;
		} );

		it( 'should select all plugins when toggled on', () => {
			renderedPluginsList.toggleBulkManagement();
			expect( renderedPluginsList.state.selectedPlugins ).to.contain.all.keys( 'hello', 'jetpack' );
			expect( Object.keys( renderedPluginsList.state.selectedPlugins ) ).to.have.lengthOf( 2 );
		} );

		it( 'should always reset to all selected when toggled on', () => {
			renderedPluginsList.togglePlugin( plugins[ 0 ] );
			expect( Object.keys( renderedPluginsList.state.selectedPlugins ) ).to.have.lengthOf( 1 );

			renderedPluginsList.toggleBulkManagement();
			expect( renderedPluginsList.state.selectedPlugins ).to.contain.all.keys( 'hello', 'jetpack' );
			expect( Object.keys( renderedPluginsList.state.selectedPlugins ) ).to.have.lengthOf( 2 );
		} );
	} );
} );
