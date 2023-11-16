/**
 * @jest-environment jsdom
 */
import { render, renderHook } from '@testing-library/react';
import { PluginActions } from '../types';
import useShowPluginActionDialog from '../use-show-plugin-action-dialog';

const HEADING_TEXT = 'Heading';
const MESSAGE_TEXT = 'Message';
jest.mock( '../use-get-dialog-text', () =>
	jest.fn().mockReturnValue( () => ( { heading: HEADING_TEXT, message: MESSAGE_TEXT } ) )
);

const runHook = () => renderHook( () => useShowPluginActionDialog() ).result.current;

describe( 'useShowPluginActionDialog', () => {
	// A new dialog is created every time we call showPluginActionDialog, and
	// JSDOM doesn't clear the page before each test; so, we have to clear the
	// document ourselves.
	beforeEach( () => {
		document.documentElement.innerHTML = '<head></head><body></body>';
	} );

	it( 'renders a dialog modal', () => {
		const showPluginActionDialog = runHook();

		const callback = () => {
			/* Purposely do nothing */
		};
		const result = render( showPluginActionDialog( '', [], [], callback ) );
		expect( result.queryByRole( 'dialog' ) ).toBeInTheDocument();
	} );

	it( 'displays the correct heading and message text', () => {
		const showPluginActionDialog = runHook();

		const callback = () => {
			/* Purposely do nothing */
		};
		const result = render( showPluginActionDialog( '', [], [], callback ) );

		// NOTE: Selecting these elements by class is less than ideal,
		// but currently there's no other way to reliably identify them
		const heading = result.getByText( HEADING_TEXT, { selector: 'div' } );
		expect( heading ).toBeInTheDocument();

		const message = result.getByText( MESSAGE_TEXT, { selector: 'span' } );
		expect( message ).toBeInTheDocument();
	} );

	it( 'applies the `is-scary` class to the accept button if the given action is "remove"', () => {
		const showPluginActionDialog = runHook();

		const callback = () => {
			/* Purposely do nothing */
		};
		const result = render( showPluginActionDialog( PluginActions.REMOVE, [], [], callback ) );
		const button = result.getByRole( 'button', { name: HEADING_TEXT } );
		expect( button.classList ).toContain( 'is-scary' );
	} );

	it( 'calls the given callback with "true" parameter value when the accept button is clicked', () => {
		const showPluginActionDialog = runHook();

		const callback = jest.fn();

		const result = render( showPluginActionDialog( PluginActions.REMOVE, [], [], callback ) );
		const acceptButton = result.getByRole( 'button', { name: HEADING_TEXT } );
		acceptButton.click();

		expect( callback ).toHaveBeenCalledWith( true );
	} );

	it( 'calls the given callback with "false" parameter value when the cancel button is clicked', () => {
		const showPluginActionDialog = runHook();

		const callback = jest.fn();

		const result = render( showPluginActionDialog( PluginActions.REMOVE, [], [], callback ) );
		const cancelButton = result.getByRole( 'button', { name: 'Cancel' } );
		cancelButton.click();

		expect( callback ).toHaveBeenCalledWith( false );
	} );
} );
