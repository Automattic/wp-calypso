/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SingleEventCard } from '../event-card';
import { getLeadMatchingContactAnnouncement } from '../events';

describe( '<SingleEventCard>', () => {
	test( 'tracks internal announcement CTAs', async () => {
		const user = userEvent.setup();
		const recordTracksEvent = jest.fn();
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
} );
