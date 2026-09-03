/**
 * @jest-environment jsdom
 */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import TransferWaitCard from '../card';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'TransferWaitCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-17T10:00:00Z' ) );
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'narrates the preparing stage', () => {
		render( <TransferWaitCard transferStatus={ transferStates.ACTIVE } fallbackStep={ 1 } /> );
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'preparing a dedicated server for your site'
		);
	} );
	it( 'narrates the moving stage', () => {
		render( <TransferWaitCard transferStatus={ transferStates.RELOCATING } fallbackStep={ 1 } /> );
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'moving your site to the new server'
		);
	} );

	it( 'narrates the finishing stage', () => {
		render( <TransferWaitCard transferStatus={ transferStates.COMPLETE } fallbackStep={ 1 } /> );
		expect( screen.getByRole( 'status' ).textContent ).toContain( 'Finishing up' );
	} );

	it( 'uses site copy for a hosting transfer', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
				isPluginInstall={ false }
			/>
		);
		expect( screen.getByText( 'Setting up your site' ) ).toBeVisible();
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'making sure your site is ready'
		);
		expect(
			screen.getByText( 'Your site is ready to use once the transfer is complete.' )
		).toBeVisible();
	} );

	it( 'renders a determinate progress bar labeled with the current stage', () => {
		render( <TransferWaitCard transferStatus={ transferStates.ACTIVE } fallbackStep={ 1 } /> );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute(
			'aria-label',
			'Preparing a dedicated server for your site'
		);
	} );

	it( 'does not show the overrun line before a stage runs long', () => {
		render( <TransferWaitCard transferStatus={ transferStates.ACTIVE } fallbackStep={ 1 } /> );
		act( () => jest.advanceTimersByTime( 30_000 ) );
		expect( screen.queryByText( /taking longer than usual/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows the overrun line once a stage runs well past its typical duration', () => {
		render( <TransferWaitCard transferStatus={ transferStates.ACTIVE } fallbackStep={ 1 } /> );
		act( () => jest.advanceTimersByTime( 45_000 ) );
		expect( screen.getByText( /taking longer than usual/ ) ).toBeVisible();
	} );

	it( 'still reassures while a finishing stage is merely slow', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
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
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect( screen.getByText( /taking longer than it should/ ) ).toBeVisible();
		expect( screen.queryByText( /nothing is wrong/ ) ).not.toBeInTheDocument();
	} );

	it( 'offers a way out to the site plugins once stalled', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect( screen.getByRole( 'link', { name: 'Go to your plugins' } ) ).toHaveAttribute(
			'href',
			'/plugins/example.wordpress.com'
		);
	} );

	it( 'never mentions a plugin when the wait is a site transfer', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
				siteSlug="example.wordpress.com"
				isPluginInstall={ false }
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect(
			screen.getByText( 'This is taking longer than it should. Your site is ready to use.' )
		).toBeVisible();
		expect(
			screen.queryByText( /your plugin may still finish installing/ )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com'
		);
	} );

	it( 'offers no way out while the transfer itself is unfinished', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.ACTIVE }
				fallbackStep={ 1 }
				siteSlug="example.wordpress.com"
			/>
		);
		act( () => jest.advanceTimersByTime( 300_000 ) );
		expect( screen.queryByRole( 'link', { name: 'Go to your plugins' } ) ).not.toBeInTheDocument();
		expect( screen.getByText( /nothing is wrong/ ) ).toBeVisible();
	} );

	it( 'records the stall once, not on every tick', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
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

	it( 'records a site transfer stall under its own event, with no product slug', () => {
		render(
			<TransferWaitCard
				transferStatus={ transferStates.COMPLETE }
				fallbackStep={ 1 }
				siteSlug="example.wordpress.com"
				isPluginInstall={ false }
			/>
		);
		act( () => jest.advanceTimersByTime( 95_000 ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_site_transfer_wait_stalled', {} );

		fireEvent.click( screen.getByRole( 'link', { name: 'Go to your site' } ) );
		expect( recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_site_transfer_wait_stalled_click',
			{ stage_seconds: expect.any( Number ) }
		);
	} );
} );
