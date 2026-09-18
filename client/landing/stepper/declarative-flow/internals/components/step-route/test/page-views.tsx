/**
 * @jest-environment jsdom
 */
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { isAllowedCiabDashboardHostname } from 'calypso/dashboard/app-ciab/routing';
import { recordUnifiedAdminPageView } from 'calypso/lib/analytics/record-admin-page-view';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StepRoute from '../';
import { recordStepperPageView } from '../../../analytics/record-page-view';
import type { Flow } from '../../../types';
import type { ComponentProps } from 'react';

jest.mock( 'calypso/dashboard/app-ciab/routing' );
jest.mock( 'calypso/lib/analytics/record-admin-page-view' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( '../hooks/use-step-route-tracking' );
jest.mock( '../../../analytics/record-page-view' );
jest.mock( 'calypso/landing/stepper/hooks/use-login-url-for-flow', () => ( {
	useLoginUrlForFlow: () => '/log-in',
} ) );
jest.mock( 'calypso/signup/signup-header', () => () => null );
jest.mock( 'calypso/landing/stepper/utils/performance-tracking', () => ( {
	StepperPerformanceTrackerStop: () => null,
} ) );

const flow: Flow = {
	name: 'test-flow',
	useSteps: () => [],
	useStepNavigation: () => ( { submit() {} } ),
	isSignupFlow: false,
	__experimentalUseBuiltinAuth: true,
};

type Options = Partial<
	Pick< ComponentProps< typeof StepRoute >, 'isResolving' | 'renderStep' >
> & {
	requiresLoggedInUser?: boolean;
};

function renderSteps( options: Options = {}, initialPath = '/setup/test-flow/domains' ) {
	window.history.replaceState( null, '', initialPath );
	const navigate = jest.fn();

	function App( {
		isResolving = false,
		renderStep = () => <div>Step content</div>,
		requiresLoggedInUser = false,
	}: Options ) {
		return (
			<BrowserRouter basename="/setup">
				<Link to="/test-flow/domains">First step</Link>
				<Link to="/test-flow/plans">Second step</Link>
				<Link to="/test-flow/user">Redirect to first step</Link>
				<Link to="/test-flow/domains?tab=general#details">Change query and hash</Link>
				<Routes>
					{ ( [ 'domains', 'plans', 'user' ] as const ).map( ( slug ) => {
						const route = `/test-flow/${ slug }/:lang?`;
						return (
							<Route
								key={ slug }
								path={ route }
								element={
									<StepRoute
										key={ slug }
										step={ { slug, requiresLoggedInUser, asyncComponent: jest.fn() } }
										flow={ flow }
										isResolving={ isResolving }
										renderStep={
											slug === 'user'
												? () => <Navigate to="/test-flow/domains" replace />
												: renderStep
										}
										navigate={ navigate }
									/>
								}
							/>
						);
					} ) }
					<Route path="/test-flow" element={ <Navigate to="/test-flow/domains" replace /> } />
				</Routes>
			</BrowserRouter>
		);
	}

	const { rerender } = renderWithProvider( <App { ...options } /> );
	return { navigate, rerender: ( nextOptions: Options ) => rerender( <App { ...nextOptions } /> ) };
}

describe( 'Stepper unified admin page views', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.isolateModules( () => {
			const { recordStepperPageView: record } = jest.requireActual<
				typeof import( '../../../analytics/record-page-view' )
			>( '../../../analytics/record-page-view' );
			jest.mocked( recordStepperPageView ).mockImplementation( record );
		} );
		jest.mocked( isUserLoggedIn ).mockReturnValue( true );
		jest.mocked( isAllowedCiabDashboardHostname ).mockReturnValue( false );
	} );

	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	it( 'records the committed step with its full pathname and registered pattern', () => {
		renderSteps( {}, '/setup/test-flow/domains/fr?tab=general#details' );

		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledWith( {
			source: 'stepper',
			path: '/setup/test-flow/domains/fr',
			route: '/setup/test-flow/domains/:lang?',
		} );
	} );

	it( 'counts step changes and return visits, but not repeated paths or query/hash changes', async () => {
		renderSteps();
		await act( async () => {
			fireEvent.click( screen.getByText( 'First step' ) );
		} );
		await act( async () => {
			fireEvent.click( screen.getByText( 'Change query and hash' ) );
		} );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );

		await act( async () => {
			fireEvent.click( screen.getByText( 'Second step' ) );
		} );
		await act( async () => {
			fireEvent.click( screen.getByText( 'First step' ) );
		} );
		expect(
			jest.mocked( recordUnifiedAdminPageView ).mock.calls.map( ( [ view ] ) => view.path )
		).toEqual( [
			'/setup/test-flow/domains',
			'/setup/test-flow/plans',
			'/setup/test-flow/domains',
		] );
	} );

	it.each( [ '/setup/test-flow', '/setup/test-flow/user' ] )(
		'tracks only the destination when entering through %s',
		async ( initialPath ) => {
			renderSteps( {}, initialPath );

			await waitFor( () => expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 ) );
			expect( recordUnifiedAdminPageView ).toHaveBeenCalledWith(
				expect.objectContaining( { path: '/setup/test-flow/domains' } )
			);
		}
	);

	it( 'does not count a redirect back to the current step as another view', async () => {
		renderSteps();
		await act( async () => {
			fireEvent.click( screen.getByText( 'Redirect to first step' ) );
		} );

		expect( window.location.pathname ).toBe( '/setup/test-flow/domains' );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for flow checks and does not count repeated checks as more views', () => {
		const { rerender } = renderSteps( { isResolving: true } );
		expect( recordUnifiedAdminPageView ).not.toHaveBeenCalled();

		rerender( { isResolving: false } );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
		rerender( { isResolving: true } );
		rerender( { isResolving: false } );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not track steps that redirect to authentication', () => {
		jest.mocked( isUserLoggedIn ).mockReturnValue( false );
		const { navigate } = renderSteps( { requiresLoggedInUser: true } );

		expect( navigate ).toHaveBeenCalledWith( 'user', expect.any( Object ), true );
		expect( recordUnifiedAdminPageView ).not.toHaveBeenCalled();
	} );

	it( 'does not track a step with no content, or double count content restored at the same path', () => {
		const { rerender } = renderSteps( { renderStep: () => null } );
		expect( recordUnifiedAdminPageView ).not.toHaveBeenCalled();

		rerender( {} );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
		rerender( { renderStep: () => null } );
		rerender( {} );
		expect( recordUnifiedAdminPageView ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'excludes Stepper on CIAB hosts', () => {
		jest.mocked( isAllowedCiabDashboardHostname ).mockReturnValue( true );
		renderSteps();

		expect( recordUnifiedAdminPageView ).not.toHaveBeenCalled();
	} );
} );
