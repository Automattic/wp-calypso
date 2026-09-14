/**
 * @jest-environment jsdom
 */
import { renderHook, cleanup, act, screen } from '@testing-library/react';
import { PluginActions } from '../types';
import useShowPluginActionDialog from '../use-show-plugin-action-dialog';

const HEADING_TEXT = 'Heading';
const MESSAGE_TEXT = 'Message';
const CONFIRM_TEXT = 'OK';
const CANCEL_TEXT = 'Cancel';
jest.mock( '../use-get-dialog-text', () =>
	jest.fn().mockReturnValue( () => ( {
		heading: HEADING_TEXT,
		message: MESSAGE_TEXT,
		cta: {
			confirm: CONFIRM_TEXT,
			cancel: CANCEL_TEXT,
		},
	} ) )
);

// `accept()` mounts each dialog into its own node on document.body — outside
// React Testing Library's tracking, so it's queried with `screen` and won't be
// removed by cleanup(). Its `createRoot` render is async, so opening (and
// closing) the dialog has to run inside act() to flush React's work and avoid
// "update was not wrapped in act(...)" warnings.
const openDialog = async ( action, callback ) => {
	const showPluginActionDialog = renderHook( () => useShowPluginActionDialog() ).result.current;
	await act( async () => {
		showPluginActionDialog( action, [], [], callback );
	} );
};

// Closing the dialog tears it down cleanly so it doesn't leak into later tests.
const clickButton = async ( name ) => {
	await act( async () => {
		screen.getByRole( 'button', { name } ).click();
	} );
};

describe( 'useShowPluginActionDialog', () => {
	afterEach( () => {
		cleanup();
	} );

	it( 'renders a dialog modal', async () => {
		await openDialog( '', () => {} );

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();

		await clickButton( CANCEL_TEXT );
	} );

	it( 'displays the correct message text', async () => {
		await openDialog( '', () => {} );

		// NOTE: Selecting these elements by class is less than ideal,
		// but currently there's no other way to reliably identify them
		expect( screen.getByText( HEADING_TEXT, { selector: 'h1' } ) ).toBeInTheDocument();
		expect( screen.getByText( MESSAGE_TEXT, { selector: 'p' } ) ).toBeInTheDocument();

		await clickButton( CANCEL_TEXT );
	} );

	it( 'applies the `is-scary` class to the accept button if the given action is "remove"', async () => {
		await openDialog( PluginActions.REMOVE, () => {} );

		expect( screen.getByRole( 'button', { name: CONFIRM_TEXT } ).classList ).toContain(
			'is-scary'
		);

		await clickButton( CANCEL_TEXT );
	} );

	it( 'calls the given callback with "true" parameter value when the accept button is clicked', async () => {
		const callback = jest.fn();

		await openDialog( PluginActions.REMOVE, callback );
		await clickButton( CONFIRM_TEXT );

		expect( callback ).toHaveBeenCalledWith( true );
	} );

	it( 'calls the given callback with "false" parameter value when the cancel button is clicked', async () => {
		const callback = jest.fn();

		await openDialog( PluginActions.REMOVE, callback );
		await clickButton( CANCEL_TEXT );

		expect( callback ).toHaveBeenCalledWith( false );
	} );
} );
