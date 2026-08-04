/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import { applyMiddleware, createStore, type Reducer } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import initialReducer from 'calypso/state/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';
import useAccountCreationExperiment from '../use-account-creation-experiment';

// A different user per test rather than a shared one: an attempt's record is recoverable from
// memory by design, so clearing storage isn't what isolates these — a different attempt is.
let mockUserId = 0;

jest.mock( 'calypso/lib/analytics/tracks' );

// Keep the poll from reaching the network — the gate polls `fetchCurrentUser`.
jest.mock( 'calypso/state/current-user/actions', () => ( {
	__esModule: true,
	...jest.requireActual( 'calypso/state/current-user/actions' ),
	fetchCurrentUser: jest.fn( () => ( { type: 'TEST_NOOP' } ) ),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const enabledFlags = new Set< string >();
	const configFn = ( key: string ) => actual( key );
	Object.assign( configFn, actual, {
		enabledFlags,
		isEnabled: ( flag: string ) => enabledFlags.has( flag ) || actual.isEnabled( flag ),
	} );
	return configFn;
} );

jest.mock( 'calypso/lib/partner-branding', () => ( { usePartnerBranding: jest.fn() } ) );
jest.mock( '../use-account-creation-experiment', () => jest.fn() );
jest.mock( '../use-social-service', () => ( {
	useSocialService: () => ( { socialServiceResponse: undefined } ),
} ) );
jest.mock( '../handle-social-response', () => ( {
	useHandleSocialResponse: () => ( {
		handleSocialResponse: jest.fn(),
		notice: undefined,
		accountCreateResponse: undefined,
	} ),
} ) );
jest.mock( 'calypso/blocks/signup-form/signup-form-social-first', () => ( {
	__esModule: true,
	// A stand-in whose button fires the real form's `goToNextStep` + `onCreateAccountSuccess`.
	default: ( {
		onCreateAccountSuccess,
		goToNextStep,
	}: {
		onCreateAccountSuccess?: ( data: { ID: number } ) => void;
		goToNextStep?: ( data: { bearer_token: string; ID: number } ) => void;
	} ) => (
		<button
			onClick={ () => {
				// Production order: goToNextStep fires before onCreateAccountSuccess.
				goToNextStep?.( { bearer_token: 'test-token', ID: mockUserId } );
				onCreateAccountSuccess?.( { ID: mockUserId } );
			} }
		>
			create-email-account
		</button>
	),
	MobileCompactTosNotice: () => null,
} ) );

const mockConfig = config as unknown as { enabledFlags: Set< string > };
const mockUsePartnerBranding = usePartnerBranding as unknown as jest.Mock;
const mockUseAccountCreationExperiment = useAccountCreationExperiment as unknown as jest.Mock;

const EMAIL = 'onboarder@example.com';
const GATE_HEADING = 'Verify your email';

interface ReducerWithAdd {
	addReducer( keys: string[], reducer: unknown ): ReducerWithAdd;
}

// The gate renders `DocumentHead`, which reads these lazily-registered slices.
const rootReducer = ( initialReducer as unknown as ReducerWithAdd )
	.addReducer( [ 'documentHead' ], documentHeadReducer )
	.addReducer( [ 'ui' ], uiReducer ) as unknown as Reducer;

const makeStore = ( emailVerified: boolean ) =>
	createStore(
		rootReducer,
		{
			currentUser: {
				id: mockUserId,
				user: { ID: mockUserId, email: EMAIL, email_verified: emailVerified },
			},
		},
		applyMiddleware( thunkMiddleware )
	);

const makeLoggedOutStore = () =>
	createStore( rootReducer, { currentUser: {} }, applyMiddleware( thunkMiddleware ) );

const renderUser = ( store: ReturnType< typeof makeStore > ) => {
	const submit = jest.fn();
	const { unmount } = renderWithProvider(
		<MemoryRouter initialEntries={ [ '/onboarding/user' ] }>
			<UserStep flow="onboarding" stepName="user" navigation={ { submit } } />
		</MemoryRouter>,
		{ store }
	);
	return { submit, unmount };
};

describe( 'account step email verification gate', () => {
	beforeEach( () => {
		mockUserId++;
		mockConfig.enabledFlags.add( 'onboarding/email-verification' );
		mockUsePartnerBranding.mockReturnValue( {
			hasCustomBranding: false,
			partnerConfig: null,
			topBarLogo: undefined,
			signupTosElement: undefined,
		} );
		mockUseAccountCreationExperiment.mockReturnValue( {
			isEmailFirstVariant: false,
			isEmailAtBottom: false,
		} );
	} );

	afterEach( () => {
		// A test that fails before restoring them would otherwise time out every test after it.
		jest.useRealTimers();
		mockConfig.enabledFlags.clear();
		localStorage.clear();
		sessionStorage.clear();
		jest.clearAllMocks();
	} );

	it( 'confirmation continues exactly once (no double submit)', async () => {
		const store = makeStore( false );
		const { submit } = renderUser( store );

		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		// The confirmation lands (e.g. from the link opened in another tab).
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
		// The gate owns this event, so it has to still be mounted when the confirmation lands.
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding', seconds_on_step: expect.any( Number ) } )
		);
	} );

	// The point of reading `/me` rather than a marker: a new tab starts with empty storage, and
	// used to sail straight past the gate.
	it( 'holds an unverified account with nothing stored at all', async () => {
		const first = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		first.unmount();
		localStorage.clear();
		sessionStorage.clear();

		const { submit } = renderUser( makeStore( false ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	// The user ID is persisted across a reload but the user object is not, so there's a window
	// where the account is logged in and nothing is known about it. Reading that as unverified
	// would open the gate onto a blank address it can't resend to or check.
	it( 'neither gates nor continues while the user object is still missing', async () => {
		const store = createStore(
			rootReducer,
			{ currentUser: { id: mockUserId } },
			applyMiddleware( thunkMiddleware )
		);
		const { submit } = renderUser( store );

		// Retried, because a failed fetch changes no state and would never be asked for again —
		// leaving a logged-in user looking at a form offering to create the account they have.
		await waitFor( () => expect( fetchCurrentUser ).toHaveBeenCalledWith( { retry: true } ) );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'create-email-account' } )
		).not.toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();
	} );

	// The account exists but `/me` hasn't answered, so Redux doesn't consider anyone logged in yet.
	// Waiting on `isLoggedIn` to start retrying would strand exactly the user this is built for.
	it( 'keeps asking for the user after account creation, before anyone is logged in', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		renderUser( makeLoggedOutStore() );

		await user.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );
		// The account-creation fetch is the one that failed; nothing has changed state since.
		( fetchCurrentUser as jest.Mock ).mockClear();

		act( () => {
			jest.advanceTimersByTime( 30 * 1000 );
		} );

		expect( fetchCurrentUser ).toHaveBeenCalled();
		// Plain, not a four-request batch every ten seconds aimed at an already-struggling `/me`.
		expect( fetchCurrentUser ).not.toHaveBeenCalledWith( { retry: true } );
	} );

	// Confirming elsewhere and coming back finds `/me` already verified, so the gate never opens
	// to close itself out. The attempt still has to be finished, or it goes unrecorded.
	it( 'finishes an attempt that was confirmed before the gate could see it', async () => {
		const first = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		first.unmount();
		jest.clearAllMocks();

		const { submit } = renderUser( makeStore( true ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding' } )
		);
	} );

	// The attempt is what the cooldown and the view stamp hang off, so it outlives a good deal.
	// "We just sent an email" must not: it stops being true long before the attempt stops being
	// live, and it's shared across tabs so that every one of them says the same thing.
	it( 'stops calling a signup fresh once it stops being recent', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const store = makeLoggedOutStore();
		const fresh = renderUser( store );

		await user.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: false },
			} );
		} );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_view',
			expect.objectContaining( { is_new_signup: true } )
		);
		expect( screen.getByText( /We just sent an email/ ) ).toBeVisible();

		// Coming back later. The attempt is untouched — it still holds its view stamp, which is why
		// this asserts the copy rather than a second view event, there being none.
		fresh.unmount();
		jest.setSystemTime( Date.now() + 31 * 60 * 1000 );
		renderUser( makeStore( false ) );

		expect(
			await screen.findByText( /Check your inbox for the verification email/ )
		).toBeVisible();
		expect( screen.queryByText( /We just sent an email/ ) ).not.toBeInTheDocument();
	} );

	it( 'records a returning user with no attempt of their own as not new', async () => {
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_view',
			expect.objectContaining( { is_new_signup: false } )
		);
	} );

	// The confirmation wakes every open tab at once, and each finishes on its own. The claim is
	// what keeps that from being counted more than once between them.
	it( 'records the confirmation once across tabs, while both still continue', async () => {
		const a = renderUser( makeStore( false ) );
		await screen.findAllByRole( 'heading', { name: GATE_HEADING } );
		const b = renderUser( makeStore( false ) );
		jest.clearAllMocks();

		a.unmount();
		b.unmount();
		const verifiedA = renderUser( makeStore( true ) );
		const verifiedB = renderUser( makeStore( true ) );

		await waitFor( () => expect( verifiedA.submit ).toHaveBeenCalled() );
		await waitFor( () => expect( verifiedB.submit ).toHaveBeenCalled() );

		const confirmations = ( recordTracksEvent as jest.Mock ).mock.calls.filter(
			( [ event ] ) => event === 'calypso_signup_email_verification_confirmed'
		);
		expect( confirmations ).toHaveLength( 1 );
	} );

	it( 'records the confirmation when /me flips while the gate is up', async () => {
		const store = makeStore( false );
		renderUser( store );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: true },
			} );
		} );

		// `/me` opening the gate is not the same as `/me` closing it: the gate has work to finish.
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_signup_email_verification_confirmed',
				expect.anything()
			)
		);
	} );

	it( 'shows the gate once an email account is created and logged in', async () => {
		const store = makeLoggedOutStore();
		const { submit } = renderUser( store );

		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );
		// Account creation logs the user in.
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: false },
			} );
		} );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	// The whole of what keeps social signups out: the social endpoint creates accounts with
	// `is_email_unverified => false`, so they arrive here already verified.
	it( 'skips the gate for a verified account', async () => {
		const { submit } = renderUser( makeStore( true ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	// A phone account is unverified because its address was generated for it, not because a link
	// is sitting unopened in an inbox. Nothing here would help.
	it( 'skips the gate for an unverified phone account', async () => {
		const store = createStore(
			rootReducer,
			{
				currentUser: {
					id: mockUserId,
					user: { ID: mockUserId, email: EMAIL, email_verified: false, phone_account: true },
				},
			},
			applyMiddleware( thunkMiddleware )
		);
		const { submit } = renderUser( store );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	// Turning the flag off is not the user having confirmed anything. Recording it as one would
	// also burn the attempt, so a real confirmation later would go unrecorded.
	it( 'does not record a confirmation when the flag goes off mid-attempt', async () => {
		const shown = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		shown.unmount();
		jest.clearAllMocks();

		mockConfig.enabledFlags.clear();
		const off = renderUser( makeStore( false ) );
		await waitFor( () => expect( recordTracksEvent ).not.toHaveBeenCalled() );
		off.unmount();

		// And the attempt is still there to be confirmed once the flag comes back.
		mockConfig.enabledFlags.add( 'onboarding/email-verification' );
		renderUser( makeStore( true ) );

		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_signup_email_verification_confirmed',
				expect.anything()
			)
		);
	} );

	it( 'skips the gate when the flag is off', async () => {
		mockConfig.enabledFlags.clear();
		const { submit } = renderUser( makeStore( false ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );
} );
