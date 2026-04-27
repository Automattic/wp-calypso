/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedListEmpty } from '../feed-list-empty';
import type { AtmosphereError } from '@automattic/api-core';

describe( 'FeedListEmpty', () => {
	it( 'renders the empty title and action when there is no error', () => {
		render(
			<FeedListEmpty
				error={ null }
				onRetry={ () => {} }
				emptyTitle="All caught up."
				emptyLine="Follow accounts to see posts."
				emptyActionLabel="Browse Bluesky"
				emptyActionURL="https://bsky.app"
			/>
		);
		expect( screen.getByText( 'All caught up.' ) ).toBeVisible();
		expect( screen.getByText( 'Follow accounts to see posts.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Browse Bluesky' } ) ).toHaveAttribute(
			'href',
			'https://bsky.app'
		);
	} );

	it( 'renders the rate-limited error with a Retry button that calls onRetry', async () => {
		const onRetry = jest.fn();
		const user = userEvent.setup();
		render(
			<FeedListEmpty
				error={ { kind: 'rate_limited', retry_after: 60 } as AtmosphereError }
				onRetry={ onRetry }
				emptyTitle=""
				emptyLine=""
			/>
		);
		expect( screen.getAllByText( /slow down/i ).length ).toBeGreaterThan( 0 );
		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );
		expect( onRetry ).toHaveBeenCalled();
	} );

	it( 'renders the upstream-unavailable error with a Retry button', () => {
		render(
			<FeedListEmpty
				error={ { kind: 'upstream_unavailable' } as AtmosphereError }
				onRetry={ () => {} }
				emptyTitle=""
				emptyLine=""
			/>
		);
		expect( screen.getAllByText( /unreachable/i ).length ).toBeGreaterThan( 0 );
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
	} );

	it( 'renders the auth-required error WITHOUT a Retry button', () => {
		render(
			<FeedListEmpty
				error={ { kind: 'auth_required' } as AtmosphereError }
				onRetry={ () => {} }
				emptyTitle=""
				emptyLine=""
			/>
		);
		expect( screen.getAllByText( /reconnect/i ).length ).toBeGreaterThan( 0 );
		expect( screen.queryByRole( 'button', { name: /retry/i } ) ).toBeNull();
	} );

	it( 'renders the not-found error with a back-to-ATmosphere link', () => {
		render(
			<FeedListEmpty
				error={ { kind: 'not_found' } as AtmosphereError }
				onRetry={ () => {} }
				emptyTitle=""
				emptyLine=""
			/>
		);
		expect( screen.getByRole( 'link', { name: /back to atmosphere/i } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere'
		);
	} );

	it( 'renders the unknown / generic error with a Retry button', () => {
		render(
			<FeedListEmpty
				error={ { kind: 'unknown', cause: null } as AtmosphereError }
				onRetry={ () => {} }
				emptyTitle=""
				emptyLine=""
			/>
		);
		expect( screen.getByText( /something went wrong/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
	} );
} );
