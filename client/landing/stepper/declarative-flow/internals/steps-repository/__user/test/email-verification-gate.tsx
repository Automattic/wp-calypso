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
import documentHeadReducer from 'calypso/state/document-head/reducer';
import initialReducer from 'calypso/state/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';
import { beginGate, gateScope, isGatePending } from '../email-verification/storage';
import useAccountCreationExperiment from '../use-account-creation-experiment';

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
	// A stand-in whose button simulates a successful email account creation, the way
	// the real form's `onCreateAccountSuccess` + `goToNextStep` fire.
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
				goToNextStep?.( { bearer_token: 'test-token', ID: 1 } );
				onCreateAccountSuccess?.( { ID: 1 } );
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

const USER_ID = 1;
const EMAIL = 'onboarder@example.com';
const GATE_HEADING = 'Verify your email';
const SCOPE = gateScope( 'onboarding', USER_ID );

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
				id: USER_ID,
				user: { ID: USER_ID, email: EMAIL, email_verified: emailVerified },
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
		mockConfig.enabledFlags.add( 'onboarding/email-verification' );
		// Most cases start already past account creation, with the gate open (pending).
		beginGate( SCOPE );
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
		mockConfig.enabledFlags.clear();
		localStorage.clear();
		sessionStorage.clear();
		jest.clearAllMocks();
	} );

	it( 'shows the gate for a new, unverified email signup', async () => {
		const { submit } = renderUser( makeStore( false ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'confirmation continues exactly once (no double submit)', async () => {
		const store = makeStore( false );
		const { submit } = renderUser( store );

		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		// The confirmation lands (e.g. from the link opened in another tab).
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: USER_ID, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'confirmation resolves the gate so it does not reappear on a later refresh', async () => {
		const store = makeStore( false );
		const { submit, unmount } = renderUser( store );

		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: USER_ID, email: EMAIL, email_verified: true },
			} );
		} );
		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );

		// Refresh: confirming cleared the pending marker, so the gate does not reappear.
		unmount();
		const second = renderUser( makeStore( true ) );

		await waitFor( () => expect( second.submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	it( 'goes back to the account form when the user updates their email', async () => {
		const { submit } = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Update email' } ) );

		// The account form reappears in place of the gate, without advancing the flow.
		expect( screen.getByRole( 'button', { name: 'create-email-account' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 're-shows the gate after a refresh while it is still pending', async () => {
		const first = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		first.unmount();

		// A refresh remounts with the pending marker still set (unresolved).
		const { submit } = renderUser( makeStore( false ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'marks the gate pending on email account creation, then shows it once logged in', async () => {
		// Nothing pending yet; the user has not created an account.
		sessionStorage.clear();
		const store = makeLoggedOutStore();
		const { submit } = renderUser( store );

		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );
		// Account creation logs the user in.
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: USER_ID, email: EMAIL, email_verified: false },
			} );
		} );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'still shows the gate when persisting the pending marker fails', async () => {
		sessionStorage.clear();
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'storage disabled' );
		} );

		try {
			const store = makeLoggedOutStore();
			renderUser( store );

			await userEvent.click( screen.getByRole( 'button', { name: 'create-email-account' } ) );
			act( () => {
				store.dispatch( {
					type: CURRENT_USER_RECEIVE,
					user: { ID: USER_ID, email: EMAIL, email_verified: false },
				} );
			} );

			// The persisted marker never landed, but in-session state still gates.
			expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		} finally {
			setItem.mockRestore();
		}
	} );

	it( 'skips the gate for an already-verified (social) signup', async () => {
		// Social signups never open the gate, so nothing is pending.
		sessionStorage.clear();
		const { submit } = renderUser( makeStore( true ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.anything()
		);
	} );

	it( 'resolves as a confirmation when a pending user is already verified on mount', async () => {
		// The marker is pending (from account creation) but verification already landed —
		// e.g. the activation link opened in this tab, or a reload after confirming. The
		// gate still mounts, sees the verified user, records the confirmation, and advances.
		const { submit } = renderUser( makeStore( true ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding' } )
		);
		// The marker is cleared so a later refresh won't re-gate the user.
		expect( isGatePending( SCOPE ) ).toBe( false );
	} );

	it( 'skips the gate for an existing session with nothing pending', async () => {
		sessionStorage.clear();
		const { submit } = renderUser( makeStore( false ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	it( 'skips the gate when the flag is off', async () => {
		mockConfig.enabledFlags.clear();
		const { submit } = renderUser( makeStore( false ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );
} );
