/**
 * @jest-environment jsdom
 */

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
import { PluginActivateToggle } from 'calypso/my-sites/plugins/plugin-activate-toggle';

jest.mock( 'my-sites/plugins/plugin-action/plugin-action', () =>
	require( './mocks/plugin-action' )
);
jest.mock( 'lib/plugins/actions', () => require( './mocks/actions' ) );

describe( 'PluginActivateToggle', () => {
	const analyticsMock = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy(),
	};

	afterEach( () => {
		mockedActions.togglePluginActivation.resetHistory();
		analyticsMock.recordGoogleEvent.resetHistory();
	} );

	test( 'should render the component', () => {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	test( 'should register an event when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( analyticsMock.recordGoogleEvent.called ).to.equal( true );
		expect( analyticsMock.recordTracksEvent.called ).to.equal( true );
	} );

	test( 'should call an action when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...analyticsMock } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginActivation.called ).to.equal( true );
	} );
} );
