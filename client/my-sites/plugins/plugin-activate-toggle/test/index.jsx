/**
 * @jest-environment jsdom
 */
jest.mock( 'my-sites/plugins/plugin-action/plugin-action', () => require( './mocks/plugin-action' ) );
jest.mock( 'lib/plugins/actions', () => require( './mocks/actions' ) );
jest.mock(
	'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button',
	() => require( 'components/empty-component' )
);

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import mockedActions from './mocks/actions';
import { PluginActivateToggle } from 'my-sites/plugins/plugin-activate-toggle';

describe( 'PluginActivateToggle', function() {
	const analyticsMock = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy()
	};

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
