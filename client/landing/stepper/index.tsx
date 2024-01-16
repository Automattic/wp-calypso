import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import { User as UserStore } from '@automattic/data-stores';
import { ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import { useState, useEffect } from 'react';
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
import { AsyncHelpCenter } from './declarative-flow/internals/components';
import 'calypso/components/environment-badge/style.scss';
import 'calypso/assets/stylesheets/style.scss';
import registeredFlows from './declarative-flow/registered-flows';
import { useQuery } from './hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Flow } from './declarative-flow/internals/types';

declare const window: AppWindow;
let availableFlows = registeredFlows;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initializeCalypsoUserStore( reduxStore: any, user: CurrentUser ) {
	reduxStore.dispatch( setCurrentUser( user ) );
}

function determineFlow() {
	const flowNameFromPathName = window.location.pathname.split( '/' )[ 2 ];

	console.log( ' === determineflow ===' );
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

	// This stores the coupon code query param, and the flow declaration
	// will append it to the checkout URL so that it auto-applies the coupon code at
	// checkout. For example, /setup/ecommerce/?coupon=SOMECOUPON will auto-apply the
	// coupon code at the checkout page.
	const couponCode = useQuery().get( 'coupon' );
	const { setCouponCode } = useDispatch( ONBOARD_STORE );
	if ( couponCode ) {
		setCouponCode( couponCode );
	}

	user && receiveCurrentUser( user as UserStore.CurrentUser );

	console.log( ' === flowswitch ===' );

	// Force-rerender when we hot-update a flow.
	const [ flowVer, setFlowVer ] = useState( 0 );

	useEffect( () => {
		const bumpFlowVer = () => {
			setFlowVer( ( prev ) => prev + 1 );
		};

		window.addEventListener( 'updateFlows', bumpFlowVer );

		return () => {
			window.removeEventListener( 'updateFlows', bumpFlowVer );
		};
	}, [] );

	return <FlowRenderer flow={ flow } key={ flowVer } />;
};
interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

window.AppBoot = async () => {
	// backward support the old Stepper URL structure (?flow=something)
	const flowNameFromQueryParam = new URLSearchParams( window.location.search ).get( 'flow' );
	console.log( ' === appboot ===' );
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

	const user = ( await initializeCurrentUser() ) as unknown;
	const userId = ( user as CurrentUser ).ID;

	const queryClient = await createQueryClient( userId );

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
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

if ( module.hot ) {
	module.hot.accept( './declarative-flow/registered-flows', async () => {
		const { default: updatedFlows } = await import( './declarative-flow/registered-flows' );
		availableFlows = updatedFlows;
		const updateEvent = new Event( 'updateFlows' );
		window.dispatchEvent( updateEvent );
	} );
}
