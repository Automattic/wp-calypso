/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PluginAutoUpdateToggle } from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import fixtures from './fixtures';

vi.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () => ( {
	default: ( { action } ) => <input type="checkbox" onClick={ action } />,
} ) );

describe( 'PluginAutoupdateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: vi.fn(),
		recordTracksEvent: vi.fn(),
		removePluginStatuses: vi.fn(),
		translate: vi.fn(),
		togglePluginAutoUpdate: vi.fn(),
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
