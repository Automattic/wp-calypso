/**
 * @jest-environment jsdom
 */
jest.mock( 'my-sites/plugins/plugin-action/plugin-action', () => require( './mocks/plugin-action' ) );
jest.mock( 'lib/plugins/actions', () => require( './mocks/actions' ) );
jest.mock( 'matches-selector', () => require( 'component-matches-selector' ), { virtual: true } );
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import mockedActions from './mocks/actions';
import { PluginAutoUpdateToggle } from 'my-sites/plugins/plugin-autoupdate-toggle';

describe( 'PluginAutoupdateToggle', function() {
	const mockedProps = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		translate: spy()
	};

	afterEach( function() {
		mockedActions.togglePluginAutoUpdate.reset();
		mockedProps.recordGoogleEvent.reset();
	} );

	it( 'should render the component', function() {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent.called ).to.equal( true );
		expect( mockedProps.recordTracksEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedActions.togglePluginAutoUpdate.called ).to.equal( true );
	} );
} );
