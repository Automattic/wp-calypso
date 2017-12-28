/**
 * @format
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
import { PluginAutoUpdateToggle } from 'client/my-sites/plugins/plugin-autoupdate-toggle';

jest.mock( 'my-sites/plugins/plugin-action/plugin-action', () =>
	require( './mocks/plugin-action' )
);
jest.mock( 'lib/plugins/actions', () => require( './mocks/actions' ) );
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );

describe( 'PluginAutoupdateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy(),
	};

	afterEach( () => {
		mockedActions.togglePluginAutoUpdate.reset();
		mockedProps.recordGoogleEvent.reset();
	} );

	test( 'should render the component', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	test( 'should register an event when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent.called ).to.equal( true );
		expect( mockedProps.recordTracksEvent.called ).to.equal( true );
	} );

	test( 'should call an action when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginAutoUpdate.called ).to.equal( true );
	} );
} );
