import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import { User as UserStore } from '@automattic/data-stores';
import { IMPORT_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, matchPath } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupErrorLogger } from 'calypso/boot/common';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { onDisablePersistence } from 'calypso/lib/user/store';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache, persistOnChange } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { FlowRenderer } from './declarative-flow/internals';
import { AsyncHelpCenter } from './declarative-flow/internals/components';
import 'calypso/components/environment-badge/style.scss';
import 'calypso/assets/stylesheets/style.scss';
import availableFlows from './declarative-flow/registered-flows';
import { USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { startStepperPerformanceTracking } from './utils/performance-tracking';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Flow } from './declarative-flow/internals/types';

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
	BUILD_TARGET?: string;
}

const DEFAULT_FLOW = 'site-setup';

const getFlowFromURL = () => {
	const fromPath = matchPath( { path: '/setup/:flow/*' }, window.location.pathname )?.params?.flow;
	// backward support the old Stepper URL structure (?flow=something)
	const fromQuery = new URLSearchParams( window.location.search ).get( 'flow' );
	return fromPath || fromQuery;
};

const initializeHotJar = ( flowName: string ) => {
	if ( flowName === IMPORT_HOSTED_SITE_FLOW ) {
		addHotJarScript();
	}
};

window.AppBoot = async () => {
	const flowName = getFlowFromURL();

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
	const { default: flow } = await flowLoader();

	ReactDom.render(
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
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};
