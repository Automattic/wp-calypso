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

const mockUseExperiment = jest.fn( () => [ false, null ] );
jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: ( ...args: unknown[] ) => mockUseExperiment( ...args ),
} ) );

describe( 'AIBuilderBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
		mockUseExperiment.mockReset().mockReturnValue( [ false, null ] );
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

	test( 'renders CTA button linking to the default AI Builder flow by default', () => {
		render( <AIBuilderBanner /> );
		const button = screen.getByRole( 'link', { name: 'Start with AI' } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', '/setup/ai-site-builder' );
	} );

	test( 'routes treatment users to the Calypso site-spec flow', () => {
		mockUseExperiment.mockReturnValue( [
			false,
			{
				experimentName: 'wpcom_ai_website_builder_vega_site_spec_202604',
				variationName: 'treatment',
			},
		] );
		render( <AIBuilderBanner /> );
		expect( screen.getByRole( 'link', { name: 'Start with AI' } ) ).toHaveAttribute(
			'href',
			'/setup/ai-site-builder-spec'
		);
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
