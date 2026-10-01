/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowNavigation } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-flow-navigation';
import { useStepNavigationWithTracking } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-step-navigation-with-tracking';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import siteMigrationFlow from '../site-migration-flow';

jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		siteId: 123,
		siteSlug: 'example.wordpress.com',
		site: { plan: { features: { active: [ 'install-plugins' ] } } },
	} ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: () => jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: () => ( { get: jest.fn(), sessionId: '123' } ),
} ) );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step', () => ( {
	triggerGuidesForStep: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-navigation' );

function MigrationNavigation() {
	const [ steps ] = useState( () => {
		const steps = siteMigrationFlow.initialize();
		if ( ! steps ) {
			throw new Error( 'Migration flow did not initialize' );
		}
		return steps;
	} );
	const { navigate, params } = useFlowNavigation( {
		name: siteMigrationFlow.name,
		isSignupFlow: siteMigrationFlow.isSignupFlow,
		__experimentalUseBuiltinAuth: siteMigrationFlow.__experimentalUseBuiltinAuth,
		useSteps: () => steps,
		useStepNavigation: () => ( { submit: jest.fn() } ),
	} );
	const currentStep = steps.find( ( step ) => step.slug === params.step );
	if ( ! currentStep ) {
		throw new Error( 'Unknown migration step' );
	}
	const currentStepRoute = currentStep.slug;
	const navigation = useStepNavigationWithTracking( {
		flow: siteMigrationFlow,
		currentStepRoute,
		navigate,
	} );

	return (
		<>
			<p data-testid="current-step">{ currentStepRoute }</p>
			{ navigation.goBack && <button onClick={ navigation.goBack }>Back</button> }
			{ currentStepRoute === STEPS.SITE_MIGRATION_IDENTIFY.slug && (
				<button
					onClick={ () =>
						navigation.submit( {
							action: 'continue',
							from: 'https://source.com',
							platform: 'wordpress',
						} )
					}
				>
					Check my site
				</button>
			) }
			{ currentStepRoute === STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug && (
				<button
					onClick={ () =>
						navigation.submit( {
							destination: 'migrate',
							how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
						} )
					}
				>
					Get started
				</button>
			) }
		</>
	);
}

function renderNavigation() {
	window.history.replaceState(
		null,
		'',
		'/setup/site-migration/site-migration-identify?siteId=123&siteSlug=example.wordpress.com'
	);
	return renderWithProvider(
		<BrowserRouter basename="/setup">
			<MigrationNavigation />
		</BrowserRouter>
	);
}

describe( 'Site migration Back navigation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( isUserLoggedIn ).mockReturnValue( true );
		jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 1 );
		jest.spyOn( document, 'referrer', 'get' ).mockReturnValue( '' );
		const { clearStepData } = dispatch( STEPPER_INTERNAL_STORE ) as {
			clearStepData: () => void;
		};
		clearStepData();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		window.history.replaceState( null, '', '/' );
	} );

	it.each( [ 'app', 'browser' ] )(
		'hides Back when only forward history remains after using %s Back',
		async ( backControl ) => {
			const goBack = async () => {
				if ( backControl === 'app' ) {
					await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
				} else {
					act( () => window.history.back() );
				}
			};
			renderNavigation();
			await userEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Get started' } ) );
			expect( screen.getByTestId( 'current-step' ) ).toHaveTextContent(
				STEPS.SITE_MIGRATION_CREDENTIALS.slug
			);

			await goBack();
			await waitFor( () => {
				expect( screen.getByTestId( 'current-step' ) ).toHaveTextContent(
					STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug
				);
			} );
			await goBack();
			await waitFor( () => {
				expect( screen.getByTestId( 'current-step' ) ).toHaveTextContent(
					STEPS.SITE_MIGRATION_IDENTIFY.slug
				);
			} );
			expect( window.history.state.idx ).toBe( 0 );
			expect( window.history.length ).toBeGreaterThan( 1 );
			expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
		}
	);

	it( 'ignores stale previous-step data on entry with forward history', async () => {
		window.history.pushState( null, '', '/forward-entry' );
		const returned = new Promise( ( resolve ) => {
			window.addEventListener( 'popstate', resolve, { once: true } );
		} );
		window.history.back();
		await returned;

		const { setStepData } = dispatch( STEPPER_INTERNAL_STORE ) as {
			setStepData: ( data: { previousStep: string } ) => void;
		};
		setStepData( { previousStep: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug } );
		renderNavigation();

		expect( window.history.state.idx ).toBe( 0 );
		expect( window.history.length ).toBeGreaterThan( 1 );
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'preserves automatic Back for a same-host referrer on the initial entry', () => {
		jest.spyOn( document, 'referrer', 'get' ).mockReturnValue( 'https://example.com/sites' );
		renderNavigation();

		expect( screen.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();
	} );
} );
