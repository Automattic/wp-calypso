import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { UserActions, User as UserStore } from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_SPEC_FLOW,
	DOMAIN_FLOW,
	Step,
	WOO_HOSTED_PLANS_FLOW,
} from '@automattic/onboarding';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupCountryCode } from 'calypso/boot/geolocation';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { AsyncHelpCenterApp } from 'calypso/components/help-center';
import Loading from 'calypso/components/loading';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { createSessionId } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/create-session-id';
import {
	FlowV2,
	Flow,
	StepperStep,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import availableFlows from 'calypso/landing/stepper/declarative-flow/registered-flows';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { setupWpDataDebug } from 'calypso/landing/stepper/utils/devtools';
import { enhanceFlowWithUtilityFunctions } from 'calypso/landing/stepper/utils/enhance-flow-with-utils';
import {
	enhanceFlowWithAuth,
	injectUserStepInSteps,
} from 'calypso/landing/stepper/utils/enhanceFlowWithAuth';
import { DEFAULT_FLOW, getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { startStepperPerformanceTracking } from 'calypso/landing/stepper/utils/performance-tracking';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { setupErrorLogger } from 'calypso/lib/error-logger/setup-error-logger';
import { addQueryArgs } from 'calypso/lib/url';
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
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Action, Store } from 'redux';

import '@automattic/calypso-polyfills';
import 'calypso/assets/stylesheets/style.scss';

type InitializedState = {
	flow: Flow | FlowV2< any >;
	flowSteps: readonly StepperStep[] | null;
	queryClient: QueryClient;
	reduxStore: Store;
	user: UserStore.CurrentUser | null;
};
/**
 * Flows that should not render the Help Center. The stepper has no masterbar or help button, so
 * the Help Center can only auto-open from persisted preferences in these flows, which is
 * disruptive. Flows that programmatically open the Help Center (e.g., hundred-year-plan,
 * do-it-for-me) should NOT be added to this set.
 */
export const FLOWS_WITHOUT_HELP_CENTER = new Set< string >( [
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_SPEC_FLOW,
	DOMAIN_FLOW,
	WOO_HOSTED_PLANS_FLOW,
] );

export function StepperApp() {
	const [ stepperState, setStepperState ] = useState< InitializedState | null >( null );
	const initialized = useRef( false );
	const flowName = useMemo( () => getFlowFromURL(), [] );

	useEffect( () => {
		if ( initialized.current ) {
			return;
		}
		initialized.current = true;

		async function initialize() {
			const flowName = getFlowFromURL();
			const flowLoader = availableFlows[ flowName ];

			if ( typeof flowLoader !== 'function' ) {
				window.location.href = `/setup/${ DEFAULT_FLOW }${ window.location.search }`;
				return;
			}

			const siteId = new URLSearchParams( window.location.search ).get( 'siteId' );
			const siteIdNum = siteId ? Number( siteId ) : null;

			const flowPromise = flowLoader();
			startStepperPerformanceTracking( { fullPageLoad: false } );
			requestAllBlogsAccess();
			setupWpDataDebug();

			const user = await initializeCurrentUser();
			const userId = user ? user.ID : 0;

			let { default: flow } = await flowPromise;

			const initialState = getInitialState( initialReducer, userId );
			const reduxStore = createReduxStore( initialState, initialReducer );
			setStore( reduxStore, getStateFromCache( userId ) );
			onDisablePersistence( persistOnChange( reduxStore, userId ) );
			setupLocale( user, reduxStore );
			setupCountryCode();

			const { receiveCurrentUser } = dispatch( USER_STORE ) as UserActions;

			if ( user ) {
				reduxStore.dispatch( setCurrentUser( user ) as Action );
				receiveCurrentUser( user as UserStore.CurrentUser );
			}

			initializeAnalytics( user || undefined, getSuperProps( reduxStore ) );
			setupErrorLogger( reduxStore );

			reduxStore.dispatch( setCurrentFlowName( flow.name ) );
			reduxStore.dispatch( setSelectedSiteId( siteIdNum ) as unknown as Action );

			let flowSteps = 'initialize' in flow ? await flow.initialize( reduxStore ) : null;

			let queryClient;

			if ( '__experimentalUseSessions' in flow ) {
				const sessionId = getSessionId() || createSessionId();
				history.replaceState( null, '', addQueryArgs( { sessionId }, window.location.href ) );
				queryClient = ( await createQueryClient( 'stepper-persistence-session-' + sessionId ) )
					.queryClient;
			} else {
				queryClient = ( await createQueryClient( userId ) ).queryClient;
			}

			if ( flowSteps === false ) {
				return;
			}

			if ( 'initialize' in flow && flowSteps ) {
				flowSteps = injectUserStepInSteps( flowSteps ) as typeof flowSteps;
				flow.__flowSteps = flowSteps;
				enhanceFlowWithUtilityFunctions( flow );
			} else if ( 'useSteps' in flow ) {
				flow = enhanceFlowWithAuth( flow );
			}

			setStepperState( {
				flow,
				flowSteps,
				queryClient,
				reduxStore,
				user: ( user || null ) as UserStore.CurrentUser | null,
			} );
		}

		initialize();
	}, [] );

	if ( ! stepperState ) {
		return shouldUseStepContainerV2( flowName ) ? (
			<Step.Loading hideLogo={ flowName === WOO_HOSTED_PLANS_FLOW } />
		) : (
			<Loading className="wpcom-loading__boot" />
		);
	}

	const { flow, flowSteps, queryClient, reduxStore, user } = stepperState;

	return (
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowRenderer flow={ flow } steps={ flowSteps } />
						{ config.isEnabled( 'cookie-banner' ) && (
							<AsyncLoad require="calypso/blocks/cookie-banner" placeholder={ null } />
						) }
						<AsyncLoad
							require="calypso/components/global-notices"
							placeholder={ null }
							id="notices"
						/>
					</BrowserRouter>
					{ ! FLOWS_WITHOUT_HELP_CENTER.has( flowName ) && (
						<AsyncHelpCenterApp
							currentUser={ user as UserStore.CurrentUser }
							sectionName="stepper"
						/>
					) }
					{ 'development' === process.env.NODE_ENV && (
						<AsyncLoad require="calypso/components/webpack-build-monitor" placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>
	);
}
