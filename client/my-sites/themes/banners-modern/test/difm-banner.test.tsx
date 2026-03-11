/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DIFMBanner from '../difm-banner';

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

describe( 'DIFMBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	test( 'renders title', () => {
		render( <DIFMBanner /> );
		expect( screen.getByText( 'Get a professional website in days' ) ).toBeVisible();
	} );

	test( 'renders subtitle', () => {
		render( <DIFMBanner /> );
		expect(
			screen.getByText( /Built by WordPress\.com experts and fully managed for you/ )
		).toBeVisible();
	} );

	test( 'renders CTA button linking to DIFM landing page', () => {
		render( <DIFMBanner /> );
		const button = screen.getByRole( 'link', { name: 'Hire an expert' } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', 'https://wordpress.com/website-design-service/' );
	} );

	test( 'tracks click event when CTA is clicked', async () => {
		const user = userEvent.setup();
		render( <DIFMBanner /> );
		const button = screen.getByRole( 'link', { name: 'Hire an expert' } );
		await user.click( button );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_difm_banner_click'
		);
	} );
} );
