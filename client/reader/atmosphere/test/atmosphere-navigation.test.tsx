/**
 * @jest-environment jsdom
 */
import { runSocialNavigationContract } from 'calypso/reader/social/test-helpers/social-navigation-contract';
import { AtmosphereNavigation } from '../atmosphere-navigation';

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

runSocialNavigationContract( {
	name: 'AtmosphereNavigation',
	Component: AtmosphereNavigation,
	tabs: [
		{
			slug: 'timeline',
			label: 'timeline',
			href: '/reader/atmosphere/42/timeline',
		},
		{
			slug: 'notifications',
			label: 'notifications',
			href: '/reader/atmosphere/42/notifications',
		},
		{
			slug: 'profile',
			label: 'profile',
			href: '/reader/atmosphere/42/profile',
		},
	],
	buildProps: ( selectedTab ) => ( { connectionId: 42, selectedTab } ),
	tracksClick: {
		eventName: 'calypso_reader_atmosphere_tab_clicked',
		setup: () => ( {
			getCalls: () => mockRecordReaderTracksEvent.mock.calls,
			reset: () => mockRecordReaderTracksEvent.mockClear(),
		} ),
		buildClickProps: () => ( { connectionId: 42, selectedTab: 'timeline' } ),
		buildExpectedPayload: ( tab ) => ( { connection_id: 42, tab } ),
	},
} );
