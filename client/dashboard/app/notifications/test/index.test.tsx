/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { useQuery } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { vi, type MockedFunction } from 'vitest';
import { logToLogstash } from 'calypso/lib/logstash';
import { bumpStat } from '../../analytics';
import { useAuth } from '../../auth';
import { omnibarEvents } from '../../omnibar/events';
import Notifications from '../index';

type Candidate = {
	targetSiteId: number;
	type: 'follow';
	receivedAt: number;
	wasVisibleAtReceipt: boolean;
};

const mockUseQuery = useQuery as MockedFunction< typeof useQuery >;
const mockUseAuth = useAuth as MockedFunction< typeof useAuth >;
const mockSitesQuery = vi.fn();
const mockSubscribeSubscriberNotifications = vi.fn();
const mockSubscribeUnseenCount = vi.fn();
const mockUnsubscribe = vi.fn();
const mockUser = { ID: 1, has_unseen_notes: false };
let mockOnNotificationCount: ( count: number ) => void = () => {};
let mockOnConfirmed: ( candidate: Candidate ) => boolean | void = () => {};
let mockAlertCallbacks: {
	onSound: ( result: string, candidate: Candidate ) => void;
	onError: ( error: unknown, stage: string ) => void;
};
const mockRecordTracksEvent = vi.fn();

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: Object.assign(
		vi.fn( () => 'test-env' ),
		{ isEnabled: vi.fn() }
	),
} ) );
vi.mock( '@automattic/calypso-sentry', () => ( { captureException: vi.fn() } ) );
vi.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: vi.fn( () => Promise.resolve() ),
} ) );
vi.mock( '../../analytics', () => ( {
	bumpStat: vi.fn(),
	useAnalytics: () => ( { recordTracksEvent: mockRecordTracksEvent } ),
} ) );
vi.mock( '@tanstack/react-query', () => ( {
	useMutation: vi.fn( () => ( { mutateAsync: vi.fn() } ) ),
	useQuery: vi.fn(),
} ) );
vi.mock( '@automattic/api-queries', () => ( {
	userPreferenceQuery: vi.fn( ( key ) => ( { queryKey: [ key ] } ) ),
	userPreferencesMutation: vi.fn( () => ( {} ) ),
	sitesQuery: ( ...args: unknown[] ) => mockSitesQuery( ...args ),
} ) );
vi.mock( '../../auth', () => ( { useAuth: vi.fn() } ) );
vi.mock( '../../help-center', () => ( {
	useHelpCenter: vi.fn( () => ( { isShown: false, setShowHelpCenter: vi.fn() } ) ),
} ) );
vi.mock( '../../locale', () => ( { useLocale: vi.fn( () => 'en' ) } ) );
vi.mock( '../../omnibar/events', () => ( {
	omnibarEvents: {
		notificationsOpen: { emit: vi.fn() },
		notificationsUnseenCount: { emit: vi.fn() },
		notificationsSubscriberReceived: { emit: vi.fn() },
	},
	useOmnibarEvent: vi.fn(),
} ) );
vi.mock( '@wordpress/components', () => ( {
	Button: vi.fn( () => null ),
	Dropdown: vi.fn( () => null ),
} ) );
vi.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( component: unknown ) => component,
	useViewportMatch: vi.fn( () => false ),
} ) );
vi.mock( '@wordpress/i18n', () => ( { __: ( value: string ) => value } ) );
vi.mock( '@wordpress/icons', () => ( { bell: {}, bellUnread: {} } ) );
vi.mock( 'calypso/lib/wp', () => ( { __esModule: true, default: {} } ) );
vi.mock( '@automattic/notifications/src/app/subscriber-notifications', () => ( {
	subscribeSubscriberNotifications: mockSubscribeSubscriberNotifications,
} ) );
vi.mock( '@automattic/notifications/src/app/client', () => ( {
	subscribeUnseenCount: mockSubscribeUnseenCount,
} ) );

const configure = ( featureEnabled: boolean, preferenceEnabled: boolean ) => {
	vi.mocked( config.isEnabled ).mockImplementation(
		( key ) => key === 'notifications/subscriber-alerts' && featureEnabled
	);
	mockUseQuery.mockImplementation( ( options ) => {
		const queryOptions = options as { queryKey?: string[] };
		if ( queryOptions.queryKey?.[ 0 ] === 'notifications-subscriber-alerts-enabled' ) {
			return {
				data: preferenceEnabled,
				isSuccess: true,
				isFetching: false,
				isFetchedAfterMount: true,
				isError: false,
			} as ReturnType< typeof useQuery >;
		}
		return {} as ReturnType< typeof useQuery >;
	} );
	mockUseAuth.mockReturnValue( {
		user: mockUser,
	} as ReturnType< typeof useAuth > );
	mockSubscribeSubscriberNotifications.mockImplementation(
		( _wpcom, onCount, onConfirmed, callbacks ) => {
			mockOnNotificationCount = onCount;
			mockOnConfirmed = onConfirmed;
			mockAlertCallbacks = callbacks;
			return mockUnsubscribe;
		}
	);
	mockSubscribeUnseenCount.mockReturnValue( mockUnsubscribe );
};

const candidate = (): Candidate => ( {
	targetSiteId: 9001,
	type: 'follow',
	receivedAt: Date.now(),
	wasVisibleAtReceipt: true,
} );

describe( 'Notifications subscriber alerts', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockUser.ID = 1;
		mockOnNotificationCount = () => {};
		mockOnConfirmed = () => {};
	} );

	it( 'keeps unseen-count updates without monitoring subscriber notes when the feature flag is off', async () => {
		configure( false, true );
		render( <Notifications /> );

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		const subscriberPreferencesQuery = mockUseQuery.mock.calls
			.map( ( [ options ] ) => options as { enabled?: boolean; queryKey?: string[] } )
			.find( ( options ) => options.queryKey?.[ 0 ] === 'notifications-subscriber-alerts-enabled' );
		expect( subscriberPreferencesQuery?.enabled ).toBe( false );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
		expect( mockSitesQuery ).not.toHaveBeenCalled();
	} );

	it( 'keeps unseen-count updates without monitoring subscriber notes when the preference is off', async () => {
		configure( true, false );
		render( <Notifications /> );

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
		expect( mockSitesQuery ).not.toHaveBeenCalled();
	} );

	it( 'monitors live subscriber notes without making site-count requests and keeps count updates immediate', async () => {
		configure( true, true );
		render( <Notifications /> );

		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const notification = candidate();

		act( () => {
			mockOnNotificationCount( 3 );
			mockOnConfirmed( notification );
		} );

		expect( omnibarEvents.notificationsUnseenCount.emit ).toHaveBeenCalledWith( 3 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).toHaveBeenCalledTimes( 1 );
		expect( mockSitesQuery ).not.toHaveBeenCalled();
	} );

	it( 'records the sound result of a subscriber alert', async () => {
		configure( true, true );
		render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		act( () => mockAlertCallbacks.onSound( 'played', candidate() ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_notifications_subscriber_alert',
			{ sound_result: 'played' }
		);
	} );

	it( 'logs sound errors to logstash', async () => {
		configure( true, true );
		render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		mockAlertCallbacks.onError( new DOMException( 'blocked', 'NotAllowedError' ), 'resume' );

		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				message: 'blocked',
				tags: [ 'dashboard', 'subscriber-alerts' ],
				properties: expect.objectContaining( {
					stage: 'resume',
					error_name: 'NotAllowedError',
					env_id: 'test-env',
				} ),
			} )
		);
	} );

	it( 'does not record sound results that every tab or burst would repeat', async () => {
		configure( true, true );
		render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		act( () => {
			mockAlertCallbacks.onSound( 'hidden', candidate() );
			mockAlertCallbacks.onSound( 'cooldown', candidate() );
			mockAlertCallbacks.onSound( 'disposed', candidate() );
		} );

		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'reports a failure to start monitoring subscriber notes to Sentry', async () => {
		configure( true, true );
		mockSubscribeSubscriberNotifications.mockImplementationOnce( () => {
			throw new Error( 'init failed' );
		} );
		render( <Notifications /> );

		await waitFor( () =>
			expect( captureException ).toHaveBeenCalledWith(
				expect.objectContaining( { message: 'init failed' } ),
				{ tags: { calypso_section: 'dashboard', notifications_stage: 'subscriber_alerts' } }
			)
		);
	} );

	it( 'counts chunk load failures instead of reporting them', async () => {
		configure( true, true );
		mockSubscribeSubscriberNotifications.mockImplementationOnce( () => {
			throw Object.assign( new Error( 'Loading chunk 123 failed' ), { name: 'ChunkLoadError' } );
		} );
		render( <Notifications /> );

		await waitFor( () =>
			expect( bumpStat ).toHaveBeenCalledWith(
				'dashboard-notifications-chunk',
				'subscriber_alerts'
			)
		);
		expect( captureException ).not.toHaveBeenCalled();
	} );

	it( 'does not trust a cached preference until the server answers', async () => {
		configure( true, true );
		mockUseQuery.mockImplementation(
			() =>
				( {
					data: true,
					isSuccess: true,
					isFetching: true,
					isFetchedAfterMount: false,
					isError: false,
				} ) as ReturnType< typeof useQuery >
		);
		render( <Notifications /> );

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
	} );

	it( 'stops monitoring subscriber notes when the preference refetch fails', async () => {
		configure( true, true );
		mockUseQuery.mockImplementation(
			() =>
				( {
					data: true,
					isSuccess: false,
					isFetching: false,
					isFetchedAfterMount: true,
					isError: true,
				} ) as ReturnType< typeof useQuery >
		);
		render( <Notifications /> );

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
	} );

	it( 'reports a failure to start the unseen count to Sentry', async () => {
		configure( false, false );
		mockSubscribeUnseenCount.mockImplementationOnce( () => {
			throw new Error( 'init failed' );
		} );
		render( <Notifications /> );

		await waitFor( () =>
			expect( captureException ).toHaveBeenCalledWith(
				expect.objectContaining( { message: 'init failed' } ),
				{ tags: { calypso_section: 'dashboard', notifications_stage: 'unseen_count' } }
			)
		);
	} );

	it( 'keeps the subscription while the preference refetches on focus', async () => {
		configure( true, true );
		const { rerender } = render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		mockUseQuery.mockImplementation(
			() =>
				( {
					data: true,
					isSuccess: true,
					isFetching: true,
					isFetchedAfterMount: true,
					isError: false,
				} ) as ReturnType< typeof useQuery >
		);
		rerender( <Notifications /> );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 );
		expect( mockUnsubscribe ).not.toHaveBeenCalled();
	} );

	it( 'does not record a sound result after unmount', async () => {
		configure( true, true );
		const { unmount } = render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		unmount();
		mockAlertCallbacks.onSound( 'played', candidate() );

		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'ignores a note whose live push predates enabling the preference', async () => {
		configure( true, true );
		render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		let shouldAlert: boolean | void = undefined;
		act( () => {
			shouldAlert = mockOnConfirmed( { ...candidate(), receivedAt: 0 } );
		} );

		expect( shouldAlert ).toBe( false );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	it( 'ignores a delayed note callback after an account switch', async () => {
		configure( true, true );
		const { rerender } = render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;

		mockUser.ID = 2;
		rerender( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 2 )
		);
		act( () => oldOnConfirmed( candidate() ) );

		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	it( 'ignores a delayed note callback after the preference is disabled', async () => {
		configure( true, true );
		const { rerender } = render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;

		configure( true, false );
		rerender( <Notifications /> );
		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		act( () => oldOnConfirmed( candidate() ) );

		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	it( 'ignores a delayed note callback after unmount', async () => {
		configure( true, true );
		const { unmount } = render( <Notifications /> );
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;

		unmount();
		act( () => oldOnConfirmed( candidate() ) );

		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	it( 'does not create duplicate subscriptions during StrictMode setup and cleanup', async () => {
		configure( true, true );
		const { unmount } = render(
			<StrictMode>
				<Notifications />
			</StrictMode>
		);
		await waitFor( () => expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalled() );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 );
		unmount();
		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
	} );
} );
