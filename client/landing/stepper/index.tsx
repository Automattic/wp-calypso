import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import { User as UserStore } from '@automattic/data-stores';
import { geolocateCurrencySymbol } from '@automattic/format-currency';
import {
	HOSTED_SITE_MIGRATION_FLOW,
	MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
	SITE_MIGRATION_FLOW,
} from '@automattic/onboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { setupErrorLogger } from 'calypso/lib/error-logger/setup-error-logger';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { onDisablePersistence } from 'calypso/lib/user/store';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache, persistOnChange } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setCurrentFlowName } from 'calypso/state/signup/flow/actions';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { FlowRenderer } from './declarative-flow/internals';
import { AsyncHelpCenter } from './declarative-flow/internals/components';
import 'calypso/components/environment-badge/style.scss';
import 'calypso/assets/stylesheets/style.scss';
import availableFlows from './declarative-flow/registered-flows';
import { USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { enhanceFlowWithAuth } from './utils/enhanceFlowWithAuth';
import redirectPathIfNecessary from './utils/flow-redirect-handler';
import { getFlowFromURL } from './utils/get-flow-from-url';
import { startStepperPerformanceTracking } from './utils/performance-tracking';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Flow } from './declarative-flow/internals/types';
import type { AnyAction } from 'redux';

declare const window: AppWindow;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initializeCalypsoUserStore( reduxStore: any, user: CurrentUser ) {
	reduxStore.dispatch( setCurrentUser( user ) );
}

function determineFlow() {
	const flowNameFromPathName = window.location.pathname.split( '/' )[ 2 ];

	return availableFlows[ flowNameFromPathName ] || availableFlows[ 'site-setup' ];
}

/**
 * TODO: this is no longer a switch and should be removed
 */
const FlowSwitch: React.FC< { user: UserStore.CurrentUser | undefined; flow: Flow } > = ( {
	user,
	flow,
} ) => {
	const { receiveCurrentUser } = useDispatch( USER_STORE );
	user && receiveCurrentUser( user as UserStore.CurrentUser );

	return <FlowRenderer flow={ flow } />;
};
interface AppWindow extends Window {
	BUILD_TARGET: string;
}

const DEFAULT_FLOW = 'site-setup';

const getSiteIdFromURL = () => {
	const siteId = new URLSearchParams( window.location.search ).get( 'siteId' );
	return siteId ? Number( siteId ) : null;
};

const HOTJAR_ENABLED_FLOWS = [
	MIGRATION_FLOW,
	SITE_MIGRATION_FLOW,
	HOSTED_SITE_MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
];

const initializeHotJar = ( flowName: string ) => {
	if ( HOTJAR_ENABLED_FLOWS.includes( flowName ) ) {
		addHotJarScript();
	}
};

window.AppBoot = async () => {
	const { pathname, search } = window.location;

	// Before proceeding we redirect the user if necessary.
	if ( redirectPathIfNecessary( pathname, search ) ) {
		return null;
	}

	const flowName = getFlowFromURL();
	const siteId = getSiteIdFromURL();

	if ( ! flowName ) {
		// Stop the boot process if we can't determine the flow, reducing the number of edge cases
		return ( window.location.href = `/setup/${ DEFAULT_FLOW }${ window.location.search }` );
	}

	// Start tracking performance, bearing in mind this is a full page load.
	startStepperPerformanceTracking( { fullPageLoad: true } );

	initializeHotJar( flowName );
	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();

	// Add accessible-focus listener.
	accessibleFocus();

	const user = ( await initializeCurrentUser() ) as unknown;
	const userId = ( user as CurrentUser ).ID;

	const { queryClient } = await createQueryClient( userId );

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
	onDisablePersistence( persistOnChange( reduxStore, userId ) );
	setupLocale( user, reduxStore );

	user && initializeCalypsoUserStore( reduxStore, user as CurrentUser );

	initializeAnalytics( user, getSuperProps( reduxStore ) );

	setupErrorLogger( reduxStore );

	const flowLoader = determineFlow();
	const { default: rawFlow } = await flowLoader();
	const flow = rawFlow.__experimentalUseBuiltinAuth ? enhanceFlowWithAuth( rawFlow ) : rawFlow;

	// When re-using steps from /start, we need to set the current flow name in the redux store, since some depend on it.
	reduxStore.dispatch( setCurrentFlowName( flow.name ) );
	reduxStore.dispatch( setSelectedSiteId( siteId ) as unknown as AnyAction );

	// No need to await this, it's not critical to the boot process and will slow booting down.
	geolocateCurrencySymbol();

	const root = createRoot( document.getElementById( 'wpcom' ) as HTMLElement );

	root.render(
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowSwitch user={ user as UserStore.CurrentUser } flow={ flow } />
						{ config.isEnabled( 'cookie-banner' ) && (
							<AsyncLoad require="calypso/blocks/cookie-banner" placeholder={ null } />
						) }
						<AsyncLoad
							require="calypso/components/global-notices"
							placeholder={ null }
							id="notices"
						/>
					</BrowserRouter>
					<AsyncHelpCenter />
					{ 'development' === process.env.NODE_ENV && (
						<AsyncLoad require="calypso/components/webpack-build-monitor" placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>
	);
};
