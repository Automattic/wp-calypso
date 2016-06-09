/*
 * External dependencies
*/
import { expect } from 'chai';

/*
 * Internal dependencies
*/
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

import { sites } from './fixtures';

describe( 'PluginsList', () => {
	let React, testRenderer, PluginsList, siteListMock;

	useFakeDom();

	useMockery( mockery => {
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );

		let emptyComponent = require( 'test/helpers/react/empty-component' );
		mockery.registerMock( 'my-sites/plugins/plugin-item/plugin-item', emptyComponent );
		mockery.registerMock( 'my-sites/plugins/plugin-list-header', emptyComponent );

		mockery.registerMock( 'lib/sites-list', () => siteListMock );
	} );

	before( () => {
		React = require( 'react' );

		const TestUtils = require( 'react-addons-test-utils' ),
			ReactInjection = require( 'react/lib/ReactInjection' );

		ReactInjection.Class.injectMixin( require( 'i18n-calypso' ).mixin );

		testRenderer = TestUtils.renderIntoDocument;

		siteListMock = { getSelectedSite: () => sites[ 0 ] };
		PluginsList = require( '../' );
	} );

	describe( 'rendering bulk actions', function() {
		let renderedPluginsList, plugins, props;

		before( () => {
			plugins = [
				{sites, slug: 'hello', name: 'Hello Dolly'},
				{sites, slug: 'jetpack', name: 'Jetpack'} ];

			props = {
				plugins,
				header: 'Plugins',
				sites: siteListMock,
				selectedSite: sites[ 0 ],
				isPlaceholder: false,
				pluginUpdateCount: plugins.length
			};
		} );

		beforeEach( () => {
			renderedPluginsList = testRenderer( <PluginsList { ...props } /> );
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
			renderedPluginsList.togglePlugin( plugins[0] );
			expect( Object.keys( renderedPluginsList.state.selectedPlugins ) ).to.have.lengthOf( 1 );

			renderedPluginsList.toggleBulkManagement();
			expect( renderedPluginsList.state.selectedPlugins ).to.contain.all.keys( 'hello', 'jetpack' );
			expect( Object.keys( renderedPluginsList.state.selectedPlugins ) ).to.have.lengthOf( 2 );
		} );
	} );
} );
