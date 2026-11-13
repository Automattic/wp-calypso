/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import Snackbars from '../../../../app/snackbars';
import { render } from '../../../../test-utils';
import AssignLicenseModal from '../assign-license-modal';

const API = 'https://public-api.wordpress.com';
const LICENSE_KEY = 'woocommerce-gift-cards_xyz';

function mockAgencyAndSites() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123 } ] )
		.persist();
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [ { blog_id: 55, url: 'store.example.com' } ], total: 1 } )
		.persist();
}

function mockAssignError( code: string, message: string ) {
	nock( API )
		.post( `/wpcom/v2/jetpack-licensing/license/${ LICENSE_KEY }/site` )
		.reply( 400, { code, message } );
}

async function assign() {
	Element.prototype.scrollIntoView = vi.fn();
	render(
		<>
			<AssignLicenseModal
				licenseKey={ LICENSE_KEY }
				productName="Gift Cards"
				issuedAt="2026-01-01 00:00:00"
				closeModal={ vi.fn() }
			/>
			<Snackbars />
		</>
	);
	const user = userEvent.setup();
	await user.click( await screen.findByRole( 'radio', { name: 'store.example.com' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Assign to selected site' } ) );
}

describe( '<AssignLicenseModal>', () => {
	test.each( [
		[ 'partner_not_connected_to_site', 'Not connected.', 'You’re not connected to this site' ],
		[ 'provisioning_error', 'Provisioning error.', 'WooCommerce isn’t installed' ],
		[
			'provisioning_error',
			'Provisioning error, store is not connected to WooCommerce.com account.',
			'Store isn’t connected to WooCommerce.com',
		],
	] )( 'shows the %s error "%s" in the modal', async ( code, message, title ) => {
		mockAgencyAndSites();
		mockAssignError( code, message );

		await assign();

		expect(
			await screen.findByText( title, { ignore: '.a11y-speak-region, script, style' } )
		).toBeVisible();
		expect( document.getElementById( 'a11y-speak-assertive' ) ).toHaveTextContent( title );
	} );

	test( 'shows other errors in a snackbar', async () => {
		mockAgencyAndSites();
		mockAssignError( 'invalid_param', 'Invalid parameter(s): license_key' );

		await assign();

		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText( 'Invalid parameter(s): license_key' );
		expect( notice ).toBeVisible();
		expect( screen.queryByText( 'WooCommerce isn’t installed' ) ).not.toBeInTheDocument();
	} );
} );
