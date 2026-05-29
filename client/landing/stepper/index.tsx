import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	setRequester as setDataStoresRequester,
	UserActions,
	User as UserStore,
	HelpCenter,
} from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_SPEC_FLOW,
	DOMAIN_FLOW,
	WOO_HOSTED_PLANS_FLOW,
	setRequester as setOnboardingRequester,
} from '@automattic/onboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { useSelect, dispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupCountryCode } from 'calypso/boot/geolocation';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { AsyncHelpCenterApp } from 'calypso/components/help-center';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { setupErrorLogger } from 'calypso/lib/error-logger/setup-error-logger';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import { addQueryArgs } from 'calypso/lib/url';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { onDisablePersistence } from 'calypso/lib/user/store';
import wpcom from 'calypso/lib/wp';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache, persistOnChange } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setCurrentFlowName } from 'calypso/state/signup/flow/actions';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { FlowRenderer } from './declarative-flow/internals';
import { tryPreload } from './declarative-flow/internals/hooks/use-preload-steps';
import 'calypso/assets/stylesheets/style.scss';
import { createSessionId } from './declarative-flow/internals/state-manager/create-session-id';
import availableFlows from './declarative-flow/registered-flows';
import { USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { enhanceFlowWithUtilityFunctions } from './utils/enhance-flow-with-utils';
import { enhanceFlowWithAuth, injectUserStepInSteps } from './utils/enhanceFlowWithAuth';
import redirectPathIfNecessary from './utils/flow-redirect-handler';
import { DEFAULT_FLOW, getFlowFromURL, getStepFromURL } from './utils/get-flow-from-url';
import { startStepperPerformanceTracking } from './utils/performance-tracking';
import { getSessionId } from './utils/use-session-id';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { CurrentUser, HelpCenterSelect, HelpCenterDispatch } from '@automattic/data-stores';
import type { AnyAction } from 'redux';
import type { WpcomRequestParams } from 'wpcom-proxy-request';

const loadCookieBanner = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-cookie-banner" */ 'calypso/blocks/cookie-banner'
	);
const loadGlobalNotices = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-global-notices" */ 'calypso/components/global-notices'
	);
const loadAgentsManagerLoader = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-agents-manager-loader" */ 'calypso/layout/agents-manager-loader'
	);
const loadWebpackBuildMonitor = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-webpack-build-monitor" */ 'calypso/components/webpack-build-monitor'
	);

declare const window: AppWindow;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initializeCalypsoUserStore( reduxStore: any, user: CurrentUser ) {
	reduxStore.dispatch( setCurrentUser( user ) );
}

interface AppWindow extends Window {
	BUILD_TARGET: string;
}

const getSiteIdFromURL = () => {
	const siteId = new URLSearchParams( window.location.search ).get( 'siteId' );
	return siteId ? Number( siteId ) : null;
};

/**
 * Flows that should not render the Help Center. The stepper has no masterbar or help button, so
 * the Help Center can only auto-open from persisted preferences in these flows, which is
 * disruptive. Flows that programmatically open the Help Center (e.g., hundred-year-plan,
 * do-it-for-me) should NOT be added to this set.
 */
const FLOWS_WITHOUT_HELP_CENTER = new Set< string >( [
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_SPEC_FLOW,
	DOMAIN_FLOW,
] );

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * Mounts the Help Center only when programmatically opened. Prevents the disruptive auto-open
 * from persisted preferences while still allowing on-demand opens (e.g., plan downgrade support).
 */
function LazyHelpCenter( { currentUser }: { currentUser: UserStore.CurrentUser } ) {
	const isHelpCenterShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);

	if ( ! isHelpCenterShown ) {
		return null;
	}

	return <AsyncHelpCenterApp currentUser={ currentUser } sectionName="stepper" />;
}

async function main() {
	const { pathname, search } = window.location;

	// Before proceeding we redirect the user if necessary.
	if ( redirectPathIfNecessary( pathname, search ) ) {
		return null;
	}
	// Sympathy mode clears cache randomly, Stepper uses the cache to persist state (not really a cache).
	config.enable( 'no-force-sympathy' );

	if ( config.isEnabled( 'oauth' ) ) {
		// Build a requester that delegates to wpcom.req.get/post so requests go
		// through the standard lib/wp path (which injects the OAuth token via
		// sendRequest). We decompose the flat WpcomRequestParams into the
		// (params, query, [body], callback) signature that req.get/post expect.
		const requester = < T, >( params: WpcomRequestParams ) => {
			const { query, body, method, ...rest } = params;
			const queryObj =
				typeof query === 'string'
					? Object.fromEntries( new URLSearchParams( query ) )
					: query || {};

			return new Promise< T >( ( resolve, reject ) => {
				const cb = ( error: Error, response: T ) => {
					if ( error ) {
						reject( error );
					} else {
						resolve( response );
					}
				};
				if ( method && ( method as string ).toUpperCase() !== 'GET' ) {
					wpcom.req.post( { ...rest, method }, queryObj, body, cb );
				} else {
					wpcom.req.get( rest, queryObj, cb );
				}
			} );
		};
		setDataStoresRequester( requester );
		setOnboardingRequester( requester );
	}

	const flowName = getFlowFromURL();
	const flowLoader = availableFlows[ flowName ];

	if ( typeof flowLoader !== 'function' ) {
		// If the URL can't be traced back to an existing flow, stop the boot
		// process and redirect to the default flow.
		window.location.href = `/setup/${ DEFAULT_FLOW }${ window.location.search }`;

		return;
	}

	const siteId = getSiteIdFromURL();
	// Load the flow asynchronously while things happen in parallel.
	const flowPromise = flowLoader();

	// Start tracking performance, bearing in mind this is a full page load.
	startStepperPerformanceTracking( { fullPageLoad: true } );

	setupWpDataDebug();

	// Add accessible-focus listener.
	accessibleFocus();

	const user = await initializeCurrentUser();
	const userId = user ? user.ID : 0;
	let queryClient;

	let { default: flow } = await flowPromise;

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
	onDisablePersistence( persistOnChange( reduxStore, userId ) );
	setupLocale( user, reduxStore );
	setupCountryCode();
	const { receiveCurrentUser } = dispatch( USER_STORE ) as UserActions;

	if ( user ) {
		initializeCalypsoUserStore( reduxStore, user );
		receiveCurrentUser( user as UserStore.CurrentUser );
	}

	initializeAnalytics( user, getSuperProps( reduxStore ) );

	setupErrorLogger( reduxStore );

	loadDevHelpers( reduxStore );

	// When re-using steps from /start, we need to set the current flow name in the redux store, since some depend on it.
	reduxStore.dispatch( setCurrentFlowName( flow.name ) );
	reduxStore.dispatch( setSelectedSiteId( siteId ) as unknown as AnyAction );

	let flowSteps = 'initialize' in flow ? await flow.initialize( reduxStore ) : null;

	if ( '__experimentalUseSessions' in flow ) {
		const sessionId = getSessionId() || createSessionId();
		history.replaceState( null, '', addQueryArgs( { sessionId }, window.location.href ) );
		queryClient = ( await createQueryClient( 'stepper-persistence-session-' + sessionId ) )
			.queryClient;
	} else {
		queryClient = ( await createQueryClient( userId ) ).queryClient;
	}

	/**
	 * When `initialize` returns false, it means the app should be killed (the user probably issued a redirect).
	 */
	if ( flowSteps === false ) {
		return;
	}

	// Checking for initialize implies this is a V2 flow.
	// CLEAN UP: once the `onboarding` flow is migrated to V2, this can be cleaned up to only support V2
	// The `onboarding` flow is the only flow that uses in-stepper auth so far, so all the auth logic catering V1 can be deleted.
	if ( 'initialize' in flow && flowSteps ) {
		// Cache the flow steps for later internal usage. We need to cache them because we promise to call `initialize` only once.
		flowSteps = injectUserStepInSteps( flowSteps ) as typeof flowSteps;
		flow.__flowSteps = flowSteps;
		enhanceFlowWithUtilityFunctions( flow );

		// Warm the initial step's chunk so it's ready by the time React.lazy
		// hits the Suspense boundary.
		const findStep = ( slug?: string ) =>
			flowSteps.find( ( s: { slug: string } ) => s.slug === slug );

		tryPreload( findStep( getStepFromURL() || flowSteps[ 0 ]?.slug ) );

		// Logged-out users get redirected to the auth step first; warm it too.
		if ( ! user ) {
			tryPreload( findStep( 'user' ) );
		}
	} else if ( 'useSteps' in flow ) {
		// V1 flows have to be enhanced by changing their `useSteps` hook.
		flow = enhanceFlowWithAuth( flow );
	}

	// Clear any persisted help_center_open preference before React renders so the
	// isHelpCenterShown resolver won't auto-open the Help Center in this flow.
	if ( flowName === WOO_HOSTED_PLANS_FLOW ) {
		( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ] ).showHelpCenter( false );
	}

	const root = createRoot( document.getElementById( 'wpcom' ) as HTMLElement );

	root.render(
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowRenderer flow={ flow } steps={ flowSteps } />
						{ config.isEnabled( 'cookie-banner' ) && (
							<AsyncLoad require={ loadCookieBanner } placeholder={ null } />
						) }
						<AsyncLoad require={ loadGlobalNotices } placeholder={ null } id="notices" />
					</BrowserRouter>
					{ ! FLOWS_WITHOUT_HELP_CENTER.has( flowName ) &&
						( flowName === WOO_HOSTED_PLANS_FLOW ? (
							<LazyHelpCenter currentUser={ user as UserStore.CurrentUser } />
						) : (
							<>
								<AsyncHelpCenterApp
									requireLogin
									currentUser={ user as UserStore.CurrentUser }
									sectionName="stepper"
								/>
								<AsyncLoad
									require={ loadAgentsManagerLoader }
									placeholder={ null }
									sectionName={ flowName }
									loadAgentsManager
								/>
							</>
						) ) }
					{ 'development' === process.env.NODE_ENV && (
						<AsyncLoad require={ loadWebpackBuildMonitor } placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>
	);
}

main();
