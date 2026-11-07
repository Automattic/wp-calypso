/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../../test-utils';
import AddWooPaymentsToSite from '../index';

const API = 'https://public-api.wordpress.com';

test( 'shows the approval gate instead of the site picker to an unapproved agency', async () => {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, approval_status: 'pending' } ] )
		.persist();
	const recordTracksEvent = vi.fn();

	render(
		<AddWooPaymentsToSite
			agencyId={ 123 }
			excludedSiteIds={ [] }
			recordTracksEvent={ recordTracksEvent }
			onSelectSite={ vi.fn() }
			isApprovalGated
		/>
	);
	const user = userEvent.setup();
	await user.click( screen.getByRole( 'button', { name: 'Add WooPayments to site' } ) );

	expect( await screen.findByText( 'WooPayments unlocks once you’re approved' ) ).toBeVisible();
	expect(
		screen.queryByText( 'Which site would you like to add WooPayments to?' )
	).not.toBeInTheDocument();
	expect( recordTracksEvent ).not.toHaveBeenCalledWith(
		'calypso_a4a_woopayments_add_site_button_click'
	);
} );
