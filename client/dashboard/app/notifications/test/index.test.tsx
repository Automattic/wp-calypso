/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { useQuery } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
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

const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;
const mockUseAuth = useAuth as jest.MockedFunction< typeof useAuth >;
const mockSitesQuery = jest.fn();
const mockSubscribeSubscriberNotifications = jest.fn();
const mockSubscribeUnseenCount = jest.fn();
const mockUnsubscribe = jest.fn();
const mockUser = { ID: 1, has_unseen_notes: false };
let mockOnNotificationCount: ( count: number ) => void = () => {};
let mockOnConfirmed: ( candidate: Candidate ) => boolean | void = () => {};
let mockAlertCallbacks: {
	onSound: ( result: string, candidate: Candidate ) => void;
	onError: ( error: unknown, stage: string ) => void;
};
const mockRecordTracksEvent = jest.fn();

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: Object.assign(
		jest.fn( () => 'test-env' ),
		{ isEnabled: jest.fn() }
	),
} ) );
jest.mock( '@automattic/calypso-sentry', () => ( { captureException: jest.fn() } ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );
jest.mock( '../../analytics', () => ( {
	bumpStat: jest.fn(),
	useAnalytics: () => ( { recordTracksEvent: mockRecordTracksEvent } ),
} ) );
jest.mock( '@tanstack/react-query', () => ( {
	useMutation: jest.fn( () => ( { mutateAsync: jest.fn() } ) ),
	useQuery: jest.fn(),
} ) );
jest.mock( '@automattic/api-queries', () => ( {
	userPreferenceQuery: jest.fn( ( key ) => ( { queryKey: [ key ] } ) ),
	userPreferencesMutation: jest.fn( () => ( {} ) ),
	sitesQuery: ( ...args: unknown[] ) => mockSitesQuery( ...args ),
} ) );
jest.mock( '../../auth', () => ( { useAuth: jest.fn() } ) );
jest.mock( '../../help-center', () => ( {
	useHelpCenter: jest.fn( () => ( { isShown: false, setShowHelpCenter: jest.fn() } ) ),
} ) );
jest.mock( '../../locale', () => ( { useLocale: jest.fn( () => 'en' ) } ) );
jest.mock( '../../omnibar/events', () => ( {
	omnibarEvents: {
		notificationsOpen: { emit: jest.fn() },
		notificationsUnseenCount: { emit: jest.fn() },
		notificationsSubscriberReceived: { emit: jest.fn() },
	},
	useOmnibarEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: jest.fn( () => null ),
	Dropdown: jest.fn( () => null ),
} ) );
jest.mock( '@wordpress/compose', () => ( {
	createHigherOrderComponent: ( component: unknown ) => component,
	useViewportMatch: jest.fn( () => false ),
} ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( value: string ) => value } ) );
jest.mock( '@wordpress/icons', () => ( { bell: {}, bellUnread: {} } ) );
jest.mock( 'calypso/lib/wp', () => ( { __esModule: true, default: {} } ) );
jest.mock(
	'@automattic/notifications/src/app/subscriber-notifications',
	() => ( { subscribeSubscriberNotifications: mockSubscribeSubscriberNotifications } ),
	{ virtual: true }
);
jest.mock(
	'@automattic/notifications/src/app/client',
	() => ( { subscribeUnseenCount: mockSubscribeUnseenCount } ),
	{ virtual: true }
);

const configure = ( featureEnabled: boolean, preferenceEnabled: boolean ) => {
	jest
		.mocked( config.isEnabled )
		.mockImplementation( ( key ) => key === 'notifications/subscriber-alerts' && featureEnabled );
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
		jest.clearAllMocks();
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
