/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import mockery from 'mockery';
import { mount } from 'enzyme';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import mockedActions from './mocks/actions';
import mockedPluginAction from './mocks/plugin-action';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginAutoupdateToggle', function() {
	const mockedProps = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy()
	};
	let PluginAutoupdateToggle;

	useFakeDom();
	useMockery();

	before( function() {
		mockery.registerMock( 'my-sites/plugins/plugin-action/plugin-action', mockedPluginAction );
		mockery.registerMock( 'lib/plugins/actions', mockedActions );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );

		PluginAutoupdateToggle = require( 'my-sites/plugins/plugin-autoupdate-toggle' ).PluginAutoUpdateToggle;
	} );

	afterEach( function() {
		mockedActions.togglePluginAutoUpdate.reset();
		mockedProps.recordGoogleEvent.reset();
	} );

	it( 'should render the component', function() {
		const wrapper = mount( <PluginAutoupdateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoupdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent.called ).to.equal( true );
		expect( mockedProps.recordTracksEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoupdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginAutoUpdate.called ).to.equal( true );
	} );
} );
