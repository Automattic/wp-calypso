/**
 * @jest-environment jsdom
 */
import { createSite } from '@automattic/onboarding';
import { render, waitFor } from '@testing-library/react';
import { useFlowState } from '../../../state-manager/store';
import CreateSite from '../index';

// The action the step hands to the processing step, captured as it is set.
let pendingAction: ( () => Promise< unknown > ) | undefined;
let flowStateStore: Record< string, unknown >;

jest.mock( '@automattic/calypso-products', () => ( { isEcommerce: () => false } ) );

jest.mock( '@automattic/data-stores', () => ( {
	Site: { Visibility: { PublicIndexed: 1, PublicNotIndexed: 0 } },
	Onboard: { SiteIntent: { Sell: 'sell', Build: 'build' } },
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_FLOW: 'ai-site-builder',
	EDUCATION_FLOW: 'education',
	ENTREPRENEUR_FLOW: 'entrepreneur',
	StepContainer: () => null,
	Step: { Loading: () => null },
	addProductsToCart: jest.fn(),
	createSite: jest.fn( async () => ( {
		siteId: 111,
		siteSlug: 'brand-new.wordpress.com',
		domainItem: undefined,
	} ) ),
	setThemeOnSite: jest.fn(),
	isAIBuilderOnboardingFlow: () => false,
	isCopySiteFlow: () => false,
	isEntrepreneurFlow: () => false,
	isNewHostedSiteCreationFlow: () => false,
	isNewsletterFlow: () => false,
	isReadymadeFlow: () => false,
	isWriteOnFlow: () => false,
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
	isNewSiteMigrationFlow: () => false,
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
		domainCartItems: [],
		planCartItem: null,
		productCartItems: [],
		selectedSiteTitle: 'My site',
		siteUrl: 'my-site.wordpress.com',
		progress: 0,
		partnerBundle: null,
		gardenName: null,
		gardenPartnerName: null,
	} ),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( { useI18n: () => ( { __: ( s: string ) => s } ) } ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/loading', () => () => null );
jest.mock( 'calypso/data/ecommerce/use-add-ecommerce-trial-mutation', () => () => ( {
	mutateAsync: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( '' ),
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
jest.mock( 'calypso/lib/ai-launchpad', () => ( {
	resolveLaunchpadPersonalizationVariation: jest.fn( async () => 'control' ),
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
	useSimplifiedOnboarding: () => [ false, false ],
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
const runStep = async () => {
	const StepComponent = CreateSite as unknown as React.ComponentType< Record< string, unknown > >;
	render( <StepComponent navigation={ { submit: jest.fn() } } flow="onboarding" /> );

	await waitFor( () => expect( pendingAction ).toBeDefined() );

	return pendingAction!();
};

describe( 'create-site', () => {
	beforeEach( () => {
		pendingAction = undefined;
		flowStateStore = {};
		jest.clearAllMocks();
		( useFlowState as jest.Mock ).mockImplementation( () => ( {
			get: ( key: string ) => flowStateStore[ key ],
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
		await Promise.all( [ firstRun, secondRun ] );

		expect( createSite ).toHaveBeenCalledTimes( 1 );
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

	it( 'rejects with "Failed to create site" when /sites/new returns nothing', async () => {
		( createSite as jest.Mock ).mockResolvedValueOnce( undefined );

		await expect( runStep() ).rejects.toThrow( 'Failed to create site' );
	} );
} );
