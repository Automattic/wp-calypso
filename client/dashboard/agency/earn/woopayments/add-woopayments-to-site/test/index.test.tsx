/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../../../test-utils';
import AddWooPaymentsToSite from '../index';

const API = 'https://public-api.wordpress.com';
const PICKER = { name: 'Which site would you like to add WooPayments to?' };
const recordTracksEvent = jest.fn();

// Owns the open request like a page does: a link sets it, and the button acknowledges it.
function Page( {
	swapButtons = false,
	isApprovalGated = false,
}: {
	swapButtons?: boolean;
	isApprovalGated?: boolean;
} ) {
	const [ isRequested, setIsRequested ] = useState( true );
	const [ isSwapped, setIsSwapped ] = useState( false );
	return (
		<>
			<button onClick={ () => setIsRequested( true ) }>Link</button>
			{ swapButtons && <button onClick={ () => setIsSwapped( true ) }>Swap</button> }
			<AddWooPaymentsToSite
				key={ isSwapped ? 'header' : 'empty-state' }
				agencyId={ 0 }
				excludedSiteIds={ [] }
				recordTracksEvent={ recordTracksEvent }
				onSelectSite={ jest.fn() }
				isApprovalGated={ isApprovalGated }
				autoOpen={ isRequested }
				onAutoOpen={ () => setIsRequested( false ) }
			/>
		</>
	);
}

async function closePicker( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
	await waitFor( () => expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument() );
}

function mockPendingAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, approval_status: 'pending' } ] )
		.persist();
}

describe( 'AddWooPaymentsToSite', () => {
	beforeEach( () => {
		recordTracksEvent.mockClear();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'opens once for each request, while it stays mounted', async () => {
		const user = userEvent.setup();
		render( <Page /> );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		await closePicker( user );

		await user.click( screen.getByRole( 'button', { name: 'Link' } ) );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_woopayments_add_site_button_click'
		);
	} );

	test( 'does not reopen for a request it already took, when another button replaces it', async () => {
		const user = userEvent.setup();
		render( <Page swapButtons /> );

		await screen.findByRole( 'dialog', PICKER );
		await closePicker( user );
		await user.click( screen.getByRole( 'button', { name: 'Swap' } ) );

		expect( screen.getByRole( 'button', { name: 'Add WooPayments to site' } ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'shows the approval gate instead of the site picker to an unapproved agency', async () => {
		mockPendingAgency();

		render(
			<AddWooPaymentsToSite
				agencyId={ 123 }
				excludedSiteIds={ [] }
				recordTracksEvent={ recordTracksEvent }
				onSelectSite={ jest.fn() }
				isApprovalGated
			/>
		);
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: 'Add WooPayments to site' } ) );

		expect( await screen.findByText( 'WooPayments unlocks once you’re approved' ) ).toBeVisible();
		expect( screen.queryByText( PICKER.name ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_a4a_woopayments_add_site_button_click'
		);
	} );

	test( 'opens the approval gate for a request from an unapproved agency', async () => {
		mockPendingAgency();
		render( <Page isApprovalGated /> );

		expect( await screen.findByText( 'WooPayments unlocks once you’re approved' ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
