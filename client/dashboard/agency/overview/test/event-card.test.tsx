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

	test( 'renders plain anchors for in-app CTAs without a router', () => {
		render(
			<EventCard
				isEligibleForPressableIntroOffer
				aiMcpHref="/resources-and-tools/ai-mcp"
				pressableHostingHref="/marketplace/hosting/pressable"
				shouldUseRouterLink={ false }
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Enable MCP' } ) ).toHaveAttribute(
			'href',
			'/resources-and-tools/ai-mcp'
		);
		expect( screen.getByRole( 'link', { name: 'View promo details' } ) ).toHaveAttribute(
			'href',
			'/marketplace/hosting/pressable'
		);
	} );

	test( 'shows the EvolveDigital NYC 2026 card and tracks ticket clicks', () => {
		const recordTracksEvent = jest.fn();
		render(
			<EventCard
				aiMcpHref="/resources-and-tools/ai-mcp"
				pressableHostingHref="/marketplace/hosting/pressable"
				shouldUseRouterLink={ false }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		expect( screen.getByText( /you get 50% off tickets with the code/ ) ).toBeVisible();
		expect( screen.getByRole( 'code' ) ).toHaveTextContent( 'Automattic50Off' );
		expect( screen.getByRole( 'strong' ) ).toContainElement( screen.getByRole( 'code' ) );

		const purchase = screen.getByRole( 'link', { name: /Purchase tickets/ } );
		expect( purchase ).toHaveAttribute( 'href', 'https://www.evolvedigital.com/' );

		fireEvent.click( purchase );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_event_cta_click', {
			event_id: 'a4a-evolvedigital-nyc-2026',
			cta_id: 'purchase-tickets',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_overview_events_evolvedigital_nyc_2026_purchase_tickets_click'
		);
	} );

	test( 'hides the EvolveDigital NYC 2026 card once the event starts', () => {
		jest.setSystemTime( new Date( '2026-11-19T05:00:00Z' ) );
		render(
			<EventCard
				aiMcpHref="/resources-and-tools/ai-mcp"
				pressableHostingHref="/marketplace/hosting/pressable"
				shouldUseRouterLink={ false }
			/>
		);

		expect( screen.queryByText( 'Join us at EvolveDigital NYC 2026' ) ).not.toBeInTheDocument();
	} );
} );
