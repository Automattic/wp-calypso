/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useExperiment } from 'calypso/lib/explat';
import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MasterbarLaunchButton } from '../masterbar-launch-button';

// ---------- Module mocks ----------

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/launch/actions', () => ( {
	launchSiteOrRedirectToLaunchSignupFlow: jest.fn( ( siteId: number ) => ( {
		type: 'MOCK_LAUNCH_THUNK',
		siteId,
	} ) ),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name: string, props: Record< string, unknown > ) => ( {
		type: 'MOCK_TRACKS_EVENT',
		name,
		props,
	} ) ),
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSectionName: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects', () => ( {
	useCelebrateLaunchModalSideEffects: jest.fn(),
} ) );

const mockMutate = jest.fn();
let mockIsPending = false;
jest.mock( '@tanstack/react-query', () => {
	const actual = jest.requireActual( '@tanstack/react-query' );
	return {
		...actual,
		useMutation: jest.fn( () => ( {
			mutate: mockMutate,
			isPending: mockIsPending,
		} ) ),
	};
} );

// Stable fake site returned via initialState (see beforeEach).
const SITE_ID = 1234;

const renderButton = ( {
	site = {
		ID: SITE_ID,
		slug: 'example.wordpress.com',
		is_wpcom_atomic: false,
	},
	sectionName = 'home',
}: {
	site?: { ID: number; slug: string; is_wpcom_atomic: boolean } | null;
	sectionName?: string | null;
} = {} ) => {
	( getSite as jest.Mock ).mockReturnValue( site );
	( getSectionName as jest.Mock ).mockReturnValue( sectionName );
	return renderWithProvider( <MasterbarLaunchButton siteId={ SITE_ID } /> );
};

// ---------- Setup ----------

const mockOnSiteLaunched = jest.fn();

beforeEach( () => {
	jest.clearAllMocks();
	mockIsPending = false;
	( useExperiment as jest.Mock ).mockReturnValue( [ false, undefined ] );
	( useCelebrateLaunchModalSideEffects as jest.Mock ).mockReturnValue( {
		onSiteLaunched: mockOnSiteLaunched,
	} );
	// Stub window.location.assign for semi_gated_site_launch variation.
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: jest.fn(), pathname: '/current-path' },
	} );
} );

// ---------- Tests ----------

describe( 'MasterbarLaunchButton', () => {
	it( 'renders a button labeled "Launch site"', () => {
		renderButton();
		expect( screen.getByRole( 'button', { name: /launch site/i } ) ).toBeVisible();
	} );

	it( 'is disabled while the experiment is loading', () => {
		( useExperiment as jest.Mock ).mockReturnValue( [ true, undefined ] );
		renderButton();
		expect( screen.getByRole( 'button', { name: /launch site/i } ) ).toBeDisabled();
	} );

	it( 'is disabled and busy while the launch mutation is pending', () => {
		mockIsPending = true;
		renderButton();
		expect( screen.getByRole( 'button', { name: /launch site/i } ) ).toBeDisabled();
	} );

	describe( 'control variation (no experiment variationName)', () => {
		it( 'records tracks and dispatches launchSiteOrRedirectToLaunchSignupFlow(siteId) on click', async () => {
			const user = userEvent.setup();
			renderButton();

			await user.click( screen.getByRole( 'button', { name: /launch site/i } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_launch_site', {
				source: 'home',
			} );
			expect( launchSiteOrRedirectToLaunchSignupFlow ).toHaveBeenCalledWith( SITE_ID );
			expect( mockMutate ).not.toHaveBeenCalled();
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'semi_gated_site_launch variation', () => {
		it( 'redirects to /start/launch-site with siteSlug and back_to', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'semi_gated_site_launch' },
			] );
			const user = userEvent.setup();
			renderButton();

			await user.click( screen.getByRole( 'button', { name: /launch site/i } ) );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/start/launch-site' )
			);
			const target = ( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ] as string;
			expect( target ).toContain( 'siteSlug=example.wordpress.com' );
			expect( target ).toContain( 'back_to=%2Fcurrent-path' );
			expect( launchSiteOrRedirectToLaunchSignupFlow ).not.toHaveBeenCalled();
			expect( mockMutate ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'ungated_site_launch variation', () => {
		it( 'calls the launch mutation and, on success, runs celebrate side-effects', async () => {
			( useExperiment as jest.Mock ).mockReturnValue( [
				false,
				{ variationName: 'ungated_site_launch' },
			] );
			const user = userEvent.setup();
			renderButton( {
				site: { ID: SITE_ID, slug: 'example.wordpress.com', is_wpcom_atomic: true },
			} );

			await user.click( screen.getByRole( 'button', { name: /launch site/i } ) );

			expect( mockMutate ).toHaveBeenCalledTimes( 1 );
			const [ , options ] = mockMutate.mock.calls[ 0 ];
			// Simulate the mutation success callback.
			options.onSuccess();

			await waitFor( () => {
				expect( mockOnSiteLaunched ).toHaveBeenCalledWith( true );
			} );
			expect( launchSiteOrRedirectToLaunchSignupFlow ).not.toHaveBeenCalled();
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );
	} );
} );
