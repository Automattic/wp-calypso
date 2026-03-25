/**
 * @jest-environment jsdom
 *
 * Regression tests for the security report:
 *   "Smooch.destroy() errors are not caught, causing unhandled promise rejections
 *    that abort the initialization flow and prevent retry logic from running."
 *
 * Commit: 28923103f4e4
 * Path:   packages/help-center/src/components/help-center-smooch.tsx
 */

// babel-jest.  Assigning into a `var` (which is also hoisted) avoids the
// TDZ error while still letting the factory populate the object at
// require-time.  `mockSmooch` prefix satisfies Jest's "mock" naming rule.
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

// ── External package mocks ────────────────────────────────────────────────────
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/odie-client/src/data', () => ( {
	useGetUnreadConversations: () => jest.fn(),
} ) );

jest.mock( '@automattic/odie-client/src/utils/csat', () => ( {
	isZendeskIntroMessage: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useLoadZendeskMessaging: () => ( { isMessagingScriptLoaded: true } ),
	useAuthenticateZendeskMessaging: () => ( {
		data: { jwt: 'test-jwt', externalId: 'test-ext-id', isLoggedIn: true },
	} ),
	fetchMessagingAuth: jest.fn(),
	isTestModeEnvironment: jest.fn().mockReturnValue( false ),
	SMOOCH_INTEGRATION_ID: 'integration-id',
	SMOOCH_INTEGRATION_ID_STAGING: 'integration-id-staging',
	useCanConnectToZendeskMessaging: () => ( { data: true } ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: {
		register: jest.fn().mockReturnValue( 'help-center' ),
		store: { name: 'help-center' },
	},
} ) );

// Mock the real on-disk modules that are transitively loaded via src/hooks.
// Without these, the entire dependency graph tries to load, pulling in
// @wordpress/components, @wordpress/rich-text, etc., which fail in jsdom.
jest.mock( '../../hooks', () => ( {
	useChatStatus: () => ( { isEligibleForChat: true } ),
} ) );

jest.mock( '../../stores', () => ( {
	HELP_CENTER_STORE: 'help-center',
} ) );

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => ( { chat: { hasPremiumSupport: false } } ),
	useHelpCenterContext: () => ( { currentUser: { ID: 1 } } ),
} ) );

jest.mock( '../../components/utils', () => ( {
	getClientId: jest.fn().mockReturnValue( 'client-id' ),
	getZendeskConversations: jest.fn().mockReturnValue( [] ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( {
		invalidateQueries: jest.fn(),
		fetchQuery: jest.fn(),
	} ),
	QueryClient: jest.fn(),
} ) );

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

// ── Import component under test (after all mocks) ─────────────────────────────
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import HelpCenterSmooch from '../help-center-smooch';
// ── Tests ─────────────────────────────────────────────────────────────────────

describe( 'HelpCenterSmooch – Smooch.destroy() error handling (regression)', () => {
	const destroyError = new Error( 'SDK not fully initialized' );

	beforeEach( () => {
		jest.clearAllMocks();
		mockSmooch.render.mockImplementation( () => {} );
	} );

	/**
	 * REGRESSION: When destroy() rejects, the initialization must still proceed
	 * to call Smooch.init().
	 *
	 * Before the fix: `await Smooch?.destroy?.()` is bare (no try/catch), so the
	 * rejection propagates out of `initialize()` and `Smooch.init` is never
	 * reached → call count stays 0.
	 *
	 * After the fix: destroy() errors are caught and swallowed, so init() is
	 * always called → call count is 1.
	 */
	it( 'still calls Smooch.init() after Smooch.destroy() throws', async () => {
		mockSmooch.destroy.mockRejectedValueOnce( destroyError );
		mockSmooch.init.mockResolvedValue( undefined );

		await act( async () => {
			render( <HelpCenterSmooch enableAuth /> );
			await new Promise( ( r ) => setTimeout( r, 0 ) );
		} );

		expect( mockSmooch.init ).toHaveBeenCalledTimes( 1 );
	} );

	/**
	 * REGRESSION: When destroy() throws AND init() subsequently fails, the
	 * catch/retry branch inside initialize() must still be reached.
	 *
	 * Before the fix: the unhandled destroy() rejection aborts initialize()
	 * entirely — the inner try/catch is never entered, so setIsChatLoaded is
	 * called exactly once (with false, from the line before destroy()) and
	 * never again.  The catch block that would schedule the retry never runs,
	 * so setIsChatLoaded is NOT called a second time with false.
	 *
	 * After the fix: destroy() is caught, init() is called and also rejects,
	 * the catch block runs, and setIsChatLoaded(false) is called a second time
	 * from inside the catch — resulting in at least two calls total.
	 */
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

	/**
	 * REGRESSION: Smooch.destroy() in the cleanup (useEffect return) must not
	 * surface an unhandled rejection on unmount.
	 *
	 * Before the fix: `Smooch?.destroy?.()` is called fire-and-forget with no
	 * error handler, so when it rejects the Promise is unhandled.  In jsdom this
	 * fires `window.unhandledrejection`.  We intercept that event (and call
	 * preventDefault() to stop Jest from also catching it) and assert it was
	 * emitted — proving the bug exists without the fix.
	 *
	 * After the fix: destroy() rejection is swallowed via `.catch()`, so no
	 * `unhandledrejection` event fires and the errors array stays empty.
	 */
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

		// With the fix destroy()'s rejection is caught — no unhandled rejection.
		// Without the fix the rejection escapes and this assertion fails.
		expect( unhandledErrors ).toHaveLength( 0 );
	} );
} );
