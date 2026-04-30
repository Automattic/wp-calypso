/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AuthorProfileHeader } from '../author-profile-header';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const pageMock = page as unknown as jest.Mock;

describe( 'AuthorProfileHeader (shared)', () => {
	beforeEach( () => pageMock.mockClear() );

	it( 'navigates to the timelineUrl on click', async () => {
		const user = userEvent.setup();
		renderWithProvider( <AuthorProfileHeader timelineUrl="/reader/mastodon/7/timeline" /> );
		await user.click( screen.getByRole( 'button' ) );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/mastodon/7/timeline' );
	} );

	it( 'fires onBackToTimeline callback before navigating', async () => {
		const user = userEvent.setup();
		const onBack = jest.fn();
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
} );
