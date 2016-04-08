/**
 * External dependencies
 */
import assert from 'assert';
import mockery from 'mockery';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginAction', function() {
	let PluginAction;

	useFakeDom();
	useMockery();

	before( () => {
		mockery.registerMock( 'components/info-popover', EmptyComponent );

		PluginAction = require( '../plugin-action' );
	} );

	describe( 'rendering with form toggle', function() {
		it( 'should have plugin-action class', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction /> ),
				pluginAction = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action' );

			assert( 0 < pluginAction.length, 'a plugin action was rendered' );
		} );

		it( 'should render compact form toggle when no children passed', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction /> ),
				formToggle = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'form-toggle' );

			assert( 1 === formToggle.length, 'a form toggle was rendered' );
		} );

		it( 'should render a plugin action label', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction label="hello"><span/></PluginAction> ),
				label = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action__label' );

			assert( 1 === label.length, 'a plugin action label was rendered' );
		} );
	} );

	describe( 'rendering children', function() {
		it( 'should not render a form toggle when children exist', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction><span/></PluginAction> ),
				formToggle = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'form-toggle' );

			assert( 0 === formToggle.length, 'a form toggle was not rendered' );
		} );

		it( 'should render child within plugin-action__children container', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction><span/></PluginAction> ),
				children = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action__children' );

			assert( 1 === children.length, 'a plugin-action__children container was rendered' );
			assert( 'span' === children[ 0 ].props.children.type, 'a span was found within the plugin-action__children container' );
		} );

		it( 'should render a plugin action label', function() {
			var rendered = TestUtils.renderIntoDocument( <PluginAction label="hello"><span/></PluginAction> ),
				label = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action__label' );

			assert( 1 === label.length, 'a plugin action label was rendered' );
		} );
	} );
} );
