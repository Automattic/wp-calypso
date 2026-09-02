/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import InstallProgressCard from '../card';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'InstallProgressCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-17T10:00:00Z' ) );
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'narrates the preparing stage', () => {
		render( <InstallProgressCard transferStatus={ transferStates.ACTIVE } currentStep={ 1 } /> );
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'preparing a dedicated server for your site'
		);
	} );

	it( 'narrates the moving stage', () => {
		render(
			<InstallProgressCard transferStatus={ transferStates.RELOCATING } currentStep={ 1 } />
		);
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'moving your site to the new server'
		);
	} );

	it( 'narrates the finishing stage', () => {
		render( <InstallProgressCard transferStatus={ transferStates.COMPLETE } currentStep={ 1 } /> );
		expect( screen.getByRole( 'status' ).textContent ).toContain( 'Finishing up' );
	} );

	it( 'renders a determinate progress bar labeled with the current stage', () => {
		render( <InstallProgressCard transferStatus={ transferStates.ACTIVE } currentStep={ 1 } /> );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute(
			'aria-label',
			'Preparing a dedicated server for your site'
		);
	} );

	it( 'does not show the overrun line before a stage runs long', () => {
		render( <InstallProgressCard transferStatus={ transferStates.ACTIVE } currentStep={ 1 } /> );
		act( () => jest.advanceTimersByTime( 30_000 ) );
		expect( screen.queryByText( /taking longer than usual/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows the overrun line once a stage runs well past its typical duration', () => {
		render( <InstallProgressCard transferStatus={ transferStates.ACTIVE } currentStep={ 1 } /> );
		act( () => jest.advanceTimersByTime( 45_000 ) );
		expect( screen.getByText( /taking longer than usual/ ) ).toBeVisible();
	} );

	it( 'still reassures while a finishing stage is merely slow', () => {
		render(
			<InstallProgressCard
				transferStatus={ transferStates.COMPLETE }
				currentStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 45_000 ) );
		expect( screen.getByText( /nothing is wrong/ ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Go to your plugins' } ) ).not.toBeInTheDocument();
	} );

	// Past this point the promise is one we cannot keep: the plugin may never activate.
	it( 'stops promising nothing is wrong once the finishing stage stalls', () => {
		render(
			<InstallProgressCard
				transferStatus={ transferStates.COMPLETE }
				currentStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect( screen.getByText( /taking longer than it should/ ) ).toBeVisible();
		expect( screen.queryByText( /nothing is wrong/ ) ).not.toBeInTheDocument();
	} );

	it( 'offers a way out to the site plugins once stalled', () => {
		render(
			<InstallProgressCard
				transferStatus={ transferStates.COMPLETE }
				currentStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect( screen.getByRole( 'link', { name: 'Go to your plugins' } ) ).toHaveAttribute(
			'href',
			'/plugins/example.wordpress.com'
		);
	} );

	it( 'offers no way out while the transfer itself is unfinished', () => {
		render(
			<InstallProgressCard
				transferStatus={ transferStates.ACTIVE }
				currentStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 300_000 ) );
		expect( screen.queryByRole( 'link', { name: 'Go to your plugins' } ) ).not.toBeInTheDocument();
		expect( screen.getByText( /nothing is wrong/ ) ).toBeVisible();
	} );

	it( 'records the stall once, not on every tick', () => {
		render(
			<InstallProgressCard
				transferStatus={ transferStates.COMPLETE }
				currentStep={ 1 }
				siteSlug="example.wordpress.com"
				productSlug="sensei-pro"
			/>
		);
		act( () => jest.advanceTimersByTime( 45_000 ) );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		act( () => jest.advanceTimersByTime( 50_000 ) );
		act( () => jest.advanceTimersByTime( 30_000 ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_marketplace_install_wait_stalled', {
			product_slug: 'sensei-pro',
		} );
	} );
} );
