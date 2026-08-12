/**
 * @jest-environment jsdom
 */

import { act, render } from '@testing-library/react';
import { SiteGenerationView } from '../view';
import type { SiteGenerationStep } from '../use-site-generation';

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

describe( 'SiteGenerationView', () => {
	it( 'shows an accessible elapsed time for the active step and updates it every second', () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-07T12:00:00Z' ) );

		try {
			const { getByText, rerender } = render(
				<SiteGenerationView
					onRetry={ jest.fn() }
					state={ {
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
					onRetry={ jest.fn() }
					state={ {
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

	it( 'distinguishes a failed build from a timeout', () => {
		const onRetry = jest.fn();
		const { getByRole, getByText, rerender } = render(
			<SiteGenerationView
				onRetry={ onRetry }
				state={ {
					status: 'failed',
					failureReason: 'build-failed',
					steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
				} }
			/>
		);

		expect(
			getByRole( 'heading', { name: 'We couldn’t finish building your site' } )
		).toBeVisible();
		expect( getByText( 'Start a new site brief to try building it again.' ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Start over' } ) ).toBeVisible();

		rerender(
			<SiteGenerationView
				onRetry={ onRetry }
				state={ {
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
				onRetry={ jest.fn() }
				state={ { status: 'working', steps: steps( 0 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Preparing the site' );

		rerender(
			<SiteGenerationView
				onRetry={ jest.fn() }
				state={ { status: 'working', steps: steps( 2 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Building the pages' );

		rerender(
			<SiteGenerationView
				onRetry={ jest.fn() }
				state={ { status: 'failed', failureReason: 'build-failed', steps: steps( 2 ) } }
			/>
		);

		expect(
			getAllByRole( 'status' ).some(
				( region ) => region.textContent?.includes( 'Building the pages' )
			)
		).toBe( false );
	} );
} );
