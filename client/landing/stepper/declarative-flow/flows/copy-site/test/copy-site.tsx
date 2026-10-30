/**
 * @jest-environment jsdom
 */
import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import { dispatch, select, useSelect } from '@wordpress/data';
import { MemoryRouter } from 'react-router';
import AutomatedCopySite from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/automated-copy-site';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { initialSiteState } from 'calypso/state/sites/features/reducer';
import { renderHookWithProvider, renderWithProvider } from 'calypso/test-helpers/testing-library';
import copySite from '../copy-site';
import type { OnboardActions, SiteDetails } from '@automattic/data-stores';

const mockLegacySiteGet = jest.fn();

jest.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: jest.fn(), post: jest.fn() },
	site: jest.fn( ( siteFragment ) => ( { get: () => mockLegacySiteGet( siteFragment ) } ) ),
} ) );
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	userPurchasesQuery: () => ( {
		queryKey: [ 'purchases' ],
		queryFn: async () => [],
		staleTime: Infinity,
	} ),
} ) );

const sourceSlug = 'source.wordpress.com';
const destinationSlug = 'destination.wordpress.com';
const source = {
	ID: 1,
	URL: `https://${ sourceSlug }`,
	description: '',
	domain: sourceSlug,
	jetpack: false,
	launch_status: 'launched',
	locale: 'en',
	logo: { id: '', sizes: [], url: '' },
	name: 'Source',
	slug: sourceSlug,
	title: 'Source',
	site_owner: 123,
	plan: {
		product_id: 1018,
		product_slug: 'business-bundle',
		product_name: 'Business',
		product_name_short: 'Business',
		expired: false,
		billing_period: '365',
		user_is_owner: true,
		is_free: false,
		features: { active: [], available: {} },
	},
	options: { is_wpcom_atomic: true },
} satisfies SiteDetails;
const destination = { ID: 2, URL: `https://${ destinationSlug }` };
const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' )!;
const navigate = jest.fn();

function renderAssertions( source = sourceSlug, step = 'domains' ) {
	return renderHookWithProvider(
		() => {
			useSelect( ( select ) => select( SITE_STORE ).getSite( destinationSlug ), [] );
			return copySite.useAssertConditions?.();
		},
		{
			wrapper: ( { children }: { children: React.ReactNode } ) => (
				<MemoryRouter
					basename="/setup"
					initialEntries={ [
						`/setup/copy-site/${ step }?sourceSlug=${ source }&siteSlug=${ destinationSlug }`,
					] }
				>
					{ children }
				</MemoryRouter>
			),
			initialState: { currentUser: { id: 123 } },
		}
	);
}

function renderEntry( features = {}, mountCopyStep = false ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	} );
	queryClient.setQueryData( [ 'purchases' ], [] );
	const states: AssertConditionState[] = [];
	function Entry() {
		useSite();
		const navigation = copySite.useStepNavigation( 'automated-copy', navigate );
		const assertion = copySite.useAssertConditions?.();
		states.push( assertion!.state );
		return (
			<>
				<output data-testid="validation">{ assertion?.state }</output>
				{ mountCopyStep && assertion?.state === AssertConditionState.SUCCESS && (
					<AutomatedCopySite flow="copy-site" stepName="automated-copy" navigation={ navigation } />
				) }
			</>
		);
	}
	const ui = (
		<MemoryRouter
			basename="/setup"
			initialEntries={ [
				`/setup/copy-site/${ mountCopyStep ? 'automated-copy' : 'domains' }?sourceSlug=${ sourceSlug }&siteSlug=${ destinationSlug }`,
			] }
		>
			<Entry />
		</MemoryRouter>
	);
	return {
		states,
		ui,
		...renderWithProvider( ui, {
			queryClient,
			initialState: { currentUser: { id: 123 }, sites: { features } },
		} ),
	};
}

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: jest.fn() },
	} );
} );

afterAll( () => Object.defineProperty( window, 'location', locationDescriptor ) );

beforeEach( () => {
	jest.clearAllMocks();
	const siteActions = dispatch( SITE_STORE );
	siteActions.reset();
	siteActions.invalidateResolutionForStore();
	( dispatch( ONBOARD_STORE ) as OnboardActions ).resetOnboardStore();
	mockLegacySiteGet.mockImplementation( ( siteFragment ) =>
		Promise.resolve( siteFragment === destinationSlug ? destination : source )
	);
	jest.mocked( wpcom.req.post ).mockResolvedValue( undefined );
} );

describe( 'copy site source validation', () => {
	it( 'rejects a missing source without validating the destination as the source', async () => {
		jest.mocked( wpcomRequest ).mockResolvedValue( destination );
		const { result } = renderAssertions( '' );
		await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.FAILURE ) );
		expect( result.current?.message ).toBe( 'Copy Site flow requires a valid source site.' );
		expect( window.location.assign ).toHaveBeenCalledWith( '/sites' );
		expect( wpcom.req.get ).not.toHaveBeenCalled();
		expect( wpcom.req.post ).not.toHaveBeenCalled();
	} );

	it.each( [ 'destination first', 'source first', 'destination fails' ] )(
		'waits for source details and features when %s',
		async ( order ) => {
			const sourceRequest = Promise.withResolvers< typeof source >();
			const destinationRequest = Promise.withResolvers< typeof destination >();
			const featuresRequest = Promise.withResolvers< { active: string[] } >();
			jest.mocked( wpcomRequest ).mockImplementation( ( { path } ) => {
				if ( path === `/sites/${ sourceSlug }` ) {
					return sourceRequest.promise;
				}
				if ( path === `/sites/${ destinationSlug }` ) {
					return destinationRequest.promise;
				}
				return Promise.resolve( source );
			} );
			jest.mocked( wpcom.req.get ).mockReturnValue( featuresRequest.promise );
			const { result } = renderAssertions();
			await waitFor( () => expect( wpcomRequest ).toHaveBeenCalledTimes( 2 ) );
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );

			if ( order !== 'source first' ) {
				await act( async () => {
					if ( order === 'destination fails' ) {
						destinationRequest.reject( new Error( 'Destination unavailable' ) );
					} else {
						destinationRequest.resolve( destination );
					}
				} );
			}
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );
			expect( window.location.assign ).not.toHaveBeenCalled();

			await act( async () => sourceRequest.resolve( source ) );
			await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/1/features' ) );
			expect( result.current?.state ).toBe( AssertConditionState.CHECKING );
			expect( window.location.assign ).not.toHaveBeenCalled();

			await act( async () => featuresRequest.resolve( { active: [ WPCOM_FEATURES_COPY_SITE ] } ) );
			await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.SUCCESS ) );
			if ( order === 'source first' ) {
				await act( async () => destinationRequest.resolve( destination ) );
			}
			expect( result.current?.state ).toBe( AssertConditionState.SUCCESS );
			expect( window.location.assign ).not.toHaveBeenCalled();
		}
	);

	it( 'rejects a failed source request', async () => {
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				path === `/sites/${ sourceSlug }`
					? Promise.reject( new Error( 'Source unavailable' ) )
					: Promise.resolve( destination )
			);
		const { result } = renderAssertions();
		await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.FAILURE ) );
		expect( result.current?.message ).toBe( 'Copy Site flow couldn´t fetch source site details.' );
		expect( window.location.assign ).toHaveBeenCalledWith( '/sites' );
	} );

	it.each( [ 'unavailable feature', 'failed features request' ] )(
		'rejects the source: %s',
		async ( outcome ) => {
			jest
				.mocked( wpcomRequest )
				.mockImplementation( ( { path } ) =>
					Promise.resolve( path === `/sites/${ destinationSlug }` ? destination : source )
				);
			if ( outcome === 'failed features request' ) {
				jest.mocked( wpcom.req.get ).mockRejectedValue( new Error( 'Features unavailable' ) );
			} else {
				jest.mocked( wpcom.req.get ).mockResolvedValue( { active: [] } );
			}
			const { result } = renderAssertions();
			await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.FAILURE ) );
			expect( window.location.assign ).toHaveBeenCalledWith( '/sites' );
		}
	);
} );

describe( 'copy site failure handling', () => {
	it( 'waits for the destination lookup without needing source access after checkout', async () => {
		const request = Promise.withResolvers< typeof destination >();
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				path === `/sites/${ destinationSlug }`
					? request.promise
					: Promise.reject( new Error( 'Source unavailable' ) )
			);
		jest.mocked( wpcom.req.get ).mockResolvedValue( { active: [ WPCOM_FEATURES_COPY_SITE ] } );
		renderEntry( {}, true );
		await waitFor( () =>
			expect( screen.getByTestId( 'validation' ) ).toHaveTextContent( AssertConditionState.SUCCESS )
		);
		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( navigate ).not.toHaveBeenCalled();
		await act( async () => request.resolve( destination ) );
		await waitFor( () => expect( navigate ).toHaveBeenCalledWith( 'processing-copy' ) );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( wpcomRequest ).not.toHaveBeenCalledWith(
			expect.objectContaining( { path: `/sites/${ sourceSlug }` } )
		);
	} );

	it( 'ignores completion of an older feature request after switching sites', async () => {
		const firstRequest = Promise.withResolvers< { active: string[] } >();
		const secondRequest = Promise.withResolvers< { active: string[] } >();
		const secondSite = { ...source, ID: 2, URL: destination.URL };
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				Promise.resolve( path === '/sites/2' ? secondSite : source )
			);
		jest
			.mocked( wpcom.req.get )
			.mockImplementation( ( path: string ) =>
				path === '/sites/1/features' ? firstRequest.promise : secondRequest.promise
			);
		const { result, rerender } = renderHookWithProvider(
			( { site }: { site: typeof source } ) => useSiteCopy( site ),
			{ initialProps: { site: source }, initialState: { currentUser: { id: 123 } } }
		);
		await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/1/features' ) );
		rerender( { site: secondSite } );
		await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/2/features' ) );
		await act( async () => secondRequest.resolve( { active: [ WPCOM_FEATURES_COPY_SITE ] } ) );
		await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
		await act( async () => firstRequest.resolve( { active: [] } ) );
		expect( result.current.isFetching ).toBe( false );
	} );

	it.each( [ 'negative features', 'failed feature request' ] )(
		'waits for fresh eligibility without redirecting when entering with cached %s',
		async ( cached ) => {
			const request = Promise.withResolvers< { active: string[] } >();
			jest
				.mocked( wpcomRequest )
				.mockImplementation( ( { path } ) =>
					Promise.resolve( path === `/sites/${ destinationSlug }` ? destination : source )
				);
			jest.mocked( wpcom.req.get ).mockReturnValue( request.promise );
			dispatch( SITE_STORE ).receiveSite( source.ID, source );
			const features = {
				[ source.ID ]: {
					...initialSiteState,
					hasLoadedFromServer: cached === 'negative features',
					data: cached === 'negative features' ? { active: [], available: {} } : null,
					error: cached === 'failed feature request' ? 'Prior request failed' : null,
				},
			};
			const { states } = renderEntry( features );
			expect( states[ 0 ] ).toBe( AssertConditionState.CHECKING );
			expect( window.location.assign ).not.toHaveBeenCalled();
			await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/1/features' ) );
			await act( async () => request.resolve( { active: [ WPCOM_FEATURES_COPY_SITE ] } ) );
			await waitFor( () =>
				expect( screen.getByTestId( 'validation' ) ).toHaveTextContent(
					AssertConditionState.SUCCESS
				)
			);
			expect( window.location.assign ).not.toHaveBeenCalled();
		}
	);

	it( 'exits to the sites list when the destination lookup fails without rejecting the source', async () => {
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				path === `/sites/${ destinationSlug }`
					? Promise.reject( new Error( 'Destination unavailable' ) )
					: Promise.resolve( source )
			);
		jest.mocked( wpcom.req.get ).mockResolvedValue( { active: [ WPCOM_FEATURES_COPY_SITE ] } );
		const view = renderEntry( {}, true );
		await waitFor( () =>
			expect( screen.getByTestId( 'validation' ) ).toHaveTextContent( AssertConditionState.SUCCESS )
		);
		view.rerender( view.ui );
		await waitFor( () => expect( window.location.assign ).toHaveBeenCalledWith( '/sites' ) );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( navigate ).not.toHaveBeenCalled();
		expect( select( ONBOARD_STORE ).getPendingAction() ).toBeUndefined();
		expect(
			jest
				.mocked( wpcomRequest )
				.mock.calls.filter( ( [ request ] ) => request.path === `/sites/${ destinationSlug }` )
		).toHaveLength( 1 );
	} );

	it( 'routes a processing failure to the error screen instead of home', async () => {
		const { result } = renderHookWithProvider(
			() => copySite.useStepNavigation( 'processing-copy', navigate ),
			{
				wrapper: ( { children }: { children: React.ReactNode } ) => (
					<MemoryRouter>{ children }</MemoryRouter>
				),
			}
		);
		await act( async () => {
			await result.current.submit( { processingResult: ProcessingResult.FAILURE } );
		} );
		expect( navigate ).toHaveBeenCalledWith( 'error' );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'keeps the error screen accessible without source information', async () => {
		jest.mocked( wpcomRequest ).mockResolvedValue( destination );
		const { result } = renderAssertions( '', 'error' );
		await waitFor( () => expect( result.current?.state ).toBe( AssertConditionState.SUCCESS ) );
		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( wpcom.req.get ).not.toHaveBeenCalled();
	} );
} );

describe( 'backend copy progress', () => {
	const transferPath = '/sites/2/atomic/transfers/latest';
	const initializationPath = '/sites/2/copy-from-site';
	const started = { status: 'started', transfer_id: 42, error_code: null };

	beforeEach( () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( started );
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				Promise.resolve(
					path === transferPath ? { atomic_transfer_id: 42, status: 'completed' } : destination
				)
			);
	} );

	afterEach( () => jest.useRealTimers() );

	const renderProgress = async () => {
		renderWithProvider(
			<MemoryRouter
				basename="/setup"
				initialEntries={ [ `/setup/copy-site/automated-copy?siteSlug=${ destinationSlug }` ] }
			>
				<AutomatedCopySite
					flow="copy-site"
					stepName="automated-copy"
					navigation={ { submit: jest.fn(), exitFlow: jest.fn() } }
				/>
			</MemoryRouter>
		);
		await waitFor( () => expect( select( ONBOARD_STORE ).getPendingAction() ).toBeDefined() );
		jest.useFakeTimers();
		return select( ONBOARD_STORE ).getPendingAction()!;
	};

	it( 'waits for backend initialization and completes only the matching transfer without a POST', async () => {
		jest
			.mocked( wpcom.req.get )
			.mockResolvedValueOnce( { ...started, status: 'not_started', transfer_id: null } )
			.mockResolvedValueOnce( { ...started, status: 'initializing', transfer_id: null } );
		let transferRequests = 0;
		jest.mocked( wpcomRequest ).mockImplementation( ( { path } ) => {
			if ( path === transferPath ) {
				return Promise.resolve( {
					atomic_transfer_id: ++transferRequests === 1 ? '41' : '42',
					status: 'completed',
				} );
			}
			return Promise.resolve( destination );
		} );
		const action = await renderProgress();
		const outcome = expect( action() ).resolves.toEqual( {
			finishedWaitingForCopy: true,
			siteSlug: destinationSlug,
		} );
		await act( async () => jest.advanceTimersByTimeAsync( 6000 ) );
		expect( transferRequests ).toBe( 0 );
		await act( async () => jest.advanceTimersByTimeAsync( 3000 ) );
		expect( transferRequests ).toBe( 1 );
		expect( select( ONBOARD_STORE ).getProgress() ).toBe( 0 );
		await act( async () => jest.advanceTimersByTimeAsync( 3000 ) );
		expect( select( ONBOARD_STORE ).getProgress() ).toBe( 100 );
		await outcome;
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 3 );
		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: initializationPath,
			apiNamespace: 'wpcom/v2',
		} );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
	} );

	it.each( [ 'initialization failed', 'status request failed' ] )(
		'propagates %s through the pending action',
		async ( scenario ) => {
			if ( scenario === 'initialization failed' ) {
				jest.mocked( wpcom.req.get ).mockResolvedValue( {
					status: 'failed',
					transfer_id: null,
					error_code: 'rest_cannot_view',
				} );
			} else {
				jest.mocked( wpcom.req.get ).mockRejectedValue( new Error( 'Status unavailable' ) );
			}
			const action = await renderProgress();
			const outcome = expect( action() ).rejects.toThrow( 'Error copying site' );
			await act( async () => jest.advanceTimersByTimeAsync( 3000 ) );
			await outcome;
			expect( wpcom.req.post ).not.toHaveBeenCalled();
			expect( wpcomRequest ).not.toHaveBeenCalledWith(
				expect.objectContaining( { path: transferPath } )
			);
		}
	);

	it( 'times out while initialization has not started', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( {
			...started,
			status: 'not_started',
			transfer_id: null,
		} );
		const action = await renderProgress();
		const outcome = expect( action() ).rejects.toThrow(
			'Setting up your site is taking longer than expected.'
		);
		await act( async () => jest.advanceTimersByTimeAsync( 303000 ) );
		await outcome;
		expect( wpcom.req.post ).not.toHaveBeenCalled();
	} );

	it( 'reports a matching transfer that reverted before the first poll', async () => {
		jest
			.mocked( wpcomRequest )
			.mockImplementation( ( { path } ) =>
				Promise.resolve(
					path === transferPath ? { atomic_transfer_id: 42, status: 'reverted' } : destination
				)
			);
		const action = await renderProgress();
		const outcome = expect( action() ).rejects.toThrow(
			"We stopped setting up your site because the upgrade didn't go through."
		);
		await act( async () => jest.advanceTimersByTimeAsync( 3000 ) );
		await outcome;
	} );
} );
