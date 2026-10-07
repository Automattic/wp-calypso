/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
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

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: jest.fn() },
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
				isError: false,
			} as ReturnType< typeof useQuery >;
		}
		return {} as ReturnType< typeof useQuery >;
	} );
	mockUseAuth.mockReturnValue( {
		user: mockUser,
	} as ReturnType< typeof useAuth > );
	mockSubscribeSubscriberNotifications.mockImplementation( ( _wpcom, onCount, onConfirmed ) => {
		mockOnNotificationCount = onCount;
		mockOnConfirmed = onConfirmed;
		return mockUnsubscribe;
	} );
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
