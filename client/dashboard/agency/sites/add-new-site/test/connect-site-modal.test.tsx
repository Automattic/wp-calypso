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

	render( <ConnectSiteModal action={ action } onClose={ onClose } /> );

	return { onClose };
}

const siteField = () => screen.getByLabelText( 'What site do you want to connect?' );

// The submit control is a link once there is somewhere to send the agency, and
// a disabled button until then.
const submitLink = ( name: string ) => screen.getByRole( 'link', { name } );
const submitButton = ( name: string ) => screen.getByRole( 'button', { name } );

describe( 'ConnectSiteModal', () => {
	test( 'sends the agency to the site’s plugin installer for the Automattic plugin', async () => {
		renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com' );

		const link = submitLink( 'Connect' );
		expect( link ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/plugin-install.php?s=automattic-for-agencies-client&tab=search&type=term'
		);
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'sends the agency to Jetpack connect for the Jetpack plugin', async () => {
		renderModal( 'jetpack-connection' );

		await userEvent.type( siteField(), 'example.com' );

		const href = submitLink( 'Install Jetpack' ).getAttribute( 'href' );
		expect( href ).toContain( '/jetpack/connect' );
		expect( href ).toContain( 'url=example.com' );
		expect( href ).toContain( 'source=a8c-for-agencies' );
	} );

	test( 'keeps the scheme the agency typed', async () => {
		renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'http://example.com' );

		expect( submitLink( 'Connect' ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'http://example.com/wp-admin' )
		);
	} );

	test( 'closes once the agency is on their way to the installer', async () => {
		const { onClose } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com' );
		await userEvent.click( submitLink( 'Connect' ) );

		expect( onClose ).toHaveBeenCalled();
	} );

	test( 'submits on Enter without leaving the field', async () => {
		const { onClose } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com{Enter}' );

		expect( onClose ).toHaveBeenCalled();
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

	test( 'closes without sending the agency anywhere when cancelled', async () => {
		const { onClose } = renderModal( 'a4a-connection' );

		await userEvent.type( siteField(), 'example.com' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalled();
	} );
} );
