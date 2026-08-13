/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteGenerationView } from '../view';
import type { SiteGenerationState } from '../use-site-generation';

const failedState: SiteGenerationState = {
	status: 'failed',
	failureReason: 'build-failed',
	failureLabel: 'We couldn’t finish building your site',
	failureDetail: 'You can start the build again right away.',
	steps: [],
	retryBuild: jest.fn(),
	isRetryingBuild: false,
};

describe( 'SiteGenerationView', () => {
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

	it( 'falls back to the reload affordance when no retry is offered', async () => {
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
