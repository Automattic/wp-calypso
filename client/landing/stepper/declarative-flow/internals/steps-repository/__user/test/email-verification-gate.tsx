/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import nock from 'nock';
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
import { gateScope, markResendUnavailableUntil } from '../email-verification/storage';
import useAccountCreationExperiment from '../use-account-creation-experiment';
import type { ReactNode } from 'react';

const CORRECTED_EMAIL = 'corrected@example.com';

// A different user per test, so each one's isolation is its own rather than teardown's.
let mockUserId = 0;

let activationEmailFromProp: string | undefined;
let signupFormProps: { userEmail?: string; notice?: unknown } = {};
let mockHeldEmail: string | null = null;
let mockSocialNotice: ReactNode = <div>That account already exists. Log in instead.</div>;

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
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );
jest.mock( '../use-account-creation-experiment', () => jest.fn() );
jest.mock( '../use-social-service', () => ( {
	useSocialService: () => ( { socialServiceResponse: undefined } ),
} ) );
jest.mock( '../handle-social-response', () => ( {
	useHandleSocialResponse: () => ( {
		handleSocialResponse: jest.fn(),
		notice: mockSocialNotice,
		accountCreateResponse: undefined,
	} ),
} ) );
jest.mock( 'calypso/blocks/signup-form/signup-form-social-first', () => ( {
	__esModule: true,
	// A stand-in whose button fires the real form's `goToNextStep` + `onCreateAccountSuccess`.
	default: ( {
		onCreateAccountSuccess,
		goToNextStep,
		activationEmailFrom,
		userEmail,
		onUpdateEmail,
		notice,
	}: {
		onCreateAccountSuccess?: ( data: { ID: number } ) => void;
		goToNextStep?: ( data: { bearer_token: string; ID: number } ) => void;
		activationEmailFrom?: string;
		userEmail?: string;
		onUpdateEmail?: ( email: string ) => Promise< void >;
		notice?: unknown;
	} ) => {
		activationEmailFromProp = activationEmailFrom;
		signupFormProps = { userEmail, notice };
		// The real form takes its address once, on mount, and keeps it however the prop moves.
		if ( mockHeldEmail === null ) {
			mockHeldEmail = userEmail ?? '';
		}
		if ( onUpdateEmail ) {
			return (
				<>
					{ notice as ReactNode }
					<button onClick={ () => onUpdateEmail( mockHeldEmail as string ) }>
						submit-unchanged
					</button>
					<button onClick={ () => onUpdateEmail( CORRECTED_EMAIL ).catch( () => {} ) }>
						submit-corrected
					</button>
				</>
			);
		}
		return (
			<>
				{ notice as ReactNode }
				<button
					onClick={ () => {
						// Production order: goToNextStep fires before onCreateAccountSuccess.
						goToNextStep?.( { bearer_token: 'test-token', ID: mockUserId } );
						onCreateAccountSuccess?.( { ID: mockUserId } );
					} }
				>
					create-email-account
				</button>
			</>
		);
	},
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

const renderUser = ( store: ReturnType< typeof makeStore >, url = '/onboarding/user' ) => {
	const submit = jest.fn();
	const { unmount } = renderWithProvider(
		<MemoryRouter initialEntries={ [ url ] }>
			<UserStep flow="onboarding" stepName="user" navigation={ { submit, goBack: jest.fn() } } />
		</MemoryRouter>,
		{ store }
	);
	return { submit, unmount };
};

describe( 'account step email verification gate', () => {
	beforeEach( () => {
		( useViewportMatch as unknown as jest.Mock ).mockReturnValue( false );
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
		activationEmailFromProp = undefined;
		signupFormProps = {};
		mockHeldEmail = null;
		mockSocialNotice = <div>That account already exists. Log in instead.</div>;
		// A test that fails before restoring them would otherwise time out every test after it.
		jest.useRealTimers();
		mockConfig.enabledFlags.clear();
		localStorage.clear();
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	it( 'asks for a link back to the flow only when the gate is on', async () => {
		renderUser( makeLoggedOutStore() ).unmount();
		expect( activationEmailFromProp ).toBe( 'onboarding-with-email-verification' );

		mockConfig.enabledFlags.clear();
		renderUser( makeLoggedOutStore() );

		expect( activationEmailFromProp ).toBeUndefined();
	} );

	// It belongs to the account the gate handed back, not to the step.
	it( 'returns to the gate when `/me` resolves someone else', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const store = makeStore( false );
		renderUser( store );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();

		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId + 1, email: 'someone@else.example', email_verified: false },
			} );
		} );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
	} );

	// The gate is a dead end for a mistyped address, so edit hands it back to the account screen
	// carrying the address to fix.
	it( 'hands the address back to the account screen to be corrected', async () => {
		const user = userEvent.setup();
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
		expect( signupFormProps.userEmail ).toBe( EMAIL );
		// Continue already returns to the gate when the address is unchanged; a second way out
		// reads as a choice the user doesn't have.
		expect( screen.queryByRole( 'button', { name: /back/i } ) ).not.toBeInTheDocument();
	} );

	// Submitting it unchanged asks for nothing, so it is the way back.
	it( 'returns to the gate when the address is submitted unchanged', async () => {
		const user = userEvent.setup();
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		await user.click( screen.getByRole( 'button', { name: 'submit-unchanged' } ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
	} );

	it( 'writes a corrected address and waits on that one instead', async () => {
		const user = userEvent.setup();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => body.user_email === CORRECTED_EMAIL )
			.reply( 200, { user_email: CORRECTED_EMAIL } );
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		await user.click( screen.getByRole( 'button', { name: 'submit-corrected' } ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( scope.isDone() ).toBe( true );
		// The gate names the address from the user, so it has to be read again to name the new one.
		expect( fetchCurrentUser ).toHaveBeenCalled();
	} );

	// Otherwise a refusal leaves the user on a screen that looks like it did nothing.
	it( 'keeps the account screen and says why when the address is refused', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 400, { message: 'That e-mail address is already being used.' } );
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		await user.click( screen.getByRole( 'button', { name: 'submit-corrected' } ) );

		expect( await screen.findByText( /already being used/ ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	// Confirming in another tab settles what the account screen was opened to change, so there is
	// nothing left to correct and no reason to hold the user there.
	it( 'continues when the address is confirmed while the account screen is open', async () => {
		const user = userEvent.setup();
		const store = makeStore( false );
		const { submit } = renderUser( store );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
	} );

	// The compact frame pins a ToS the standard form doesn't render, and offers to start a site.
	it( 'leaves the compact mobile frame behind on the account screen', async () => {
		const user = userEvent.setup();
		( useViewportMatch as unknown as jest.Mock ).mockImplementation(
			( breakpoint: string, operator?: string ) => breakpoint === 'small' && operator === '<'
		);
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeVisible();
		expect( document.querySelector( '.step-container-v2--user-mobile' ) ).not.toBeInTheDocument();
	} );

	// It is fixed and full-screen, so it would sit over the field.
	it( 'keeps the one-tap overlay off the account screen', async () => {
		const user = userEvent.setup();
		mockSocialNotice = undefined;
		renderUser( makeStore( false ), '/onboarding/user?oneTapAuth=true' );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		expect( document.querySelector( '.one-tap-auth-loader-overlay' ) ).not.toBeInTheDocument();
	} );

	// A stored social failure carries a log-in link, which is a way past the gate.
	it( 'keeps an earlier social failure off the account screen', async () => {
		const user = userEvent.setup();
		renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		await user.click( screen.getByRole( 'button', { name: 'edit' } ) );

		expect( screen.queryByText( /Log in instead/ ) ).not.toBeInTheDocument();
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

		// Nothing offers to create an account to someone who has just proved they have one.
		expect(
			screen.queryByRole( 'button', { name: 'create-email-account' } )
		).not.toBeInTheDocument();

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
		// The step records this, so it survives the gate unmounting — which is what the transition
		// looks like now.
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding', seconds_on_step: expect.any( Number ) } )
		);
	} );

	// One journey, asserted at each point it could go wrong. `/me` lags a cross-DC signup, which
	// the step's own retry comment calls out, so the window between creating an account and being
	// told whose it is has to hold up on its own.
	it( 'carries a new account from the form to the gate', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const store = makeLoggedOutStore();
		const { submit } = renderUser( store );

		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
		await user.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );

		// Nothing offers a second way in while the first is still landing.
		expect(
			screen.queryByRole( 'button', { name: 'create-email-account' } )
		).not.toBeInTheDocument();

		// The account-creation fetch is the one that can fail, and nothing has changed state
		// since — so something has to keep asking, plainly rather than in batches of four.
		( fetchCurrentUser as jest.Mock ).mockClear();
		act( () => {
			jest.advanceTimersByTime( 30 * 1000 );
		} );
		expect( fetchCurrentUser ).toHaveBeenCalled();
		expect( fetchCurrentUser ).not.toHaveBeenCalledWith( { retry: true } );

		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId, email: EMAIL, email_verified: false },
			} );
		} );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	// A stale token can have `/me` resolve someone else entirely, and the gate would otherwise be
	// the same component instance, still counting down a lockout that was never theirs.
	it( "does not carry one account's resend lockout over to another", async () => {
		const store = makeStore( false );
		markResendUnavailableUntil( gateScope( 'onboarding', mockUserId ), Date.now() + 5 * 60 * 1000 );
		renderUser( store );

		expect( await screen.findByRole( 'button', { name: /^Resend \(/ } ) ).toBeVisible();

		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: mockUserId + 1000, email: 'other@example.com', email_verified: false },
			} );
		} );

		expect( await screen.findByRole( 'button', { name: 'Resend' } ) ).toBeEnabled();
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
} );
