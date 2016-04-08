/**
 * External dependencies
 */
import { expect } from 'chai';
import identity from 'lodash/identity';
import mockery from 'mockery';
import React from 'react';
import ReactDom from 'react-dom';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import mockedActions from './mocks/actions';
import mockedPluginAction from './mocks/plugin-action';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginAutoupdateToggle', function() {
	const analyticsMock = {
		ga: { recordEvent: sinon.spy() },
		tracks: { recordEvent: sinon.spy() }
	};
	let PluginAutoupdateToggle;

	useFakeDom();
	useMockery();

	before( function() {
		mockery.registerMock( 'analytics', analyticsMock );
		mockery.registerMock( 'my-sites/plugins/plugin-action/plugin-action', mockedPluginAction );
		mockery.registerMock( 'lib/plugins/actions', mockedActions );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );

		PluginAutoupdateToggle = require( 'my-sites/plugins/plugin-autoupdate-toggle' );
		PluginAutoupdateToggle.prototype.translate = identity;
	} );

	afterEach( function() {
		mockedActions.togglePluginAutoUpdate.reset();
		analyticsMock.ga.recordEvent.reset();
	} );

	it( 'should render the component', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginAutoupdateToggle { ...fixtures } /> ),
			pluginAutoupdateToggle = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action' );
		expect( pluginAutoupdateToggle.length ).to.equal( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginAutoupdateToggle { ...fixtures } /> ),
			pluginAutoupdateToggle = ReactDom.findDOMNode( rendered );

		TestUtils.Simulate.click( pluginAutoupdateToggle );

		expect( analyticsMock.ga.recordEvent.called ).to.equal( true );
		expect( analyticsMock.tracks.recordEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginAutoupdateToggle { ...fixtures } /> ),
			pluginAutoupdateToggle = ReactDom.findDOMNode( rendered );

		TestUtils.Simulate.click( pluginAutoupdateToggle );

		expect( mockedActions.togglePluginAutoUpdate.called ).to.equal( true );
	} );
} );
