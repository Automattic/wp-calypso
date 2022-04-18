import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { loadPersistedState } from 'calypso/state/persisted-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { LocaleContext } from '../gutenboarding/components/locale-context';
import { WindowLocaleEffectManager } from '../gutenboarding/components/window-locale-effect-manager';
import { setupWpDataDebug } from '../gutenboarding/devtools';
import { anchorFmFlow } from './declarative-flow/anchor-fm-flow';
import { getAnchorPodcastId } from './declarative-flow/get-anchor-podcast-id';
import { FlowRenderer } from './declarative-flow/internals';
import { siteSetupFlow } from './declarative-flow/site-setup-flow';
import 'calypso/components/environment-badge/style.scss';

function generateGetSuperProps() {
	return () => ( {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	} );
}

interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

declare const window: AppWindow;

window.AppBoot = async () => {
	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();
	// User is left undefined here because the user account will not be created
	// until after the user has completed the flow.
	// This also saves us from having to pull in lib/user/user and it's dependencies.
	initializeAnalytics( undefined, generateGetSuperProps() );
	// Add accessible-focus listener.
	accessibleFocus();

	const queryClient = new QueryClient();

	await loadPersistedState();
	const user = ( await initializeCurrentUser() ) as unknown;
	const userId = ( user as CurrentUser ).ID;

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );

	let flow = siteSetupFlow;

	const anchorPodcastId = getAnchorPodcastId();

	if ( anchorPodcastId && config.isEnabled( 'signup/anchor-fm' ) ) {
		flow = anchorFmFlow;
	}

	ReactDom.render(
		<LocaleContext>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowRenderer flow={ flow } />
					</BrowserRouter>
				</QueryClientProvider>
			</Provider>
		</LocaleContext>,
		document.getElementById( 'wpcom' )
	);
};
