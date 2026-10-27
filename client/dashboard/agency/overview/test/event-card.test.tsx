/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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

	describe( 'certification offer', () => {
		const offerTitle = { name: 'Certify your developers at double the discount' };

		function renderEventCard( isEligibleForCertificationOffer: boolean ) {
			render(
				<EventCard
					isEligibleForCertificationOffer={ isEligibleForCertificationOffer }
					aiMcpHref="/resources-and-tools/ai-mcp"
					tiersHref="/agency-tier"
					pressableHostingHref="/marketplace/hosting/pressable"
					shouldUseRouterLink={ false }
				/>
			);
		}

		test( 'links to the code on the tier page for eligible agencies', () => {
			renderEventCard( true );

			expect( screen.getByRole( 'heading', offerTitle ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Get your code' } ) ).toHaveAttribute(
				'href',
				'/agency-tier#certification'
			);
		} );

		test( 'is hidden for agencies without a code', () => {
			renderEventCard( false );

			expect( screen.queryByRole( 'heading', offerTitle ) ).not.toBeInTheDocument();
		} );

		test( 'is hidden once the promo ends on April 1, 2027', () => {
			jest.setSystemTime( new Date( '2027-04-01T00:00:00Z' ) );
			renderEventCard( true );

			expect( screen.queryByRole( 'heading', offerTitle ) ).not.toBeInTheDocument();
		} );
	} );
} );
