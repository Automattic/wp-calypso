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
} );
