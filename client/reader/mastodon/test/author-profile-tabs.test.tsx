/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonAuthorProfileTabs } from '../author-profile-tabs';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

// NavTabs uses IntersectionObserver which jsdom does not provide.
beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

beforeEach( () => {
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	jest.mocked( page.replace ).mockReset();
} );

afterEach( () => jest.restoreAllMocks() );

describe( 'MastodonAuthorProfileTabs', () => {
	it( 'navigates to /reader/mastodon/<id>/profile/<actor>?tab=<slug> on click', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<MastodonAuthorProfileTabs
				connectionId={ 7 }
				actor="108020"
				basePath="/reader/mastodon/7/profile/108020"
				activeFilter="posts_no_replies"
			/>
		);
		await user.click( screen.getByRole( 'menuitem', { name: 'Media' } ) );
		expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/7/profile/108020?tab=media' );
	} );

	it( 'fires calypso_reader_mastodon_profile_filter_changed with from/to filter values', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<MastodonAuthorProfileTabs
				connectionId={ 7 }
				actor="108020"
				basePath="/reader/mastodon/7/profile/108020"
				activeFilter="posts_no_replies"
			/>
		);
		await user.click( screen.getByRole( 'menuitem', { name: 'Replies' } ) );
		expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_profile_filter_changed',
			{
				connection_id: 7,
				actor: '108020',
				from_filter: 'posts_no_replies',
				to_filter: 'posts_with_replies',
			}
		);
	} );
} );
