/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock, type MockInstance, vi } from 'vitest';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AuthorProfileHeader } from '../author-profile-header';

vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: vi.fn(),
} ) );

const pageMock = page as unknown as Mock;

describe( 'AuthorProfileHeader (shared)', () => {
	let backSpy: MockInstance;
	let lengthSpy: MockInstance;

	beforeEach( () => {
		pageMock.mockClear();
		backSpy = vi.spyOn( window.history, 'back' ).mockImplementation( () => {} );
		// Default to a freshly-loaded-tab state; individual tests override.
		lengthSpy = vi.spyOn( window.history, 'length', 'get' ).mockReturnValue( 1 );
	} );

	afterEach( () => {
		backSpy.mockRestore();
		lengthSpy.mockRestore();
	} );

	it( 'falls back to the timelineUrl when there is no prior history (deep link)', async () => {
		const user = userEvent.setup();
		renderWithProvider( <AuthorProfileHeader timelineUrl="/reader/mastodon/7/timeline" /> );
		await user.click( screen.getByRole( 'button' ) );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/mastodon/7/timeline' );
		expect( backSpy ).not.toHaveBeenCalled();
	} );

	it( 'uses window.history.back() when there is prior in-app history', async () => {
		lengthSpy.mockReturnValue( 5 );
		const user = userEvent.setup();
		renderWithProvider( <AuthorProfileHeader timelineUrl="/reader/atmosphere/9/timeline" /> );
		await user.click( screen.getByRole( 'button' ) );
		expect( backSpy ).toHaveBeenCalledTimes( 1 );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'fires onBackToTimeline callback in the deep-link branch', async () => {
		const user = userEvent.setup();
		const onBack = vi.fn();
		renderWithProvider(
			<AuthorProfileHeader
				timelineUrl="/reader/atmosphere/9/timeline"
				onBackToTimeline={ onBack }
			/>
		);
		await user.click( screen.getByRole( 'button' ) );
		expect( onBack ).toHaveBeenCalledTimes( 1 );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/9/timeline' );
	} );

	it( 'fires onBackToTimeline callback in the in-app-history branch', async () => {
		lengthSpy.mockReturnValue( 3 );
		const user = userEvent.setup();
		const onBack = vi.fn();
		renderWithProvider(
			<AuthorProfileHeader
				timelineUrl="/reader/atmosphere/9/timeline"
				onBackToTimeline={ onBack }
			/>
		);
		await user.click( screen.getByRole( 'button' ) );
		expect( onBack ).toHaveBeenCalledTimes( 1 );
		expect( backSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
