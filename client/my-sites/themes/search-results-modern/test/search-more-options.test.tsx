/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SearchMoreOptions from '../search-more-options';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'SearchMoreOptions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the title', () => {
		render( <SearchMoreOptions title="No themes found" /> );
		expect( screen.getByRole( 'heading', { name: 'No themes found' } ) ).toBeVisible();
	} );

	test( 'renders the subtitle when provided', () => {
		render(
			<SearchMoreOptions title="No themes found" subtitle="Try building your site another way." />
		);
		expect( screen.getByText( /Try building your site another way/ ) ).toBeVisible();
	} );

	test( 'does not render subtitle when not provided', () => {
		render( <SearchMoreOptions title="More options to create your site" /> );
		expect( screen.queryByText( /Try building/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders all three CTA cards', () => {
		render( <SearchMoreOptions title="No themes found" /> );
		expect( screen.getByText( 'AI website builder' ) ).toBeVisible();
		expect( screen.getByText( 'Let us do it for you' ) ).toBeVisible();
		// "Upload theme" appears as both a label and a button; query the label specifically.
		expect(
			screen.getByText( 'Upload theme', { selector: '.search-more-options__card-label' } )
		).toBeVisible();
	} );

	test( 'renders CTA buttons with correct labels', () => {
		render( <SearchMoreOptions title="No themes found" /> );
		expect( screen.getByRole( 'link', { name: 'Build with AI' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Hire an expert' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Upload theme' } ) ).toBeVisible();
	} );

	test( 'renders CTA buttons with correct hrefs', () => {
		render( <SearchMoreOptions title="No themes found" /> );
		expect( screen.getByRole( 'link', { name: 'Build with AI' } ) ).toHaveAttribute(
			'href',
			'/setup/ai-site-builder'
		);
		expect( screen.getByRole( 'link', { name: 'Hire an expert' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/website-design-service/?ref=no-themes'
		);
		expect( screen.getByRole( 'link', { name: 'Upload theme' } ) ).toHaveAttribute(
			'href',
			'/start/business'
		);
	} );

	test( 'tracks AI builder click with search_term', async () => {
		const user = userEvent.setup();
		render( <SearchMoreOptions title="No themes found" searchTerm="portfolio" /> );
		await user.click( screen.getByRole( 'link', { name: 'Build with AI' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_more_options_ai_click',
			{ search_term: 'portfolio' }
		);
	} );

	test( 'tracks DIFM click with search_term', async () => {
		const user = userEvent.setup();
		render( <SearchMoreOptions title="No themes found" searchTerm="portfolio" /> );
		await user.click( screen.getByRole( 'link', { name: 'Hire an expert' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_more_options_difm_click',
			{ search_term: 'portfolio' }
		);
	} );

	test( 'tracks upload theme click with search_term', async () => {
		const user = userEvent.setup();
		render( <SearchMoreOptions title="No themes found" searchTerm="portfolio" /> );
		await user.click( screen.getByRole( 'link', { name: 'Upload theme' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_more_options_upload_theme_click',
			{ search_term: 'portfolio' }
		);
	} );

	test( 'tracks clicks without search_term when not provided', async () => {
		const user = userEvent.setup();
		render( <SearchMoreOptions title="No themes found" /> );
		await user.click( screen.getByRole( 'link', { name: 'Build with AI' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_more_options_ai_click',
			{ search_term: undefined }
		);
	} );
} );
