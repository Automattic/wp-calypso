/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PluginActivateToggle } from 'calypso/my-sites/plugins/plugin-activate-toggle';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () => ( { action } ) => (
	<input type="checkbox" onClick={ action } />
) );

describe( 'PluginActivateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: jest.fn(),
		recordTracksEvent: jest.fn(),
		removePluginStatuses: jest.fn(),
		togglePluginActivation: jest.fn(),
		translate: jest.fn(),
	};

	test( 'should register an event when the subcomponent action is executed', async () => {
		render( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		const box = screen.getByRole( 'checkbox' );
		await userEvent.click( box );

		expect( mockedProps.recordGoogleEvent ).toHaveBeenCalled();
		expect( mockedProps.recordTracksEvent ).toHaveBeenCalled();
	} );

	test( 'should call an action when the subcomponent action is executed', async () => {
		render( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		const box = screen.getByRole( 'checkbox' );
		await userEvent.click( box );

		expect( mockedProps.togglePluginActivation ).toHaveBeenCalled();
	} );
} );
