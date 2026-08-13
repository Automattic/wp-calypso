/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteGenerationView } from '../view';
import type { SiteGenerationState, SiteGenerationStep } from '../use-site-generation';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component: unknown ) => Component,
	useTranslate: () => ( text: string, options?: { args?: Record< string, string | number > } ) =>
		Object.entries( options?.args ?? {} ).reduce(
			( translated, [ key, value ] ) =>
				translated
					.replace( `%(${ key })s`, String( value ) )
					.replace( `%(${ key })d`, String( value ) ),
			text
		),
} ) );

const idleState = {
	retryBuild: null,
	isRetryingBuild: false,
};

describe( 'SiteGenerationView progress and fallback states', () => {
	it( 'shows an accessible elapsed time for the active step and updates it every second', () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-07T12:00:00Z' ) );

		try {
			const { getByText, rerender } = render(
				<SiteGenerationView
					onReload={ jest.fn() }
					state={ {
						...idleState,
						status: 'working',
						steps: [
							{
								id: 'preparing',
								label: 'Preparing the site',
								status: 'active',
								startedAt: Date.now() - 12000,
							},
						],
					} }
				/>
			);

			expect( getByText( '12s' ) ).toHaveAttribute( 'aria-label', 'Elapsed time: 12s' );
			expect( getByText( '12s' ) ).toHaveAttribute( 'aria-live', 'off' );

			rerender(
				<SiteGenerationView
					onReload={ jest.fn() }
					state={ {
						...idleState,
						status: 'working',
						steps: [
							{
								id: 'preparing',
								label: 'Preparing the site',
								status: 'active',
								startedAt: Date.now() - 192000,
							},
						],
					} }
				/>
			);

			expect( getByText( '3m 12s' ) ).toBeVisible();

			act( () => jest.advanceTimersByTime( 1000 ) );

			expect( getByText( '3m 13s' ) ).toBeVisible();
		} finally {
			jest.useRealTimers();
		}
	} );

	it( 'uses the calm reload fallback for failed builds and timeouts', () => {
		const onReload = jest.fn();
		const { getByRole, getByText, rerender } = render(
			<SiteGenerationView
				onReload={ onReload }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'build-failed',
					steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
				} }
			/>
		);

		expect( getByRole( 'heading', { name: 'This is taking longer than expected' } ) ).toBeVisible();
		expect( getByText( 'Your brief is saved.' ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Check again' } ) ).toBeVisible();

		rerender(
			<SiteGenerationView
				onReload={ onReload }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'timed-out',
					steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
				} }
			/>
		);

		expect( getByRole( 'heading', { name: 'This is taking longer than expected' } ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Check again' } ) ).toBeVisible();
	} );

	it( 'announces the active step, since the step list itself never changes text', () => {
		const labels = [ 'Preparing the site', 'Choosing the design', 'Building the pages' ];
		const steps = ( activeIndex: number ) =>
			labels.map( ( label, index ) => {
				let status: SiteGenerationStep[ 'status' ] = 'idle';
				if ( index < activeIndex ) {
					status = 'done';
				} else if ( index === activeIndex ) {
					status = 'active';
				}
				return { id: `step-${ index }`, label, status };
			} );

		const { getAllByRole, getByRole, rerender } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: steps( 0 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Preparing the site' );

		rerender(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: steps( 2 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Building the pages' );

		rerender(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'build-failed',
					steps: steps( 2 ),
				} }
			/>
		);

		expect(
			getAllByRole( 'status' ).some(
				( region ) => region.textContent?.includes( 'Building the pages' )
			)
		).toBe( false );
	} );
} );

const failedState: SiteGenerationState = {
	status: 'failed',
	failureReason: 'build-failed',
	failureLabel: 'We couldn’t finish building your site',
	failureDetail: 'You can start the build again right away.',
	steps: [],
	retryBuild: jest.fn(),
	isRetryingBuild: false,
};

describe( 'SiteGenerationView server recovery', () => {
	it( 'renders the server failure copy and starts the rebuild', async () => {
		const retryBuild = jest.fn();
		render(
			<SiteGenerationView state={ { ...failedState, retryBuild } } onReload={ jest.fn() } />
		);

		expect( screen.getByText( 'We couldn’t finish building your site' ) ).toBeVisible();
		expect( screen.getByText( 'You can start the build again right away.' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Start again' } ) );
		expect( retryBuild ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to reload when no server retry is offered', async () => {
		const onReload = jest.fn();
		render(
			<SiteGenerationView state={ { ...failedState, retryBuild: null } } onReload={ onReload } />
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Check again' } ) );
		expect( onReload ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the timed-out copy when the ui block carried no text', () => {
		render(
			<SiteGenerationView
				state={ {
					...failedState,
					failureReason: 'timed-out',
					failureLabel: undefined,
					failureDetail: undefined,
					retryBuild: null,
				} }
				onReload={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'This is taking longer than expected' ) ).toBeVisible();
		expect( screen.getByText( 'Your brief is saved.' ) ).toBeVisible();
	} );

	it( 'disables the rebuild button while the retry request is in flight', () => {
		render(
			<SiteGenerationView
				state={ { ...failedState, isRetryingBuild: true } }
				onReload={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Start again' } ) ).toBeDisabled();
	} );
} );
