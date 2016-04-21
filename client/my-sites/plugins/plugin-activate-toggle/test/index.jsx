/**
 * External dependencies
 */
import { expect } from 'chai';
import identity from 'lodash/identity';
import mockery from 'mockery';
import { mount } from 'enzyme';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import fixtures from './fixtures';
import mockedActions from './mocks/actions';
import mockedPluginAction from './mocks/plugin-action';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginActivateToggle', function() {
	const analyticsMock = {
		ga: { recordEvent: spy() },
		tracks: { recordEvent: spy() }
	};
	let PluginActivateToggle;

	useFakeDom();
	useMockery();

	before( function() {
		mockery.registerMock( 'lib/analytics', analyticsMock );
		mockery.registerMock( 'my-sites/plugins/plugin-action/plugin-action', mockedPluginAction );
		mockery.registerMock( 'lib/plugins/actions', mockedActions );
		mockery.registerMock( 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button', EmptyComponent );

		PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' );
		PluginActivateToggle.prototype.translate = identity;
	} );

	afterEach( function() {
		mockedActions.togglePluginActivation.reset();
		analyticsMock.ga.recordEvent.reset();
	} );

	it( 'should render the component', function() {
		const wrapper = mount( <PluginActivateToggle { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginActivateToggle { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( analyticsMock.ga.recordEvent.called ).to.equal( true );
		expect( analyticsMock.tracks.recordEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginActivateToggle { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginActivation.called ).to.equal( true );
	} );
} );
