/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import ConnectSiteModal from '../connect-site-modal';
import type { ConnectSiteAction } from '../types';

function renderModal( action: ConnectSiteAction ) {
	const onClose = jest.fn();
	const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );

	render( <ConnectSiteModal action={ action } onClose={ onClose } /> );

	return { onClose, open };
}

const siteField = () => screen.getByLabelText( 'What site do you want to connect?' );
const submitButton = ( name: string ) => screen.getByRole( 'button', { name } );

afterEach( () => {
	jest.restoreAllMocks();
} );

describe( 'ConnectSiteModal', () => {
	test( 'sends the agency to the site’s plugin installer for the Automattic plugin', async () => {
		const { onClose, open } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com' );
		await userEvent.click( submitButton( 'Connect' ) );

		expect( open ).toHaveBeenCalledWith(
			'https://example.com/wp-admin/plugin-install.php?s=automattic-for-agencies-client&tab=search&type=term',
			'_blank',
			'noreferrer'
		);
		expect( onClose ).toHaveBeenCalled();
	} );

	test( 'sends the agency to Jetpack connect for the Jetpack plugin', async () => {
		const { onClose, open } = renderModal( 'jetpack-connection' );

		await userEvent.type( siteField(), 'example.com' );
		await userEvent.click( submitButton( 'Install Jetpack' ) );

		const [ url ] = open.mock.calls[ 0 ];
		expect( url ).toContain( '/jetpack/connect' );
		expect( url ).toContain( 'url=example.com' );
		expect( url ).toContain( 'source=a8c-for-agencies' );
		expect( onClose ).toHaveBeenCalled();
	} );

	test( 'keeps the scheme the agency typed', async () => {
		const { open } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'http://example.com' );
		await userEvent.click( submitButton( 'Connect' ) );

		expect( open ).toHaveBeenCalledWith(
			expect.stringContaining( 'http://example.com/wp-admin' ),
			'_blank',
			'noreferrer'
		);
	} );

	test( 'submits on Enter without leaving the field', async () => {
		const { open } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com{Enter}' );

		expect( open ).toHaveBeenCalled();
	} );

	test( 'blocks submission until a site is entered', () => {
		renderModal( 'jetpack-connection' );

		expect( submitButton( 'Install Jetpack' ) ).toBeDisabled();
	} );

	test( 'blocks submission for a host without a TLD', async () => {
		renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'localhost' );

		expect( submitButton( 'Connect' ) ).toBeDisabled();
	} );

	test( 'blocks submission for an unparseable URL', async () => {
		renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'https://exa mple.com' );

		expect( submitButton( 'Connect' ) ).toBeDisabled();
	} );

	test( 'closes without opening anything when cancelled', async () => {
		const { onClose, open } = renderModal( 'a4a-connection' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( open ).not.toHaveBeenCalled();
	} );
} );
