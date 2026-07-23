/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { addSurvicate } from 'calypso/lib/analytics/survicate';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import onboarding from '../flows/onboarding/onboarding';
import { STEPS } from '../internals/steps';
import { ProcessingResult } from '../internals/steps-repository/processing-step/constants';
import { getFlowLocation, renderFlow } from './helpers';

const originalLocation = window.location;

// Flags added to `enabledFlags` read as enabled on top of the test config. The set
// lives inside the factory because config is read while modules are still importing,
// long before a top-level `const` in this file would be initialized.
jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const enabledFlags = new Set();
	const configFn = ( key ) => actual( key );
	Object.assign( configFn, actual, {
		enabledFlags,
		isEnabled: ( flag ) => enabledFlags.has( flag ) || actual.isEnabled( flag ),
	} );
	return configFn;
} );

const { enabledFlags } = config;

jest.mock( '../../hooks/use-marketplace-theme-products', () => ( {
	useMarketplaceThemeProducts: () => ( {
		isLoading: false,
		selectedMarketplaceProduct: '',
		selectedMarketplaceProductCartItems: [],
		isMarketplaceThemeSubscriptionNeeded: false,
		isMarketplaceThemeSubscribed: false,
		isExternallyManagedThemeAvailable: false,
	} ),
} ) );

jest.mock( '../../hooks/use-simplified-onboarding', () => ( {
	isSimplifiedOnboarding: () => Promise.resolve( false ),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( {
	addSurvicate: jest.fn(),
} ) );

// The processing step awaits the launchpad-personalization ExPlat assignment before redirecting.
// Resolve it synchronously to control (variationName: null) so the redirect fires within the test's
// tick instead of waiting on a real network fetch.
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn( () => Promise.resolve( { variationName: null } ) ),
} ) );

describe( 'Onboarding Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				assign: jest.fn(),
				replace: jest.fn(),
				pathname: '/setup/onboarding',
				search: '',
				href: 'http://wordpress.com/setup/onboarding',
			},
			writable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
		enabledFlags.clear();
	} );

	describe( 'Email verification step', () => {
		it( 'asks free-plan signups to confirm their email before the site is created', () => {
			enabledFlags.add( 'onboarding/email-verification' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.UNIFIED_PLANS.slug,
				dependencies: { cartItems: null },
			} );

			expect( getFlowLocation().path ).toBe( `/${ STEPS.EMAIL_VERIFICATION.slug }` );
		} );

		it( 'leaves paid signups alone so nothing stands between them and checkout', () => {
			enabledFlags.add( 'onboarding/email-verification' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.UNIFIED_PLANS.slug,
				dependencies: { cartItems: [ { product_slug: 'personal-bundle' } ] },
			} );

			expect( getFlowLocation().path ).toBe( `/${ STEPS.SITE_CREATION_STEP.slug }` );
		} );

		it( 'stays out of the way while the flag is off', () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.UNIFIED_PLANS.slug,
				dependencies: { cartItems: null },
			} );

			expect( getFlowLocation().path ).toBe( `/${ STEPS.SITE_CREATION_STEP.slug }` );
		} );

		it( 'creates the site once the email is confirmed', () => {
			enabledFlags.add( 'onboarding/email-verification' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.EMAIL_VERIFICATION.slug,
				dependencies: { emailVerified: true },
			} );

			expect( getFlowLocation().path ).toBe( `/${ STEPS.SITE_CREATION_STEP.slug }` );
		} );

		it( 'replaces the verification step in history so browser Back cannot re-trigger site creation', async () => {
			enabledFlags.add( 'onboarding/email-verification' );

			const stepPath = ( slug: string ) => `/${ ONBOARDING_FLOW }/${ slug }`;

			// A faithful stand-in for the flow's real navigate: it pushes or replaces
			// history exactly the way `useFlowNavigation`'s customNavigate does.
			const Harness = () => {
				const navigate = useNavigate();
				const location = useLocation();
				const currentStep = location.pathname.split( '/' ).pop() as string;
				const navigateAdapter = ( nextStep: string, _extraData?: unknown, replace = false ) =>
					navigate( stepPath( nextStep ), { replace } );
				const { submit } = onboarding.useStepNavigation( currentStep, navigateAdapter ) as {
					submit: ( args: { slug: string; providedDependencies: unknown } ) => void;
				};

				return (
					<>
						<p data-testid="pathname">{ location.pathname }</p>
						<button
							onClick={ () =>
								submit( {
									slug: currentStep,
									providedDependencies: { emailVerified: true },
								} )
							}
						>
							submit
						</button>
						<button onClick={ () => navigate( -1 ) }>back</button>
					</>
				);
			};

			renderWithProvider(
				<MemoryRouter
					initialEntries={ [
						stepPath( STEPS.UNIFIED_PLANS.slug ),
						stepPath( STEPS.EMAIL_VERIFICATION.slug ),
					] }
					initialIndex={ 1 }
				>
					<Harness />
				</MemoryRouter>,
				{ initialState: { currentUser: { id: 'some-id' } } }
			);

			expect( screen.getByTestId( 'pathname' ) ).toHaveTextContent(
				stepPath( STEPS.EMAIL_VERIFICATION.slug )
			);

			// Confirming advances to site creation.
			await userEvent.click( screen.getByRole( 'button', { name: 'submit' } ) );
			expect( screen.getByTestId( 'pathname' ) ).toHaveTextContent(
				stepPath( STEPS.SITE_CREATION_STEP.slug )
			);

			// Pressing Back must skip past the verification step (it was replaced, not
			// pushed) and land on the step before it — otherwise it would auto-submit
			// and start a second site-creation attempt.
			await userEvent.click( screen.getByRole( 'button', { name: 'back' } ) );
			expect( screen.getByTestId( 'pathname' ) ).toHaveTextContent(
				stepPath( STEPS.UNIFIED_PLANS.slug )
			);
			expect( screen.getByTestId( 'pathname' ) ).not.toHaveTextContent(
				stepPath( STEPS.EMAIL_VERIFICATION.slug )
			);
		} );
	} );

	describe( 'Flow configuration', () => {
		it( 'should be configured as a signup flow', () => {
			expect( onboarding.name ).toBe( ONBOARDING_FLOW );
			expect( onboarding.isSignupFlow ).toBe( true );
		} );
	} );

	describe( 'Processing step navigation', () => {
		it( 'should redirect to home when hasPluginByGoal true and hasExternalTheme false', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					hasExternalTheme: false,
					hasPluginByGoal: true,
					siteSlug: 'test-site.wordpress.com',
					processingResult: ProcessingResult.SUCCESS,
				},
			} );

			// Wait for the next tick to allow async operations to complete
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.replace ).toHaveBeenCalledWith( '/home/test-site.wordpress.com' );
		} );

		it( 'should redirect to home when hasExternalTheme true', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					hasExternalTheme: true,
					siteSlug: 'test-site.wordpress.com',
					processingResult: ProcessingResult.SUCCESS,
				},
			} );

			// Wait for the next tick to allow async operations to complete
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.replace ).toHaveBeenCalledWith(
				'/home/test-site.wordpress.com?ref=onboarding'
			);
		} );

		describe( 'Survicate side effect', () => {
			it( 'calls addSurvicate with user data when logged in on step changes', () => {
				const loggedInState = {
					currentUser: {
						id: 123,
						user: {
							ID: 123,
							email: 'test@example.com',
							date: '2024-01-15T00:00:00+00:00',
						},
					},
				};

				const TestSideEffect = ( { step }: { step: string } ) => {
					onboarding.useSideEffect( step );
					return null;
				};

				const { rerender } = renderWithProvider(
					<MemoryRouter initialEntries={ [ '/setup/onboarding/domains' ] }>
						<TestSideEffect step={ STEPS.DOMAIN_SEARCH.slug } />
					</MemoryRouter>,
					{ initialState: loggedInState }
				);

				expect( addSurvicate ).toHaveBeenCalledTimes( 1 );
				expect( addSurvicate ).toHaveBeenCalledWith( {
					email: 'test@example.com',
					registrationDate: '2024-01-15T00:00:00+00:00',
					userId: 123,
				} );

				rerender(
					<MemoryRouter initialEntries={ [ '/setup/onboarding/plans' ] }>
						<TestSideEffect step={ STEPS.UNIFIED_PLANS.slug } />
					</MemoryRouter>
				);

				expect( addSurvicate ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );
} );
