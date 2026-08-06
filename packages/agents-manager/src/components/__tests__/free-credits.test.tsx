/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import {
	consumeFreeCredit,
	resetFreeCredits,
	setFreeCreditsState,
	FreeCreditsPill,
	FreeCreditsBanner,
	FreeCreditsCard,
	FreeCreditsExhausted,
	FREE_CREDITS_SURFACES,
	type FreeCreditsState,
} from '../free-credits';
import type * as FreeCreditsStore from '../free-credits/store';

function renderSurfaces( state: Partial< FreeCreditsState > ) {
	setFreeCreditsState( {
		enabled: true,
		total: 20,
		surfaces: [ ...FREE_CREDITS_SURFACES ],
		...state,
	} );

	render(
		<>
			<FreeCreditsPill />
			<FreeCreditsBanner />
			<FreeCreditsCard />
			<FreeCreditsExhausted />
		</>
	);
}

beforeEach( () => {
	window.sessionStorage.clear();
} );

describe( 'free credits surfaces', () => {
	it( 'renders nothing while the experiment is off', () => {
		renderSurfaces( { enabled: false, remaining: 5 } );

		expect( screen.queryByText( /free requests/i ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows every surface when all are enabled', () => {
		renderSurfaces( { remaining: 5 } );

		expect( screen.getByTitle( '5 of 20 free requests left this month' ) ).toBeVisible();
		expect( screen.getByText( '5 of 20 free requests left' ) ).toBeVisible();
		expect( screen.getByText( '5 free requests left' ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '5' );
	} );

	it( 'limits rendering to the requested surfaces', () => {
		renderSurfaces( { remaining: 5, surfaces: [ 'pill' ] } );

		expect( screen.getByTitle( '5 of 20 free requests left this month' ) ).toBeVisible();
		expect( screen.queryByText( '5 of 20 free requests left' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'progressbar' ) ).not.toBeInTheDocument();
	} );

	it( 'replaces the banner with the upgrade gate at zero', () => {
		renderSurfaces( { remaining: 0 } );

		expect( screen.getByText( 'You’re out of free requests' ) ).toBeVisible();
		expect( screen.queryByText( /\d+ of \d+ free requests left$/ ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the banner when the gate surface is off', () => {
		renderSurfaces( { remaining: 0, surfaces: [ 'banner' ] } );

		expect( screen.getByText( 'No free requests left this month.' ) ).toBeVisible();
		expect( screen.queryByText( 'You’re out of free requests' ) ).not.toBeInTheDocument();
	} );

	it( 'counts down and reaches the gate as credits are spent', () => {
		renderSurfaces( { remaining: 2 } );

		act( () => consumeFreeCredit() );
		expect( screen.getByText( '1 of 20 free requests left' ) ).toBeVisible();

		act( () => consumeFreeCredit() );
		expect( screen.getByText( 'You’re out of free requests' ) ).toBeVisible();

		act( () => resetFreeCredits() );
		expect( screen.getByText( '20 of 20 free requests left' ) ).toBeVisible();
	} );

	it( 'ignores a spend while the experiment is off', () => {
		renderSurfaces( { enabled: false, remaining: 5 } );

		act( () => consumeFreeCredit() );

		expect( screen.queryByText( /free requests/i ) ).not.toBeInTheDocument();
	} );
} );

describe( 'free credits URL seeding', () => {
	// The store snapshots the URL on first read, so each case needs a fresh
	// module. Only `store` is re-imported — pulling the components through
	// `resetModules` would give them a second React instance.
	async function loadWithSearch( search: string ): Promise< typeof FreeCreditsStore > {
		window.history.replaceState( {}, '', search );
		window.sessionStorage.clear();
		jest.resetModules();
		return import( '../free-credits/store' );
	}

	it( 'stays off without an experiment param', async () => {
		const store = await loadWithSearch( '/?foo=bar' );

		expect( store.getFreeCreditsState().enabled ).toBe( false );
	} );

	it( 'enables every surface when only the balance is given', async () => {
		const store = await loadWithSearch( '/?ai-credits=5&ai-credits-total=20' );

		expect( store.getFreeCreditsState() ).toMatchObject( {
			enabled: true,
			remaining: 5,
			total: 20,
			surfaces: [ ...FREE_CREDITS_SURFACES ],
		} );
	} );

	it( 'parses a surface list and drops unknown entries', async () => {
		const store = await loadWithSearch( '/?ai-credits=5&ai-credits-ui=pill,nope,card' );

		expect( store.getFreeCreditsState().surfaces ).toEqual( [ 'pill', 'card' ] );
	} );

	it( 'clamps a balance above the allowance', async () => {
		const store = await loadWithSearch( '/?ai-credits=99&ai-credits-total=20' );

		expect( store.getFreeCreditsState().remaining ).toBe( 20 );
	} );

	it( 'falls back to the allowance for an unparseable balance', async () => {
		const store = await loadWithSearch( '/?ai-credits=abc&ai-credits-total=8' );

		expect( store.getFreeCreditsState() ).toMatchObject( { remaining: 8, total: 8 } );
	} );

	it( 'restores a persisted session when the URL carries no param', async () => {
		const seeded = await loadWithSearch( '/?ai-credits=3&ai-credits-total=12' );
		seeded.consumeFreeCredit();

		window.history.replaceState( {}, '', '/' );
		jest.resetModules();
		const restored = await import( '../free-credits/store' );

		expect( restored.getFreeCreditsState() ).toMatchObject( {
			enabled: true,
			remaining: 2,
			total: 12,
		} );
	} );
} );
