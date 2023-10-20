import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { User as UserStore, UserActions } from '@automattic/data-stores';
import { ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { dispatch, useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupErrorLogger } from 'calypso/boot/common';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { FlowRenderer } from './declarative-flow/internals';
import 'calypso/components/environment-badge/style.scss';
import 'calypso/assets/stylesheets/style.scss';
import availableFlows from './declarative-flow/registered-flows';
import { useQuery } from './hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Flow } from './declarative-flow/internals/types';

declare const window: AppWindow;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupUser( reduxStore: any, user: UserStore.CurrentUser | false ) {
	if ( ! user ) {
		return;
	}

	// initialize Stepper User store
	( dispatch( USER_STORE ) as UserActions ).receiveCurrentUser( user );

	// initialize Calypso User Store
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
	const { setEcommerceFlowRecurType } = useDispatch( ONBOARD_STORE );

	const recurType = useQuery().get( 'recur' );

	if ( flow.name === ECOMMERCE_FLOW ) {
		const isValidRecurType =
			recurType && Object.values( ecommerceFlowRecurTypes ).includes( recurType );
		if ( isValidRecurType ) {
			setEcommerceFlowRecurType( recurType );
		} else {
			setEcommerceFlowRecurType( ecommerceFlowRecurTypes.YEARLY );
		}
	}

	user && receiveCurrentUser( user as UserStore.CurrentUser );

	return <FlowRenderer flow={ flow } />;
};
interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

window.AppBoot = async () => {
	// backward support the old Stepper URL structure (?flow=something)
	const flowNameFromQueryParam = new URLSearchParams( window.location.search ).get( 'flow' );
	if ( flowNameFromQueryParam && availableFlows[ flowNameFromQueryParam ] ) {
		window.location.href = `/setup/${ flowNameFromQueryParam }`;
	}

	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();
	addHotJarScript();

	// Add accessible-focus listener.
	accessibleFocus();

	const user = ( await initializeCurrentUser() ) as UserStore.CurrentUser | false;
	const userId = user ? user.ID : undefined;

	const queryClient = await createQueryClient( userId );

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
	setupLocale( user, reduxStore );
	setupUser( reduxStore, user );
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
					{ 'development' === process.env.NODE_ENV && (
						<AsyncLoad require="calypso/components/webpack-build-monitor" placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};
