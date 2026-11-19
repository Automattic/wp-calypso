/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_START,
} from 'calypso/lib/promotions/black-friday-2026';
import BlackFriday2026Banner from '..';

const mockIsEnabled = jest.fn< boolean, [ string ] >( () => false );
jest.mock( '@automattic/calypso-config', () => {
	const config = () => undefined;
	config.isEnabled = ( flag: string ) => mockIsEnabled( flag );
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const HEADLINE = 'Until December 1: 25% off annual and multi-year plans.';
const DAY = 24 * 60 * 60 * 1000;
// The sale lasts 5 days, so 10 days left is only reachable with the flag.
const TEN_DAYS_LEFT = BLACK_FRIDAY_2026_END - ( 10 * DAY + 6 * 3600000 + 23 * 60000 + 54000 );

describe( 'BlackFriday2026Banner', () => {
	let nowSpy: jest.SpyInstance;

	beforeEach( () => {
		mockIsEnabled.mockReturnValue( false );
		nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( BLACK_FRIDAY_2026_START + 1000 );
	} );

	afterEach( () => {
		nowSpy.mockRestore();
		jest.clearAllMocks();
	} );

	it( 'renders during the sale and records a view', async () => {
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( HEADLINE, { exact: false } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /off/ } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_plans_banner_view' );
	} );

	it( 'does not render before or after the sale', () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_START - 1 );
		const { unmount } = render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE, { exact: false } ) ).not.toBeInTheDocument();
		unmount();

		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END );
		render( <BlackFriday2026Banner /> );
		expect( screen.queryByText( HEADLINE, { exact: false } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'renders outside the sale when the flag is on', async () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_START - 1 );
		mockIsEnabled.mockReturnValue( true );

		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( HEADLINE, { exact: false } ) ).toBeVisible();
	} );

	it( 'shows the time left until the sale ends', async () => {
		mockIsEnabled.mockReturnValue( true );
		nowSpy.mockReturnValue( TEN_DAYS_LEFT );
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( '10 days' ) ).toBeVisible();
		expect( screen.getByText( '06:23:54' ) ).toBeVisible();
	} );

	it( 'uses the singular for one day', async () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END - ( DAY + 1000 ) );
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( '1 day' ) ).toBeVisible();
		expect( screen.getByText( '00:00:01' ) ).toBeVisible();
	} );

	it( 'shows only the clock on the last day', async () => {
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END - 3661000 );
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( '01:01:01' ) ).toBeVisible();
		expect( screen.queryByText( /day/ ) ).not.toBeInTheDocument();
	} );

	it( 'hides when the sale ends while the page is open', () => {
		jest.useFakeTimers( { doNotFake: [ 'Date' ] } );
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END - 5000 );
		render( <BlackFriday2026Banner /> );
		expect( screen.getByText( HEADLINE, { exact: false } ) ).toBeVisible();

		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END );
		act( () => {
			jest.advanceTimersByTime( 6000 );
		} );
		expect( screen.queryByText( HEADLINE, { exact: false } ) ).not.toBeInTheDocument();
		jest.useRealTimers();
	} );

	it( 'ticks every second and clears the timer on unmount', () => {
		jest.useFakeTimers( { doNotFake: [ 'Date' ] } );
		mockIsEnabled.mockReturnValue( true );
		nowSpy.mockReturnValue( TEN_DAYS_LEFT );
		const { unmount } = render( <BlackFriday2026Banner /> );
		expect( screen.getByText( '06:23:54' ) ).toBeVisible();

		nowSpy.mockReturnValue( TEN_DAYS_LEFT + 1000 );
		act( () => {
			jest.advanceTimersByTime( 1000 );
		} );
		expect( screen.getByText( '06:23:53' ) ).toBeVisible();

		unmount();
		expect( jest.getTimerCount() ).toBe( 0 );
		jest.useRealTimers();
	} );

	it( 'never goes negative', async () => {
		mockIsEnabled.mockReturnValue( true );
		nowSpy.mockReturnValue( BLACK_FRIDAY_2026_END + DAY );
		render( <BlackFriday2026Banner /> );

		expect( await screen.findByText( '00:00:00' ) ).toBeVisible();
	} );

	it( 'keeps the decorative tiles out of the accessibility tree', async () => {
		const { container } = render( <BlackFriday2026Banner /> );
		await screen.findByText( HEADLINE, { exact: false } );

		const tiles = container.querySelector( '.black-friday-2026-banner__tiles' );
		expect( tiles ).toHaveAttribute( 'aria-hidden', 'true' );
		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( tiles?.textContent ).toBe( '' );
	} );

	it( 'hides when dismissed and shows again on the next visit', async () => {
		const { unmount } = render( <BlackFriday2026Banner /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( HEADLINE, { exact: false } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_plans_banner_dismiss' );
		unmount();

		render( <BlackFriday2026Banner /> );
		expect( await screen.findByText( HEADLINE, { exact: false } ) ).toBeVisible();
	} );
} );
