/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUpgradeBanner from '../plan-upgrade-banner';

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

describe( 'PlanUpgradeBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	test( 'renders title', () => {
		render( <PlanUpgradeBanner /> );
		expect( screen.getByText( 'Business plan' ) ).toBeVisible();
	} );

	test( 'renders description', () => {
		render( <PlanUpgradeBanner /> );
		expect( screen.getByText( /Instantly unlock thousands of different themes/ ) ).toBeVisible();
	} );

	test( 'renders features list', () => {
		render( <PlanUpgradeBanner /> );
		expect( screen.getByText( 'Free domain for one year' ) ).toBeVisible();
		expect( screen.getByText( 'Install plugins & themes' ) ).toBeVisible();
		expect( screen.getByText( 'Real-time backups' ) ).toBeVisible();
	} );

	test( 'renders CTA button linking to plans page', () => {
		render( <PlanUpgradeBanner /> );
		const button = screen.getByRole( 'link', { name: 'Get Business' } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', '/plans' );
	} );

	test( 'tracks click event when CTA is clicked', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner /> );
		const button = screen.getByRole( 'link', { name: 'Get Business' } );
		await user.click( button );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_plan_upgrade_banner_click'
		);
	} );

	test( 'renders light variant by default', () => {
		const { container } = render( <PlanUpgradeBanner /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).not.toHaveClass( 'is-dark' );
	} );

	test( 'renders dark variant when specified', () => {
		const { container } = render( <PlanUpgradeBanner variant="dark" /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).toHaveClass( 'is-dark' );
	} );

	test( 'toggles billing period and updates price', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner /> );

		expect( screen.getByText( '38' ) ).toBeVisible();

		const annuallyRadio = screen.getByLabelText( /Annually/ );
		await user.click( annuallyRadio );

		expect( screen.getByText( '30' ) ).toBeVisible();
	} );
} );
