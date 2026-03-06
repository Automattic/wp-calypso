/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIBuilderBanner from '../ai-builder-banner';

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

describe( 'AIBuilderBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	test( 'renders title', () => {
		render( <AIBuilderBanner /> );
		expect( screen.getByText( 'Create my theme with AI' ) ).toBeVisible();
	} );

	test( 'renders subtitle', () => {
		render( <AIBuilderBanner /> );
		expect(
			screen.getByText( /Generate a one-of-a-kind website by chatting with AI/ )
		).toBeVisible();
	} );

	test( 'renders CTA button linking to AI builder flow', () => {
		render( <AIBuilderBanner /> );
		const button = screen.getByRole( 'link', { name: 'Start with AI' } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', '/setup/ai-site-builder' );
	} );

	test( 'tracks click event when CTA is clicked', async () => {
		const user = userEvent.setup();
		render( <AIBuilderBanner /> );
		const button = screen.getByRole( 'link', { name: 'Start with AI' } );
		await user.click( button );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_ai_builder_banner_click'
		);
	} );
} );
