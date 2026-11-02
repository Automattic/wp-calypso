/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../../test-utils';
import AddWooPaymentsToSite from '../index';

const PICKER = { name: 'Which site would you like to add WooPayments to?' };
const recordTracksEvent = jest.fn();

// Owns the open request like a page does: a link sets it, and the button acknowledges it.
function Page( { swapButtons = false }: { swapButtons?: boolean } ) {
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

describe( 'AddWooPaymentsToSite', () => {
	beforeEach( () => {
		recordTracksEvent.mockClear();
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
} );
