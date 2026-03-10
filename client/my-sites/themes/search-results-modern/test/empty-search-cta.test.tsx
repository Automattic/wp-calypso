/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import EmptySearchCTA from '../empty-search-cta';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'EmptySearchCTA', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the title', () => {
		render( <EmptySearchCTA title="No themes found" /> );
		expect( screen.getByRole( 'heading', { name: 'No themes found' } ) ).toBeVisible();
	} );

	test( 'renders the subtitle when provided', () => {
		render(
			<EmptySearchCTA title="No themes found" subtitle="Try building your site another way." />
		);
		expect( screen.getByText( /Try building your site another way/ ) ).toBeVisible();
	} );

	test( 'does not render subtitle when not provided', () => {
		render( <EmptySearchCTA title="More options to create your site" /> );
		expect( screen.queryByText( /Try building/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders all three CTA cards', () => {
		render( <EmptySearchCTA title="No themes found" /> );
		expect( screen.getByText( 'AI website builder' ) ).toBeVisible();
		expect( screen.getByText( 'Let us do it for you' ) ).toBeVisible();
		// "Upload theme" appears as both a label and a button; query the label specifically.
		expect(
			screen.getByText( 'Upload theme', { selector: '.empty-search-cta__card-label' } )
		).toBeVisible();
	} );

	test( 'renders CTA buttons with correct labels', () => {
		render( <EmptySearchCTA title="No themes found" /> );
		expect( screen.getByRole( 'link', { name: 'Build with AI' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Hire an expert' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Upload theme' } ) ).toBeVisible();
	} );

	test( 'renders CTA buttons with correct hrefs', () => {
		render( <EmptySearchCTA title="No themes found" /> );
		expect( screen.getByRole( 'link', { name: 'Build with AI' } ) ).toHaveAttribute(
			'href',
			'/setup/ai-site-builder'
		);
		expect( screen.getByRole( 'link', { name: 'Hire an expert' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/website-design-service/'
		);
		expect( screen.getByRole( 'link', { name: 'Upload theme' } ) ).toHaveAttribute(
			'href',
			'/themes/upload'
		);
	} );

	test( 'tracks AI builder CTA click', async () => {
		const user = userEvent.setup();
		render( <EmptySearchCTA title="No themes found" /> );
		await user.click( screen.getByRole( 'link', { name: 'Build with AI' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_empty_search_cta_click',
			{ cta: 'ai_builder' }
		);
	} );

	test( 'tracks DIFM CTA click', async () => {
		const user = userEvent.setup();
		render( <EmptySearchCTA title="No themes found" /> );
		await user.click( screen.getByRole( 'link', { name: 'Hire an expert' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_empty_search_cta_click',
			{ cta: 'difm' }
		);
	} );

	test( 'tracks upload theme CTA click', async () => {
		const user = userEvent.setup();
		render( <EmptySearchCTA title="No themes found" /> );
		await user.click( screen.getByRole( 'link', { name: 'Upload theme' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_empty_search_cta_click',
			{ cta: 'upload_theme' }
		);
	} );
} );
