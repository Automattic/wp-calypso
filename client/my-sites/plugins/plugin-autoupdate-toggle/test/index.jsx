/**
 * External dependencies
 */
import { expect } from 'chai';
import identity from 'lodash/identity';
import mockery from 'mockery';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

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
		mockery.registerMock( 'lib/analytics', analyticsMock );
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
		const wrapper = mount( <PluginAutoupdateToggle { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoupdateToggle { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( analyticsMock.ga.recordEvent.called ).to.equal( true );
		expect( analyticsMock.tracks.recordEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoupdateToggle { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginAutoUpdate.called ).to.equal( true );
	} );
} );
