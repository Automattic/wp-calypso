/**
 * @jest-environment jsdom
 */
import { userPreferenceQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import nock from 'nock';
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

const mockUseAuth = useAuth as jest.MockedFunction< typeof useAuth >;
const mockSubscribeSubscriberNotifications = jest.fn();
const mockSubscribeUnseenCount = jest.fn();
const mockUnsubscribe = jest.fn();
const mockUnsubscribeUnseenCount = jest.fn();
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

const preferencesQueryKey = userPreferenceQuery(
	'notifications-subscriber-alerts-enabled'
).queryKey;
let queryClient: QueryClient;
let unmatchedRequests: string[];
const recordUnmatchedRequest = ( req: { path?: string } ) => {
	unmatchedRequests.push( req.path ?? '' );
};

/**
 * A request reaches nock a macrotask after it starts, so wait one before checking.
 */
async function expectNoUnmatchedRequests() {
	await act( () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) ) );
	expect( unmatchedRequests ).toEqual( [] );
}

function mockPreferences( preferenceEnabled: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, {
			calypso_preferences: { 'notifications-subscriber-alerts-enabled': preferenceEnabled },
		} );
}

/**
 * Holds the preferences response back until `release()` is called, to keep the query fetching.
 */
function mockPendingPreferences( preferenceEnabled: boolean ) {
	let release = () => {};
	const released = new Promise< void >( ( resolve ) => {
		release = resolve;
	} );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( async () => {
			await released;
			return [
				200,
				{ calypso_preferences: { 'notifications-subscriber-alerts-enabled': preferenceEnabled } },
			];
		} );
	return release;
}

function seedPreferences( preferenceEnabled: boolean ) {
	queryClient.setQueryData( preferencesQueryKey, {
		'notifications-subscriber-alerts-enabled': preferenceEnabled,
	} );
}

function Wrapper( { children }: { children: React.ReactNode } ) {
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

function renderNotifications( ui = <Notifications /> ) {
	return render( ui, { wrapper: Wrapper } );
}

const configure = ( featureEnabled: boolean, preferenceEnabled?: boolean ) => {
	jest
		.mocked( config.isEnabled )
		.mockImplementation( ( key ) => key === 'notifications/subscriber-alerts' && featureEnabled );
	const preferences =
		preferenceEnabled === undefined ? undefined : mockPreferences( preferenceEnabled );
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
	mockSubscribeUnseenCount.mockReturnValue( mockUnsubscribeUnseenCount );
	return preferences;
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
		// Reset before mounting: resetting it under a mounted client counts as a focus and refetches.
		focusManager.setFocused( undefined );
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		unmatchedRequests = [];
		nock.emitter.on( 'no match', recordUnmatchedRequest );
	} );

	afterEach( () => {
		nock.emitter.off( 'no match', recordUnmatchedRequest );
		nock.cleanAll();
	} );

	test( 'keeps unseen-count updates without monitoring subscriber notes when the feature flag is off', async () => {
		const preferences = configure( false, true );
		renderNotifications();

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( preferences?.isDone() ).toBe( false );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
		await expectNoUnmatchedRequests();
	} );

	test( 'keeps unseen-count updates without monitoring subscriber notes when the preference is off', async () => {
		const preferences = configure( true, false );
		renderNotifications();

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		await waitFor( () => expect( preferences?.isDone() ).toBe( true ) );
		await waitFor( () => expect( queryClient.isFetching() ).toBe( 0 ) );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();
		await expectNoUnmatchedRequests();
	} );

	test( 'monitors live subscriber notes without making site-count requests and keeps count updates immediate', async () => {
		configure( true, true );
		renderNotifications();

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
		await expectNoUnmatchedRequests();
	} );

	test( 'records the sound result of a subscriber alert', async () => {
		configure( true, true );
		renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		act( () => mockAlertCallbacks.onSound( 'played', candidate() ) );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_notifications_subscriber_alert',
			{ sound_result: 'played' }
		);
	} );

	test( 'logs sound errors to logstash', async () => {
		configure( true, true );
		renderNotifications();
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

	test( 'does not record sound results that every tab or burst would repeat', async () => {
		configure( true, true );
		renderNotifications();
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

	test( 'reports a failure to start monitoring subscriber notes to Sentry', async () => {
		configure( true, true );
		mockSubscribeSubscriberNotifications.mockImplementationOnce( () => {
			throw new Error( 'init failed' );
		} );
		renderNotifications();

		await waitFor( () =>
			expect( captureException ).toHaveBeenCalledWith(
				expect.objectContaining( { message: 'init failed' } ),
				{ tags: { calypso_section: 'dashboard', notifications_stage: 'subscriber_alerts' } }
			)
		);
	} );

	test( 'counts chunk load failures instead of reporting them', async () => {
		configure( true, true );
		mockSubscribeSubscriberNotifications.mockImplementationOnce( () => {
			throw Object.assign( new Error( 'Loading chunk 123 failed' ), { name: 'ChunkLoadError' } );
		} );
		renderNotifications();

		await waitFor( () =>
			expect( bumpStat ).toHaveBeenCalledWith(
				'dashboard-notifications-chunk',
				'subscriber_alerts'
			)
		);
		expect( captureException ).not.toHaveBeenCalled();
	} );

	test( 'does not trust a cached preference until the server answers', async () => {
		configure( true );
		seedPreferences( true );
		const release = mockPendingPreferences( true );
		renderNotifications();

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( mockSubscribeSubscriberNotifications ).not.toHaveBeenCalled();

		release();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
	} );

	test( 'stops monitoring subscriber notes when the preference refetch fails', async () => {
		configure( true, true );
		renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;
		mockSubscribeUnseenCount.mockClear();

		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/preferences' ).reply( 500 );
		act( () => {
			queryClient.refetchQueries( { queryKey: preferencesQueryKey } );
		} );

		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 1 ) );
		expect( queryClient.getQueryState( preferencesQueryKey )?.status ).toBe( 'error' );
		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		act( () => oldOnConfirmed( candidate() ) );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	test( 'reports a failure to start the unseen count to Sentry', async () => {
		configure( false, false );
		mockSubscribeUnseenCount.mockImplementationOnce( () => {
			throw new Error( 'init failed' );
		} );
		renderNotifications();

		await waitFor( () =>
			expect( captureException ).toHaveBeenCalledWith(
				expect.objectContaining( { message: 'init failed' } ),
				{ tags: { calypso_section: 'dashboard', notifications_stage: 'unseen_count' } }
			)
		);
	} );

	test( 'keeps the subscription while the preference refetches on focus', async () => {
		configure( true, true );
		renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		const release = mockPendingPreferences( true );
		act( () => focusManager.setFocused( true ) );
		await waitFor( () => expect( queryClient.isFetching() ).toBe( 1 ) );

		expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 );
		expect( mockUnsubscribe ).not.toHaveBeenCalled();

		release();
		await waitFor( () => expect( queryClient.isFetching() ).toBe( 0 ) );
		expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 );
		expect( mockUnsubscribe ).not.toHaveBeenCalled();
	} );

	test( 'does not record a sound result after unmount', async () => {
		configure( true, true );
		const { unmount } = renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);

		unmount();
		mockAlertCallbacks.onSound( 'played', candidate() );

		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'ignores a note whose live push predates enabling the preference', async () => {
		configure( true, true );
		renderNotifications();
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

	test( 'ignores a delayed note callback after an account switch', async () => {
		configure( true, true );
		const { rerender } = renderNotifications();
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

	test( 'ignores a delayed note callback after the preference is disabled', async () => {
		configure( true, true );
		renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;

		act( () => seedPreferences( false ) );
		// Once while the preference loads, then again when it is disabled.
		await waitFor( () => expect( mockSubscribeUnseenCount ).toHaveBeenCalledTimes( 2 ) );
		act( () => oldOnConfirmed( candidate() ) );

		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	test( 'ignores a delayed note callback after unmount', async () => {
		configure( true, true );
		const { unmount } = renderNotifications();
		await waitFor( () =>
			expect( mockSubscribeSubscriberNotifications ).toHaveBeenCalledTimes( 1 )
		);
		const oldOnConfirmed = mockOnConfirmed;

		unmount();
		act( () => oldOnConfirmed( candidate() ) );

		expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( omnibarEvents.notificationsSubscriberReceived.emit ).not.toHaveBeenCalled();
	} );

	test( 'does not create duplicate subscriptions during StrictMode setup and cleanup', async () => {
		configure( true, true );
		const { unmount } = renderNotifications(
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
