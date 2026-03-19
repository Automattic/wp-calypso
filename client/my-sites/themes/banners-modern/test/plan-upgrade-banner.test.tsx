/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUpgradeBanner from '../plan-upgrade-banner';

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( () => '$96' ),
} ) );

describe( 'PlanUpgradeBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	test( 'renders plan title and description', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		expect( screen.getByRole( 'heading', { level: 2 } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { level: 3 } ) ).toBeVisible();
	} );

	test( 'renders features list', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const items = screen.getAllByRole( 'listitem' );
		expect( items.length ).toBeGreaterThan( 0 );
	} );

	test( 'renders CTA button', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const button = screen.getByRole( 'link', { name: /Get/ } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', expect.stringContaining( '/start/' ) );
	} );

	test( 'tracks click event with plan slug when CTA is clicked', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const button = screen.getByRole( 'link', { name: /Get/ } );
		await user.click( button );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_plan_upgrade_banner_click',
			expect.objectContaining( { plan: expect.any( String ) } )
		);
	} );

	test( 'renders light variant by default', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).not.toHaveClass( 'is-dark' );
	} );

	test( 'renders dark variant when specified', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } variant="dark" /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).toHaveClass( 'is-dark' );
	} );

	test( 'toggles billing period between monthly and annually', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		const monthlyRadio = screen.getByLabelText( /Monthly/ );
		const annuallyRadio = screen.getByLabelText( /Annually/ );

		// Starts on annually
		expect( annuallyRadio ).toBeChecked();
		expect( monthlyRadio ).not.toBeChecked();

		await user.click( monthlyRadio );
		expect( monthlyRadio ).toBeChecked();
		expect( annuallyRadio ).not.toBeChecked();
	} );

	test( 'renders with different plan slugs', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_PREMIUM } /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).toBeVisible();
	} );
} );
