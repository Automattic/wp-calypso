/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import InstallProgressCard from '../card';

describe( 'InstallProgressCard', () => {
	beforeEach( () => {
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
} );
