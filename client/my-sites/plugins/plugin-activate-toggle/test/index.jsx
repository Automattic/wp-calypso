/**
 * External dependencies
 */
import { expect } from 'chai';
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
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy()
	};
	let PluginActivateToggle;

	useFakeDom();
	useMockery();

	before( function() {
		mockery.registerMock( 'my-sites/plugins/plugin-action/plugin-action', mockedPluginAction );
		mockery.registerMock( 'lib/plugins/actions', mockedActions );
		mockery.registerMock( 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button', EmptyComponent );

		PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' ).PluginActivateToggle;
	} );

	afterEach( function() {
		mockedActions.togglePluginActivation.reset();
		analyticsMock.recordGoogleEvent.reset();
	} );

	it( 'should render the component', function() {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( analyticsMock.recordGoogleEvent.called ).to.equal( true );
		expect( analyticsMock.recordTracksEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginActivation.called ).to.equal( true );
	} );
} );
