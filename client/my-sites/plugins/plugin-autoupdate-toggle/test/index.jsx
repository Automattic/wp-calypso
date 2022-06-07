/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PluginAutoUpdateToggle } from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () => ( { action } ) => (
	<input type="checkbox" onClick={ action } />
) );

describe( 'PluginAutoupdateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: jest.fn(),
		recordTracksEvent: jest.fn(),
		removePluginStatuses: jest.fn(),
		translate: jest.fn(),
		togglePluginAutoUpdate: jest.fn(),
	};

	test( 'should register an event when the subcomponent action is executed', async () => {
		render( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		const box = screen.getByRole( 'checkbox' );
		await userEvent.click( box );

		expect( mockedProps.recordGoogleEvent ).toHaveBeenCalled();
		expect( mockedProps.recordTracksEvent ).toHaveBeenCalled();
	} );

	test( 'should call an action when the subcomponent action is executed', async () => {
		render( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		const box = screen.getByRole( 'checkbox' );
		await userEvent.click( box );

		expect( mockedProps.togglePluginAutoUpdate ).toHaveBeenCalled();
	} );
} );
