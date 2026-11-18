/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render as renderWithRouter } from '../../../test-utils';
import { SingleEventCard } from '../event-card';
import { getJetpackHolidaySaleEvent, getLeadMatchingContactAnnouncement } from '../events';

describe( '<SingleEventCard>', () => {
	test( 'tracks internal announcement CTAs', async () => {
		const user = userEvent.setup();
		const recordTracksEvent = vi.fn();
		render(
			<SingleEventCard
				event={ getLeadMatchingContactAnnouncement( '/partner-directory/lead-matching' ) }
				shouldUseRouterLink={ false }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Update your details' } );
		link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
		await user.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_event_cta_click', {
			event_id: 'a4a-lead-matching-contact-options',
			cta_id: 'update-details',
		} );
	} );

	test( 'keeps the query string of a router link', async () => {
		renderWithRouter(
			<SingleEventCard
				event={ getJetpackHolidaySaleEvent( '/products?category=jetpack' ) }
				shouldUseRouterLink
			/>
		);

		expect( await screen.findByRole( 'link', { name: 'View Jetpack products' } ) ).toHaveAttribute(
			'href',
			'/products?category=jetpack'
		);
	} );
} );
