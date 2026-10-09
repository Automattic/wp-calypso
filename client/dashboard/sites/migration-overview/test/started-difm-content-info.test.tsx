/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { StartedDIFMContentInfo } from '../started-difm-content-info';
import type { Site } from '@automattic/api-core';

const reminder = /Heads up: if it has been more than 3 business days/;
const site = {
	ID: 123,
	slug: 'example.com',
	site_migration: { migration_status: 'migration-started-difm' },
} as Site;

function mockTicket() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/sites/123/automated-migration/find-ticket' )
		.reply( 200, { ticket_id: '456' } );
}

describe( 'StartedDIFMContentInfo', () => {
	it.each( [ false, undefined ] )(
		'shows the credentials reminder when in_progress is %s',
		async ( inProgress ) => {
			mockTicket();
			render(
				<StartedDIFMContentInfo
					site={ {
						...site,
						site_migration: {
							...site.site_migration,
							...( inProgress === undefined ? {} : { in_progress: inProgress } ),
						},
					} }
				/>
			);

			expect( await screen.findByText( reminder ) ).toBeVisible();
			expect( await screen.findByRole( 'button', { name: 'Cancel migration' } ) ).toBeVisible();
		}
	);

	it( 'shows the reminder when migration details are missing', async () => {
		mockTicket();
		render( <StartedDIFMContentInfo site={ { ID: site.ID, slug: site.slug } as Site } /> );

		expect( await screen.findByText( reminder ) ).toBeVisible();
	} );

	it( 'hides the reminder during migration and keeps cancellation available', async () => {
		const user = userEvent.setup();
		const ticket = mockTicket();
		render(
			<StartedDIFMContentInfo
				site={ { ...site, site_migration: { ...site.site_migration, in_progress: true } } }
			/>
		);

		const cancel = await screen.findByRole( 'button', { name: 'Request migration cancellation' } );
		expect( screen.getByText( 'We’ve received your migration request' ) ).toBeVisible();
		expect( screen.queryByText( reminder ) ).not.toBeInTheDocument();
		await waitFor( () => expect( ticket.isDone() ).toBe( true ) );

		await user.click( cancel );
		const dialog = await screen.findByRole( 'dialog', { name: 'Request migration cancellation' } );
		expect(
			within( dialog ).getByText( /Since your migration is already underway/ )
		).toBeVisible();
		await user.click( within( dialog ).getByRole( 'button', { name: 'Don’t cancel migration' } ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( cancel ).toBeVisible();
	} );
} );
