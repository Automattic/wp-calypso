/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { Provider as ReduxProvider } from 'react-redux';
import ReactClass from 'react/lib/ReactClass';

/**
 * Internal dependencies
 */
import { sites } from './fixtures';
import { createReduxStore } from 'state';
import emptyComponent from 'test/helpers/react/empty-component';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginsList', () => {
	let React, testRenderer, PluginsList, TestUtils;

	useFakeDom();

	useMockery( mockery => {
	    mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );

		mockery.registerMock( 'my-sites/plugins/plugin-item/plugin-item', emptyComponent );
		mockery.registerMock( 'my-sites/plugins/plugin-list-header', emptyComponent );

		mockery.registerMock( 'lib/analytics', { ga: { recordEvent: noop } } );
	} );

	before( () => {
	    React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' );

		ReactClass.injection.injectMixin( require( 'i18n-calypso' ).mixin );

		testRenderer = TestUtils.renderIntoDocument;

		PluginsList = require( '../' ).PluginsList;
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
			renderedPluginsList = TestUtils.scryRenderedComponentsWithType( renderedPluginsList, PluginsList )[ 0 ];
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
