/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EventCard from '../event-card';

describe( '<EventCard>', () => {
	beforeEach( () => {
		jest.useFakeTimers( { now: new Date( '2026-09-01T00:00:00Z' ) } );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'keeps internal announcement CTAs and tracking after dated events expire', () => {
		const recordTracksEvent = jest.fn();
		const events = () => (
			<EventCard
				isEligibleForPressableIntroOffer
				aiMcpHref="/resources-and-tools/ai-mcp"
				pressableHostingHref="/marketplace/hosting/pressable"
				shouldUseRouterLink={ false }
				leadMatchingHref="/partner-directory/lead-matching"
				recordTracksEvent={ recordTracksEvent }
			/>
		);
		const view = render( events() );

		expect( screen.getByRole( 'link', { name: 'Enable MCP' } ) ).toHaveAttribute(
			'href',
			'/resources-and-tools/ai-mcp'
		);
		expect( screen.getByRole( 'link', { name: 'View promo details' } ) ).toHaveAttribute(
			'href',
			'/marketplace/hosting/pressable'
		);
		const link = screen.getByRole( 'link', { name: 'Update your details' } );
		expect( link ).toHaveAttribute( 'href', '/partner-directory/lead-matching' );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
		fireEvent.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_event_cta_click', {
			event_id: 'a4a-lead-matching-contact-options',
			cta_id: 'update-details',
		} );

		jest.setSystemTime( new Date( '2027-01-01T00:00:00Z' ) );
		view.rerender( events() );
		expect( screen.getByRole( 'link', { name: 'Update your details' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Enable MCP' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'View promo details' } ) ).not.toBeInTheDocument();
	} );
} );
