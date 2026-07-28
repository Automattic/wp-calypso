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
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import initialReducer from 'calypso/state/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';
import useAccountCreationExperiment from '../use-account-creation-experiment';
import useMobileLayoutExperiment from '../use-mobile-layout-experiment';

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

jest.mock( '../use-mobile-layout-experiment', () => jest.fn() );
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
	default: () => <div data-testid="signup-form" />,
	MobileCompactTosNotice: () => null,
} ) );

const mockConfig = config as unknown as { enabledFlags: Set< string > };
const mockUseMobileLayoutExperiment = useMobileLayoutExperiment as unknown as jest.Mock;
const mockUsePartnerBranding = usePartnerBranding as unknown as jest.Mock;
const mockUseAccountCreationExperiment = useAccountCreationExperiment as unknown as jest.Mock;

const USER_ID = 1;
const EMAIL = 'onboarder@example.com';
const GATE_HEADING = 'Confirm your email address';
const newUserKey = `wpcom_signup_is_new_user_${ USER_ID }`;

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
		localStorage.setItem( newUserKey, 'true' );
		mockUseMobileLayoutExperiment.mockReturnValue( {
			isLoading: false,
			isEligible: false,
			isMobileTreatment: false,
			isMobileTreatmentTosTop: false,
		} );
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

	it( 'skipping continues exactly once and resolves the gate for a later refresh', async () => {
		const { submit, unmount } = renderUser( makeStore( false ) );

		await userEvent.click( await screen.findByRole( 'button', { name: 'I’ll do this later' } ) );
		expect( submit ).toHaveBeenCalledTimes( 1 );

		// Refresh: the persisted "resolved" state means the gate does not reappear.
		unmount();
		const second = renderUser( makeStore( false ) );

		await waitFor( () => expect( second.submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	it( 're-shows the gate after a refresh while it is still pending', async () => {
		const first = renderUser( makeStore( false ) );
		await screen.findByRole( 'heading', { name: GATE_HEADING } );
		first.unmount();

		// A refresh remounts with the same persisted new-user signal, still unresolved.
		const { submit } = renderUser( makeStore( false ) );

		expect( await screen.findByRole( 'heading', { name: GATE_HEADING } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'skips the gate for an already-verified (social) signup', async () => {
		const { submit } = renderUser( makeStore( true ) );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( screen.queryByRole( 'heading', { name: GATE_HEADING } ) ).not.toBeInTheDocument();
	} );

	it( 'skips the gate for an existing session with no new-user signal', async () => {
		localStorage.removeItem( newUserKey );
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
