/**
 * @jest-environment jsdom
 */
import { runSocialNavigationContract } from 'calypso/reader/social/test-helpers/social-navigation-contract';
import { FediverseNavigation } from '../fediverse-navigation';

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

runSocialNavigationContract( {
	name: 'FediverseNavigation',
	Component: FediverseNavigation,
	// Note: no Notifications tab — fediverse intentionally ships only Timeline and
	// Profile, and the contract's `toHaveLength` check guards against any future
	// Settings/Notifications dead nav item leaking back in.
	tabs: [
		{
			slug: 'timeline',
			label: 'Timeline',
			href: '/reader/fediverse/7/timeline',
		},
		{
			slug: 'profile',
			label: 'Profile',
			href: '/reader/fediverse/7/profile',
		},
	],
	buildProps: ( selectedTab ) => ( { connectionId: 7, selectedTab } ),
	tracksClick: {
		eventName: 'calypso_reader_fediverse_tab_clicked',
		setup: () => ( {
			getCalls: () => mockRecordReaderTracksEvent.mock.calls,
			reset: () => mockRecordReaderTracksEvent.mockClear(),
		} ),
		buildClickProps: () => ( { connectionId: 7, selectedTab: 'timeline' } ),
		buildExpectedPayload: ( tab ) => ( { connection_id: 7, tab } ),
	},
} );
