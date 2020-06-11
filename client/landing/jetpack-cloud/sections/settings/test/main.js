/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import * as hooks from '../hooks';
import { SettingsPage, ConnectionStatus } from '../main';

/**
 * Mocks
 */
jest.mock( '../hooks' );

describe( 'SettingsPage', () => {
	beforeEach( () => {
		jest.spyOn( hooks, 'useSelectedSiteId' ).mockReturnValue( 1 );
	} );

	afterAll( () => {
		jest.restoreAllMocks();
	} );

	test( 'should render as expected', () => {
		jest.spyOn( hooks, 'useRewindState' ).mockReturnValue( { state: 'active' } );

		const wrapper = shallow( <SettingsPage /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render as expected when not connected', () => {
		jest.spyOn( hooks, 'useRewindState' ).mockReturnValue( { state: 'inactive' } );

		const wrapper = shallow( <SettingsPage /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render as expected when not initialized', () => {
		jest.spyOn( hooks, 'useRewindState' ).mockReturnValue( { state: 'uninitialized' } );

		const wrapper = shallow( <SettingsPage /> );

		expect( wrapper ).toMatchSnapshot();
	} );
} );

describe( 'ConnectionStatus', () => {
	test( 'should render as expected', () => {
		const wrapper = shallow( <ConnectionStatus /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render as expected when connected', () => {
		const wrapper = shallow( <ConnectionStatus isConnected /> );

		expect( wrapper ).toMatchSnapshot();
	} );
} );
