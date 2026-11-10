/**
 * @jest-environment jsdom
 */

// babel-jest.  Assigning into a `var` (which is also hoisted) avoids the
// TDZ error while still letting the factory populate the object at
// require-time. `mockSmooch` prefix satisfies Jest's "mock" naming rule.
// eslint-disable-next-line no-var
var mockSmooch: {
	init: jest.Mock;
	destroy: jest.Mock;
	render: jest.Mock;
	on: jest.Mock;
	off: jest.Mock;
	getConversationById: jest.Mock;
};

jest.mock( 'smooch', () => {
	mockSmooch = {
		init: jest.fn(),
		destroy: jest.fn(),
		render: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
		getConversationById: jest.fn().mockResolvedValue( {} ),
	};
	return mockSmooch;
} );

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/odie-client/src/data', () => ( {
	useGetUnreadConversations: () => jest.fn(),
} ) );

jest.mock( '@automattic/odie-client/src/utils/csat', () => ( {
	isZendeskIntroMessage: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	// Like the real hook, only load the script when chat is allowed.
	useLoadZendeskMessaging: ( allowChat: boolean ) => ( { isMessagingScriptLoaded: allowChat } ),
	useAuthenticateZendeskMessaging: () => ( {
		data: { jwt: 'test-jwt', externalId: 'test-ext-id', isLoggedIn: true },
	} ),
	fetchMessagingAuth: jest.fn(),
	isTestModeEnvironment: jest.fn().mockReturnValue( false ),
	getSmoochIntegrationId: ( key?: string | null ) =>
		key ? `integration-id-${ key }` : 'integration-id',
	useCanConnectToZendeskMessaging: () => ( { data: true } ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: {
		register: jest.fn().mockReturnValue( 'help-center' ),
		store: { name: 'help-center' },
	},
} ) );

// Changed by the open human chat tests.
let mockIsEligibleForChat = true;
// Changed by the integration tests.
let mockZendeskIntegrationKey: string | null = null;

// Mock the real on-disk modules that are transitively loaded via src/hooks.
// Without these, the entire dependency graph tries to load, pulling in
// @wordpress/components, @wordpress/rich-text, etc., which fail in jsdom.
jest.mock( '../../hooks', () => ( {
	useChatStatus: () => ( { isEligibleForChat: mockIsEligibleForChat } ),
} ) );

jest.mock( '../../stores', () => ( {
	HELP_CENTER_STORE: 'help-center',
} ) );

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => ( {
		chat: { hasPremiumSupport: false, zendeskIntegrationKey: mockZendeskIntegrationKey },
	} ),
	useHelpCenterContext: () => ( { currentUser: { ID: 1 } } ),
} ) );

jest.mock( '../../components/utils', () => ( {
	getClientId: jest.fn().mockReturnValue( 'client-id' ),
	getZendeskConversations: jest.fn().mockReturnValue( [] ),
} ) );

// eslint-disable-next-line no-var
var mockInvalidateQueries: jest.Mock;
// eslint-disable-next-line no-var
var mockFetchQuery: jest.Mock;
jest.mock( '@tanstack/react-query', () => {
	mockInvalidateQueries = jest.fn().mockResolvedValue( undefined );
	mockFetchQuery = jest.fn();
	return {
		useQueryClient: () => ( {
			invalidateQueries: mockInvalidateQueries,
			fetchQuery: mockFetchQuery,
		} ),
		QueryClient: jest.fn(),
	};
} );

const mockSetIsChatLoaded = jest.fn();
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( selector: ( s: unknown ) => unknown ) =>
		selector( () => ( {
			isHelpCenterShown: () => false,
			getIsChatLoaded: () => false,
			getAreSoundNotificationsEnabled: () => false,
			getHasPremiumSupport: () => false,
			getZendeskConnectionStatus: () => null,
		} ) )
	),
	useDispatch: () => ( {
		setIsChatLoaded: mockSetIsChatLoaded,
		setZendeskClientId: jest.fn(),
		setZendeskConnectionStatus: jest.fn(),
		setSupportTypingStatus: jest.fn(),
	} ),
} ) );

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
} ) );

import '@testing-library/jest-dom';
import { fetchMessagingAuth } from '@automattic/zendesk-client';
import { act, render } from '@testing-library/react';
import HelpCenterSmooch from '../help-center-smooch';

describe( 'HelpCenterSmooch – Smooch.destroy() error handling (regression)', () => {
	const destroyError = new Error( 'SDK not fully initialized' );

	beforeEach( () => {
		jest.clearAllMocks();
		mockSmooch.render.mockImplementation( () => {} );
	} );

	it( 'still calls Smooch.init() after Smooch.destroy() throws', async () => {
		mockSmooch.destroy.mockRejectedValueOnce( destroyError );
		mockSmooch.init.mockResolvedValue( undefined );

		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'enters the catch/retry branch when Smooch.init() fails after destroy() throws', async () => {
		const initError = new Error( 'Smooch.init failed' );
		mockSmooch.destroy.mockRejectedValueOnce( destroyError );
		mockSmooch.init.mockRejectedValueOnce( initError );

		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		// The catch branch calls setIsChatLoaded(false) a second time.
		// Before the fix only one call happens (the one before destroy()),
		// so this assertion would fail.
		expect( mockSetIsChatLoaded ).toHaveBeenCalledTimes( 2 );
		expect( mockSetIsChatLoaded ).toHaveBeenNthCalledWith( 1, false ); // pre-destroy reset
		expect( mockSetIsChatLoaded ).toHaveBeenNthCalledWith( 2, false ); // catch branch
	} );

	it( 'does not produce an unhandled rejection when Smooch.destroy() throws on unmount', async () => {
		mockSmooch.destroy.mockResolvedValueOnce( undefined ); // init-time destroy: succeeds
		mockSmooch.init.mockResolvedValue( undefined );
		mockSmooch.destroy.mockRejectedValueOnce( destroyError ); // cleanup destroy: throws

		const unhandledErrors: unknown[] = [];
		const onUnhandled = ( event: PromiseRejectionEvent ) => {
			unhandledErrors.push( event.reason );
			event.preventDefault(); // prevent Jest from also catching it
		};
		window.addEventListener( 'unhandledrejection', onUnhandled );

		let unmount!: () => void;
		try {
			await act( async () => {
				( { unmount } = render( <HelpCenterSmooch enableAuth /> ) );
				await new Promise( ( r ) => setTimeout( r, 0 ) );
			} );

			await act( async () => {
				unmount();
				await new Promise( ( r ) => setTimeout( r, 0 ) );
			} );
		} finally {
			window.removeEventListener( 'unhandledrejection', onUnhandled );
		}

		expect( unhandledErrors ).toHaveLength( 0 );
	} );
} );

describe( 'HelpCenterSmooch – onInvalidAuth refreshes the messenger auth (regression)', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSmooch.render.mockImplementation( () => {} );
		mockSmooch.destroy.mockResolvedValue( undefined );
		mockSmooch.init.mockResolvedValue( undefined );
	} );

	it( 'refreshes the same messenger query the component subscribes to and returns the fresh JWT', async () => {
		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		// Grab the delegate Smooch was initialized with.
		const initOptions = mockSmooch.init.mock.calls[ 0 ][ 0 ];
		const { onInvalidAuth } = initOptions.delegate;

		mockFetchQuery.mockResolvedValueOnce( {
			jwt: 'fresh-jwt',
			externalId: 'test-ext-id',
			isLoggedIn: true,
		} );

		let returnedJwt: string | undefined;
		await act( async () => {
			returnedJwt = await onInvalidAuth();
		} );

		// Smooch receives the refreshed token.
		expect( returnedJwt ).toBe( 'fresh-jwt' );

		// It must refresh the exact key the component reads (type 'messenger',
		// initializeWidget true) — NOT the old orphan 'zendesk' key — so authJwtRef
		// picks up the new token. isTestModeEnvironment() is mocked to false.
		const expectedKey = [ 'getMessagingAuth', 'messenger', false, true ];
		expect( mockInvalidateQueries ).toHaveBeenCalledWith( { queryKey: expectedKey } );
		const fetchArgs = mockFetchQuery.mock.calls[ 0 ][ 0 ];
		expect( fetchArgs.queryKey ).toEqual( expectedKey );

		// The query function fetches the messenger auth with the widget login flow.
		fetchArgs.queryFn();
		expect( fetchMessagingAuth ).toHaveBeenCalledWith( 'messenger', true );
	} );
} );

describe( 'HelpCenterSmooch – open human chats', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSmooch.render.mockImplementation( () => {} );
		mockSmooch.init.mockResolvedValue( undefined );
		mockIsEligibleForChat = false;
	} );

	afterEach( () => {
		mockIsEligibleForChat = true;
	} );

	it( 'starts the chat for a user without paid support who has an open human chat', async () => {
		await act( async () => {
			render( <HelpCenterSmooch enableAuth hasOpenZendeskChat /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not start the chat for a user without paid support or an open human chat', async () => {
		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).not.toHaveBeenCalled();
	} );
} );

describe( 'HelpCenterSmooch – messaging integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSmooch.render.mockImplementation( () => {} );
		mockSmooch.init.mockResolvedValue( undefined );
	} );

	afterEach( () => {
		mockZendeskIntegrationKey = null;
	} );

	it( 'initializes Smooch on the default integration', async () => {
		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).toHaveBeenCalledWith(
			expect.objectContaining( { integrationId: 'integration-id' } )
		);
	} );

	it( "initializes Smooch on the product's integration", async () => {
		mockZendeskIntegrationKey = 'woo';

		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).toHaveBeenCalledWith(
			expect.objectContaining( { integrationId: 'integration-id-woo' } )
		);
	} );
} );
