import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import { User as UserStore } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { retargetFullStory } from 'calypso/lib/analytics/fullstory';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { loadPersistedState } from 'calypso/state/persisted-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { requestSites } from 'calypso/state/sites/actions';
import { WindowLocaleEffectManager } from '../gutenboarding/components/window-locale-effect-manager';
import { setupWpDataDebug } from '../gutenboarding/devtools';
import { anchorFmFlow } from './declarative-flow/anchor-fm-flow';
import { FlowRenderer } from './declarative-flow/internals';
import { linkInBio } from './declarative-flow/link-in-bio';
import { newsletter } from './declarative-flow/newsletter';
import { pluginBundleFlow } from './declarative-flow/plugin-bundle-flow';
import { podcasts } from './declarative-flow/podcasts';
import { siteSetupFlow } from './declarative-flow/site-setup-flow';
import 'calypso/components/environment-badge/style.scss';
import { useAnchorFmParams } from './hooks/use-anchor-fm-params';
import { useQuery } from './hooks/use-query';
import { USER_STORE } from './stores';
import type { Flow } from './declarative-flow/internals/types';

function generateGetSuperProps() {
	return () => ( {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	} );
}

function initializeCalypsoUserStore( reduxStore: any, user: CurrentUser ) {
	config.isEnabled( 'signup/inline-help' ) && reduxStore.dispatch( requestHappychatEligibility() );
	reduxStore.dispatch( setCurrentUser( user ) );
	reduxStore.dispatch( requestSites() );
}

interface configurableFlows {
	flowName: string;
	pathToFlow: Flow;
}

const availableFlows: Array< configurableFlows > = [
	{ flowName: 'newsletter', pathToFlow: newsletter },
	{ flowName: 'link-in-bio', pathToFlow: linkInBio },
	{ flowName: 'podcasts', pathToFlow: podcasts },
	config.isEnabled( 'themes/plugin-bundling' )
		? { flowName: 'plugin-bundle', pathToFlow: pluginBundleFlow }
		: null,
].filter( ( item ) => item !== null ) as Array< configurableFlows >;

const FlowSwitch: React.FC< { user: UserStore.CurrentUser | undefined } > = ( { user } ) => {
	const { anchorFmPodcastId } = useAnchorFmParams();
	const flowName = useQuery().get( 'flow' );

	let flow = siteSetupFlow;

	if ( anchorFmPodcastId ) {
		flow = anchorFmFlow;
	} else {
		availableFlows.forEach( ( currentFlow ) => {
			if ( currentFlow.flowName === flowName ) {
				flow = currentFlow.pathToFlow;
			}
		} );
	}

	const { receiveCurrentUser } = useDispatch( USER_STORE );
	user && receiveCurrentUser( user as UserStore.CurrentUser );

	return <FlowRenderer flow={ flow } />;
};
interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

declare const window: AppWindow;

window.AppBoot = async () => {
	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();
	addHotJarScript();
	retargetFullStory();
	// Add accessible-focus listener.
	accessibleFocus();

	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	} );

	await loadPersistedState();
	const user = ( await initializeCurrentUser() ) as unknown;
	const userId = ( user as CurrentUser ).ID;

	initializeAnalytics( user, generateGetSuperProps() );

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
	setupLocale( user, reduxStore );

	user && initializeCalypsoUserStore( reduxStore, user as CurrentUser );

	ReactDom.render(
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowSwitch user={ user as UserStore.CurrentUser } />
					</BrowserRouter>
					{ config.isEnabled( 'signup/inline-help' ) && (
						<AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};
