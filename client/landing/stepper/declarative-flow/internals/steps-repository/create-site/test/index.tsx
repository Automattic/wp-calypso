/**
 * @jest-environment jsdom
 */
import { transferDomainToSite } from '@automattic/api-core';
import { Site } from '@automattic/data-stores';
import { addProductsToCart, createSite, replaceProductsInCart } from '@automattic/onboarding';
import { render, waitFor } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFlowState } from '../../../state-manager/store';
import { pollForAtomicProvisioning } from '../early-provisioning';
import CreateSite, { resetSiteAfterCartFailureForTests } from '../index';

// The action the step hands to the processing step, captured as it is set.
let pendingAction: ( () => Promise< unknown > ) | undefined;
let flowStateStore: Record< string, unknown >;
const mockReadFlowState = () => flowStateStore;
let mockBlueprint: string | null = null;
let mockSiteUrl = 'my-site.wordpress.com';
let mockQueryParams = new URLSearchParams( '' );
let mockIsSimplifiedOnboarding = false;
let mockDomainCartItems: Record< string, unknown >[] = [];
let mockPlanCartItem: Record< string, unknown > | null = null;

const registeredMove = {
	product_slug: 'domain_move_internal',
	meta: 'owned-domain.com',
	extra: { move_source_site_id: 555 },
};

// The step passes createSite's aiLaunchpadEnabled parameter last (see its call in ../index.tsx).
const getAiLaunchpadEnabledArg = () => ( createSite as jest.Mock ).mock.calls[ 0 ].at( -1 );

jest.mock( '@automattic/calypso-products', () => ( {
	isEcommerce: () => false,
	isDomainMoveInternal: ( { product_slug }: { product_slug: string } ) =>
		product_slug === 'domain_move_internal',
} ) );

jest.mock( '@automattic/api-core', () => ( { transferDomainToSite: jest.fn() } ) );

jest.mock( '@automattic/data-stores', () => ( {
	Site: { Visibility: { PublicIndexed: 1, PublicNotIndexed: 0 } },
	Onboard: { SiteIntent: { Sell: 'sell', Build: 'build' } },
} ) );

jest.mock( '@automattic/domain-search', () => ( {
	isFreeSubdomainQuery: ( query: string ) => query.endsWith( '.wordpress.com' ),
} ) );
jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_FLOW: 'ai-site-builder',
	SITE_MIGRATION_FLOW: 'site-migration',
	STUDENT_FLOW: 'student',
	DIRECT_TO_CART_FLOW: 'direct-to-cart',
	EDUCATION_FLOW: 'education',
	ENTREPRENEUR_FLOW: 'entrepreneur',
	NEWSLETTER_FLOW: 'newsletter',
	ONBOARDING_FLOW: 'onboarding',
	WRITE_NEW_SITE_FLOW: 'write-new-site',
	WRITE_ON_FLOW: 'write-on',
	StepContainer: () => null,
	Step: { Loading: () => null },
	addProductsToCart: jest.fn(),
	replaceProductsInCart: jest.fn(),
	createSite: jest.fn( async () => ( {
		siteId: 111,
		siteSlug: 'brand-new.wordpress.com',
		domainItem: undefined,
	} ) ),
	setThemeOnSite: jest.fn(),
	isAIBuilderOnboardingFlow: () => false,
	isCopySiteFlow: () => false,
	isDomainFlow: ( flow: string ) => flow === 'domain',
	isEntrepreneurFlow: () => false,
	isNewHostedSiteCreationFlow: () => false,
	isNewsletterFlow: () => false,
	isWriteOnFlow: () => false,
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
	isNewSiteMigrationFlow: () => false,
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { getQueryData: mockReadFlowState } ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setPendingAction: ( action: () => Promise< unknown > ) => {
			pendingAction = action;
		},
	} ),
	useSelect: () => ( {
		domainItem: undefined,
		domainCartItem: undefined,
		domainCartItems: mockDomainCartItems,
		planCartItem: mockPlanCartItem,
		productCartItems: [],
		selectedSiteTitle: 'My site',
		siteUrl: mockSiteUrl,
		progress: 0,
		partnerBundle: null,
		gardenName: null,
		gardenPartnerName: null,
		blueprint: mockBlueprint,
	} ),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( { useI18n: () => ( { __: ( s: string ) => s } ) } ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => () => null );
jest.mock( 'calypso/data/ecommerce/use-add-ecommerce-trial-mutation', () => () => ( {
	mutateAsync: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'ONBOARD_STORE' } ) );
jest.mock( 'calypso/landing/stepper/utils/wow-funnel', () => ( {
	getWowFunnelArgs: () => ( {} ),
	getWowFunnelFromWfm: () => false,
	getWowFunnelSlug: () => '',
	logWowFunnelEvent: jest.fn(),
	wowFunnelSiteIsPaid: () => false,
} ) );
jest.mock( 'calypso/landing/stepper/utils/wow-funnel-site', () => ( {
	startWowFunnelSite: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	retrieveSignupDestination: () => null,
	getSignupCompleteFlowName: () => null,
	wasSignupCheckoutPageUnloaded: () => false,
	getSignupCompleteSlug: () => null,
} ) );
jest.mock( 'calypso/state', () => ( { useSelector: () => undefined } ) );
jest.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( { getUrlData: jest.fn() } ) );
jest.mock( '../../../../../hooks/use-simplified-onboarding', () => ( {
	useSimplifiedOnboarding: () => [ false, mockIsSimplifiedOnboarding ],
} ) );
jest.mock( '../../../../helpers/should-use-step-container-v2', () => ( {
	shouldUseStepContainerV2: () => true,
} ) );
jest.mock( '../../../state-manager/store', () => ( { useFlowState: jest.fn() } ) );
jest.mock( '../../playground/lib/constants', () => ( {
	SESSION_KEY_FROM_PLAYGROUND_PUBLISH: 'from-playground-publish',
} ) );
jest.mock( '../early-provisioning', () => ( {
	EARLY_PROVISION_TARGET_WPCOM_ATOMIC: 'wpcom-atomic',
	getEarlyCreatedSiteId: () => null,
	pollForAtomicProvisioning: jest.fn(),
} ) );

// Mounts the step and hands back the action it registered, which is what the processing step runs.
const runStep = async ( { flow = 'onboarding' }: { flow?: string } = {} ) => {
	const StepComponent = CreateSite as unknown as React.ComponentType< Record< string, unknown > >;
	render( <StepComponent navigation={ { submit: jest.fn() } } flow={ flow } /> );

	await waitFor( () => expect( pendingAction ).toBeDefined() );

	return pendingAction!();
};

describe( 'create-site', () => {
	beforeEach( () => {
		pendingAction = undefined;
		flowStateStore = {};
		mockBlueprint = null;
		mockSiteUrl = 'my-site.wordpress.com';
		mockQueryParams = new URLSearchParams( '' );
		mockIsSimplifiedOnboarding = false;
		mockDomainCartItems = [];
		mockPlanCartItem = null;
		sessionStorage.clear();
		resetSiteAfterCartFailureForTests();
		jest.clearAllMocks();
		( useFlowState as jest.Mock ).mockImplementation( () => ( {
			get: ( key: string ) => flowStateStore[ key ],
			sessionId: 'migration-session',
			queryKey: [ 'stepper-state-item', 'site-migration', 'migration-session', 'v1' ],
			set: ( key: string, value: unknown ) => {
				flowStateStore[ key ] = value;
			},
		} ) );
	} );

	it( 'creates the site and records it against the name it asked for', async () => {
		const result = await runStep();

		expect( createSite ).toHaveBeenCalledTimes( 1 );
		expect( result ).toMatchObject( { siteId: 111, siteSlug: 'brand-new.wordpress.com' } );
		expect( flowStateStore.createdSite ).toEqual( {
			siteId: 111,
			siteSlug: 'brand-new.wordpress.com',
			requestedName: 'my-site.wordpress.com',
		} );
	} );

	// The whole point of the record: /sites/new is not idempotent, and the free-subdomain path asks
	// for an exact name, so a second request under it comes back as `blog_name_exists`.
	it( 'adopts the site the run already created instead of asking for a second one', async () => {
		flowStateStore.createdSite = {
			siteId: 222,
			siteSlug: 'already-made.wordpress.com',
			requestedName: 'my-site.wordpress.com',
		};

		const result = await runStep();

		expect( createSite ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( { siteId: 222, siteSlug: 'already-made.wordpress.com' } );
	} );

	it( 'reuses an unnamed migration site', async () => {
		mockSiteUrl = '';
		( useFlowState as jest.Mock ).mockImplementation( () => ( {
			get: () => undefined,
			sessionId: 'migration-session',
			queryKey: [ 'migration-session' ],
			set: ( key: string, value: unknown ) => {
				flowStateStore = { [ key ]: value };
			},
		} ) );
		await runStep( { flow: 'site-migration' } );
		const handoff = { from: 'https://source.example.com' };
		flowStateStore.migrationHandoff = handoff;
		await pendingAction!();
		expect( createSite ).toHaveBeenCalledTimes( 1 );
		expect( flowStateStore.migrationHandoff ).toEqual( handoff );
	} );

	// Nothing scopes the record to one run — the onboarding flow doesn't declare
	// `__experimentalUseSessions`, so its state is keyed on the flow alone and outlives the signup
	// that wrote it. A later signup asking for a different site has to create one.
	it( 'creates a new site when the record is for a different name', async () => {
		flowStateStore.createdSite = {
			siteId: 222,
			siteSlug: 'from-a-previous-signup.wordpress.com',
			requestedName: 'a-previous-name.wordpress.com',
		};

		const result = await runStep();

		expect( createSite ).toHaveBeenCalledTimes( 1 );
		expect( result ).toMatchObject( { siteId: 111, siteSlug: 'brand-new.wordpress.com' } );
	} );

	// The record is read before `await createSite()` and written after it. A second run of the
	// action that starts inside that window finds no record and asks /sites/new for the same name,
	// which the free-subdomain path refuses as `blog_name_exists`. The processing step runs the
	// action again whenever it mounts again, so this is the double-POST seen in production.
	it( 'asks /sites/new once when a second run starts while the first is still creating', async () => {
		let finishFirstCreate: ( site: unknown ) => void = () => {};
		( createSite as jest.Mock ).mockImplementationOnce(
			() =>
				new Promise( ( resolve ) => {
					finishFirstCreate = resolve;
				} )
		);

		const StepComponent = CreateSite as unknown as React.ComponentType< Record< string, unknown > >;
		render( <StepComponent navigation={ { submit: jest.fn() } } flow="onboarding" /> );
		await waitFor( () => expect( pendingAction ).toBeDefined() );

		const firstRun = pendingAction!();
		// Let the first run read the empty record and reach its await.
		await waitFor( () => expect( createSite ).toHaveBeenCalled() );
		const secondRun = pendingAction!();
		// Give the second run the same chance to reach the guard before the first request returns.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		finishFirstCreate( {
			siteId: 111,
			siteSlug: 'brand-new.wordpress.com',
			domainItem: undefined,
		} );
		const [ firstResult, secondResult ] = await Promise.all( [ firstRun, secondRun ] );

		expect( createSite ).toHaveBeenCalledTimes( 1 );
		// The same result, not an equal one: the second run joined the first instead of running the
		// cart and trial tail again against the site the first run made.
		expect( secondResult ).toBe( firstResult );
		expect( firstResult ).toMatchObject( { siteId: 111, siteSlug: 'brand-new.wordpress.com' } );
	} );

	// The in-flight map outlives the run that filled it. A failed request has to leave the map, or
	// every later run for the same name — Back from the error step, or another mount of the
	// processing step — joins the old rejection instead of asking again.
	it( 'asks /sites/new again after a failed creation instead of joining the stale rejection', async () => {
		( createSite as jest.Mock ).mockRejectedValueOnce( new Error( 'boom' ) );

		const StepComponent = CreateSite as unknown as React.ComponentType< Record< string, unknown > >;
		render( <StepComponent navigation={ { submit: jest.fn() } } flow="onboarding" /> );
		await waitFor( () => expect( pendingAction ).toBeDefined() );

		await expect( pendingAction!() ).rejects.toThrow( 'boom' );

		await expect( pendingAction!() ).resolves.toMatchObject( {
			siteId: 111,
			siteSlug: 'brand-new.wordpress.com',
		} );
		expect( createSite ).toHaveBeenCalledTimes( 2 );
	} );

	// A move on the Free plan costs nothing, so the step moves the domain without a checkout.
	it( 'moves a registered domain to the new site on the Free plan, without checkout', async () => {
		mockDomainCartItems = [ registeredMove ];

		await expect( runStep() ).resolves.toMatchObject( { goToCheckout: false } );

		expect( transferDomainToSite ).toHaveBeenCalledWith( 'owned-domain.com', 555, 111 );
		expect( addProductsToCart ).not.toHaveBeenCalled();
	} );

	it( 'leaves a domain move in the cart when a plan is in the cart', async () => {
		mockDomainCartItems = [ registeredMove ];
		mockPlanCartItem = { product_slug: 'personal-bundle' };

		await expect( runStep() ).resolves.toMatchObject( { goToCheckout: true } );

		expect( transferDomainToSite ).not.toHaveBeenCalled();
		expect( addProductsToCart ).toHaveBeenCalledWith(
			'brand-new.wordpress.com',
			'onboarding',
			[ mockPlanCartItem, registeredMove ],
			{ throwOnError: true }
		);
	} );

	// A rejected cart goes to the error step instead of an empty checkout.
	it.each( [ 'onboarding', 'domain' ] )(
		'asks the cart add to throw in the %s flow',
		async ( flow ) => {
			mockPlanCartItem = { product_slug: 'personal-bundle' };

			await runStep( { flow } );

			expect( addProductsToCart ).toHaveBeenCalledWith(
				'brand-new.wordpress.com',
				flow,
				[ mockPlanCartItem ],
				{ throwOnError: true }
			);
		}
	);

	// Some other flows that share this step have no failure branch after processing, so a throw
	// there has nothing to catch it.
	it( 'does not ask the cart add to throw in other flows', async () => {
		mockPlanCartItem = { product_slug: 'personal-bundle' };

		await runStep( { flow: 'newsletter' } );

		expect( addProductsToCart ).toHaveBeenCalledWith(
			'brand-new.wordpress.com',
			'newsletter',
			[ mockPlanCartItem ],
			{ throwOnError: false }
		);
	} );

	// The move needs no checkout, so a rejected cart must not skip it.
	it( 'moves a registered domain on the Free plan when the cart add rejects', async () => {
		const newDomain = { product_slug: 'domain_reg', meta: 'new-domain.com' };
		mockDomainCartItems = [ registeredMove, newDomain ];
		( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

		await expect( runStep() ).rejects.toThrow( 'cart rejected' );

		expect( transferDomainToSite ).toHaveBeenCalledWith( 'owned-domain.com', 555, 111 );
	} );

	// A second move of a domain that is already on the site fails and reports a failed move.
	it( 'skips the moves that worked when it reuses the site of a rejected cart', async () => {
		mockSiteUrl = '';
		const failedMove = {
			product_slug: 'domain_move_internal',
			meta: 'disputed-domain.com',
			extra: { move_source_site_id: 556 },
		};
		const newDomain = { product_slug: 'domain_reg', meta: 'new-domain.com' };
		mockDomainCartItems = [ registeredMove, failedMove, newDomain ];
		( transferDomainToSite as jest.Mock )
			.mockResolvedValueOnce( undefined )
			.mockRejectedValueOnce( { error: 'dispute_flag' } );
		( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

		await expect( runStep() ).rejects.toThrow( 'cart rejected' );
		await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 111 } );

		expect( createSite ).toHaveBeenCalledTimes( 1 );
		expect( ( transferDomainToSite as jest.Mock ).mock.calls ).toEqual( [
			[ 'owned-domain.com', 555, 111 ],
			[ 'disputed-domain.com', 556, 111 ],
			[ 'disputed-domain.com', 556, 111 ],
		] );
	} );

	describe( 'retry after a rejected cart', () => {
		beforeEach( () => {
			mockPlanCartItem = { product_slug: 'personal-bundle' };
		} );

		// The flow state record cannot match an unnamed request, so without this the retry from the
		// error step gives the account a second site.
		it( 'adds to the cart of the first site when an unnamed request is retried', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 111 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
			expect( addProductsToCart ).toHaveBeenLastCalledWith(
				'brand-new.wordpress.com',
				'onboarding',
				[ mockPlanCartItem ],
				{ throwOnError: true }
			);
		} );

		// The rejected attempt can leave items in the cart that the retry does not ask for.
		it( 'empties the cart of the first site before the retry adds its items', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			expect( replaceProductsInCart ).not.toHaveBeenCalled();

			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 111 } );

			expect( replaceProductsInCart ).toHaveBeenCalledTimes( 1 );
			expect( replaceProductsInCart ).toHaveBeenCalledWith( 'brand-new.wordpress.com', [], {
				throwOnError: true,
			} );
			expect( ( replaceProductsInCart as jest.Mock ).mock.invocationCallOrder[ 0 ] ).toBeLessThan(
				( addProductsToCart as jest.Mock ).mock.invocationCallOrder[ 1 ]
			);
		} );

		// The first site can go on without a checkout, so its cart must not keep the rejected items.
		it( 'empties the cart of the first site when the retry has nothing to add', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			mockPlanCartItem = null;
			pendingAction = undefined;
			await expect( runStep() ).resolves.toMatchObject( { siteId: 111 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
			expect( replaceProductsInCart ).toHaveBeenCalledTimes( 1 );
			expect( addProductsToCart ).toHaveBeenCalledTimes( 1 );
		} );

		// The old items would stay in the cart beside the new ones, so the retry must not go on.
		it( 'creates a new site after the cart of the first site could not be emptied', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			( replaceProductsInCart as jest.Mock ).mockRejectedValueOnce( new Error( 'not emptied' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			await expect( pendingAction!() ).rejects.toThrow( 'not emptied' );
			expect( addProductsToCart ).toHaveBeenCalledTimes( 1 );

			( createSite as jest.Mock ).mockResolvedValueOnce( {
				siteId: 222,
				siteSlug: 'second-try.wordpress.com',
				domainItem: undefined,
			} );
			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 222 } );
		} );

		// A run that finished has handed its site to checkout. The next unnamed run is a new signup.
		it( 'creates a new site for an unnamed request after a run that succeeded', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			await pendingAction!();
			await pendingAction!();

			expect( createSite ).toHaveBeenCalledTimes( 2 );
		} );

		// The site can be the reason the cart fails, so a retry on it gets one chance.
		it( 'creates a new site when the cart rejects the retry on the first site too', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock )
				.mockRejectedValueOnce( new Error( 'cart rejected' ) )
				.mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			await expect( pendingAction!() ).rejects.toThrow( 'cart rejected' );
			expect( createSite ).toHaveBeenCalledTimes( 1 );

			( createSite as jest.Mock ).mockResolvedValueOnce( {
				siteId: 222,
				siteSlug: 'second-try.wordpress.com',
				domainItem: undefined,
			} );
			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 222 } );

			expect( createSite ).toHaveBeenCalledTimes( 2 );
		} );

		// /sites/new refuses the exact name of a site that exists as `blog_name_exists`. A run that
		// stops before its cart, here on the Atomic wait, keeps the saved site but overwrites the
		// flow state record with its own name.
		it( 'reuses the first site when the retry asks for the free subdomain of that site', async () => {
			mockQueryParams = new URLSearchParams( 'provision_target=wpcom-atomic' );
			( pollForAtomicProvisioning as jest.Mock )
				.mockResolvedValueOnce( { siteSlug: 'my-site.wordpress.com' } )
				.mockRejectedValueOnce( new Error( 'atomic timeout' ) )
				.mockResolvedValueOnce( { siteSlug: 'my-site.wordpress.com' } );
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			mockSiteUrl = 'example.com';
			pendingAction = undefined;
			await expect( runStep() ).rejects.toThrow( 'atomic timeout' );

			mockSiteUrl = 'my-site.wordpress.com';
			pendingAction = undefined;
			await expect( runStep() ).resolves.toMatchObject( { siteId: 111 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
		} );

		// A free subdomain is the address of the site. The first site has another address.
		it( 'creates a new site when the retry asks for a free subdomain', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			( createSite as jest.Mock ).mockResolvedValueOnce( {
				siteId: 222,
				siteSlug: 'my-site.wordpress.com',
				domainItem: undefined,
			} );
			mockSiteUrl = 'my-site.wordpress.com';
			pendingAction = undefined;
			await expect( runStep() ).resolves.toMatchObject( { siteId: 222 } );

			expect( createSite ).toHaveBeenCalledTimes( 2 );
		} );

		// The flow state record matches on the name, so without this a retry with another domain
		// gives the account a second site and leaves the first one unused.
		it( 'adds to the cart of the first site when the retry asks for another paid domain', async () => {
			mockSiteUrl = 'example.com';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			mockSiteUrl = 'example.net';
			pendingAction = undefined;
			await expect( runStep() ).resolves.toMatchObject( { siteId: 111 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
			expect( flowStateStore.createdSite ).toMatchObject( {
				siteId: 111,
				requestedName: 'example.net',
			} );
		} );

		// The first site has the visibility and AI Launchpad setting of the flow that created it.
		it( 'creates a new site when the retry needs another visibility and AI Launchpad setting', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			pendingAction = undefined;
			await runStep( { flow: 'domain' } );

			expect( createSite ).toHaveBeenCalledTimes( 2 );
		} );

		// The intent applies only when it is set at creation, so the first site cannot get it later.
		it( 'creates a new site when the retry needs another site intent', async () => {
			mockSiteUrl = '';
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );
			await expect( runStep() ).rejects.toThrow( 'cart rejected' );

			mockIsSimplifiedOnboarding = true;
			pendingAction = undefined;
			await runStep();

			expect( createSite ).toHaveBeenCalledTimes( 2 );
			// The step passes the site intent to createSite as its eleventh argument.
			expect( ( createSite as jest.Mock ).mock.calls[ 1 ][ 10 ] ).toBe( 'build' );
		} );

		// After two failures the saved site no longer goes to a retry, but the flow state record
		// still gives the same site to a retry with the same name.
		it( 'empties the cart and skips the moves that worked on a third run for the same name', async () => {
			mockPlanCartItem = null;
			const newDomain = { product_slug: 'domain_reg', meta: 'new-domain.com' };
			mockDomainCartItems = [ registeredMove, newDomain ];
			( addProductsToCart as jest.Mock )
				.mockRejectedValueOnce( new Error( 'cart rejected' ) )
				.mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			await expect( pendingAction!() ).rejects.toThrow( 'cart rejected' );
			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 111 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
			expect( replaceProductsInCart ).toHaveBeenCalledTimes( 2 );
			expect( transferDomainToSite ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'adopts the recorded site when a named request is retried', async () => {
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'cart rejected' ) );

			await expect( runStep() ).rejects.toThrow( 'cart rejected' );
			flowStateStore.createdSite = {
				siteId: 333,
				siteSlug: 'recorded.wordpress.com',
				requestedName: 'my-site.wordpress.com',
			};
			await expect( pendingAction!() ).resolves.toMatchObject( { siteId: 333 } );

			expect( createSite ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	// The site works without the domain, so a failed move must not stop the signup.
	it( 'finishes the signup and records the failure when the move fails', async () => {
		mockDomainCartItems = [ registeredMove ];
		( transferDomainToSite as jest.Mock ).mockRejectedValueOnce( { error: 'dispute_flag' } );

		await expect( runStep() ).resolves.toMatchObject( { siteCreated: true } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_free_plan_domain_move_failed',
			{ flow: 'onboarding', error: 'dispute_flag' }
		);
	} );

	it( 'does not call the move without the site the domain is on now', async () => {
		mockDomainCartItems = [ { ...registeredMove, extra: {} } ];

		await expect( runStep() ).resolves.toMatchObject( { siteCreated: true } );

		expect( transferDomainToSite ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_free_plan_domain_move_failed',
			{ flow: 'onboarding', error: 'missing_move_source' }
		);
	} );

	it( 'rejects with "Failed to create site" when /sites/new returns nothing', async () => {
		( createSite as jest.Mock ).mockResolvedValueOnce( undefined );

		await expect( runStep() ).rejects.toThrow( 'Failed to create site' );
	} );

	// Without this, a reblog's site waits behind Coming Soon while its owner publishes the reblog.
	it( 'creates a public site for an onboarding reblog run', async () => {
		mockQueryParams = new URLSearchParams( 'blog_post=https://example.blog/a-post/' );
		await runStep();
		await waitFor( () => expect( createSite ).toHaveBeenCalled() );
		expect( ( createSite as jest.Mock ).mock.calls[ 0 ][ 2 ] ).toBe(
			Site.Visibility.PublicIndexed
		);
	} );

	// Without this, imported posts land next to the theme's demo content and a "build" checklist.
	it( 'creates an empty site with no intent or AI Launchpad for an import', async () => {
		mockQueryParams = new URLSearchParams( 'flow=import' );
		mockIsSimplifiedOnboarding = true;
		await runStep();
		await waitFor( () => expect( createSite ).toHaveBeenCalled() );

		const args = ( createSite as jest.Mock ).mock.calls[ 0 ];
		expect( args[ 5 ] ).toBe( false ); // useThemeHeadstart
		expect( args[ 10 ] ).toBe( '' ); // siteIntent
		expect( getAiLaunchpadEnabledArg() ).toBe( false );
	} );

	describe( 'AI Launchpad enablement', () => {
		it( 'enables the AI Launchpad for onboarding sites', async () => {
			await runStep();
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( true );
		} );

		it.each( [ 'newsletter', 'student' ] )(
			'enables it for the %s flow, which creates a fresh site',
			async ( flow ) => {
				await runStep( { flow } );
				await waitFor( () => expect( createSite ).toHaveBeenCalled() );
				expect( getAiLaunchpadEnabledArg() ).toBe( true );
			}
		);

		it( 'does not enable it for flows outside the rollout', async () => {
			await runStep( { flow: 'hundred-year-plan' } );
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( false );
		} );

		it( 'does not enable it for blueprint runs', async () => {
			mockBlueprint = 'some-blueprint';
			await runStep();
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( false );
		} );

		it( 'does not enable it for a playground run', async () => {
			mockQueryParams = new URLSearchParams( 'playground=some-playground' );
			await runStep();
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( false );
		} );

		it( 'does not enable it for a reblog run', async () => {
			mockQueryParams = new URLSearchParams( 'blog_post=https://example.blog/a-post/' );
			await runStep();
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( false );
		} );

		it( 'does not enable it for a playground-publish run', async () => {
			sessionStorage.setItem( 'from-playground-publish', '1' );
			await runStep();
			await waitFor( () => expect( createSite ).toHaveBeenCalled() );
			expect( getAiLaunchpadEnabledArg() ).toBe( false );
		} );
	} );
} );
