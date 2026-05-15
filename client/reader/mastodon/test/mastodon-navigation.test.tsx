/**
 * @jest-environment jsdom
 */
import { runSocialNavigationContract } from 'calypso/reader/social/test-helpers/social-navigation-contract';
import { MastodonNavigation } from '../mastodon-navigation';

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

runSocialNavigationContract( {
	name: 'MastodonNavigation',
	Component: MastodonNavigation,
	tabs: [
		{
			slug: 'timeline',
			label: 'timeline',
			href: '/reader/mastodon/42/timeline',
		},
		{
			slug: 'notifications',
			label: 'notifications',
			href: '/reader/mastodon/42/notifications',
		},
		{
			slug: 'profile',
			label: 'profile',
			href: '/reader/mastodon/42/profile',
		},
	],
	buildProps: ( selectedTab ) => ( { connectionId: 42, selectedTab } ),
	tracksClick: {
		eventName: 'calypso_reader_mastodon_tab_clicked',
		setup: () => ( {
			getCalls: () => mockRecordReaderTracksEvent.mock.calls,
			reset: () => mockRecordReaderTracksEvent.mockClear(),
		} ),
		buildClickProps: () => ( { connectionId: 42, selectedTab: 'timeline' } ),
		buildExpectedPayload: ( tab ) => ( { connection_id: 42, tab } ),
	},
} );
