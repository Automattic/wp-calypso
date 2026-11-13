/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_START,
} from 'calypso/lib/promotions/black-friday-2026';
import BlackFriday2026Banner, { BLACK_FRIDAY_2026_BANNER_DISMISSED_KEY } from '..';

const mockIsEnabled = jest.fn< boolean, [ string ] >( () => false );
let mockEnv = 'production';
jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => ( 'env' === key ? mockEnv : undefined );
	config.isEnabled = ( flag: string ) => mockIsEnabled( flag );
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const HEADLINE = 'Black Friday: 25% off annual plans';

describe( 'BlackFriday2026Banner', () => {
	let nowSpy: jest.SpyInstance;

	beforeEach( () => {
		window.localStorage.clear();
		mockEnv = 'production';
		mockIsEnabled.mockImplementation( ( flag: string ) => flag === 'black-friday-2026' );
		nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( BLACK_FRIDAY_2026_START + 1000 );
	} );

	afterEach( () => {
		nowSpy.mockRestore();
		jest.clearAllMocks();
	} );

	it( 'renders during the sale and records a view', async () => {
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( HEADLINE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Get 25% off' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_plans_banner_view' );
	} );

	it( 'does not render before or after the sale', () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_START - 1 );
		const { unmount } = render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE ) ).not.toBeInTheDocument();
		unmount();

		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END );
		render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not render inside the sale when the flag is off', () => {
		mockIsEnabled.mockReturnValue( false );
		render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE ) ).not.toBeInTheDocument();
	} );

	it( 'renders outside the sale in development when the flag is on', async () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_START - 1 );
		mockEnv = 'development';

		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( HEADLINE ) ).toBeVisible();
	} );

	it( 'scrolls to the plans grid when the CTA is clicked', async () => {
		const grid = document.createElement( 'div' );
		grid.className = 'plans-features-main__group';
		grid.scrollIntoView = jest.fn();
		document.body.appendChild( grid );

		render( <BlackFriday2026Banner /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Get 25% off' } ) );

		expect( grid.scrollIntoView ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_plans_banner_click' );
		grid.remove();
	} );

	it( 'hides and persists when dismissed', async () => {
		const { unmount } = render( <BlackFriday2026Banner /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( HEADLINE ) ).not.toBeInTheDocument();
		expect( window.localStorage.getItem( BLACK_FRIDAY_2026_BANNER_DISMISSED_KEY ) ).toBe( '1' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_plans_banner_dismiss' );
		unmount();

		render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE ) ).not.toBeInTheDocument();
	} );
} );
