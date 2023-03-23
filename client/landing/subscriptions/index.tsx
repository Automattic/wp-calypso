import 'calypso/components/environment-badge/style.scss';
import '@automattic/calypso-polyfills';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import defaultCalypsoI18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AnyAction } from 'redux';
import { setupLocale } from 'calypso/boot/locale';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { WindowLocaleEffectManager } from 'calypso/landing/stepper/utils/window-locale-effect-manager';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { loadPersistedState } from 'calypso/state/persisted-state';
import { createQueryClient, hydrateBrowserState } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { requestSites } from 'calypso/state/sites/actions';
import SubscriptionManagementPage from './subscription-manager/subscription-manager';
import './styles.scss';

const tracksSuperProps = () => ( {
	environment: process.env.NODE_ENV,
	environment_id: config( 'env_id' ),
	site_id_label: 'wpcom',
	client: config( 'client_slug' ),
} );

const setupQueryClient = async ( userId: number ) => {
	await loadPersistedState();
	const queryClient = createQueryClient();
	await hydrateBrowserState( queryClient, userId );
	return queryClient;
};

const setupReduxStore = ( user: CurrentUser ) => {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( user.ID ) );
	setupLocale( user, reduxStore );
	if ( user ) {
		// Initialize calypso user store
		config.isEnabled( 'signup/inline-help' ) &&
			reduxStore.dispatch( requestHappychatEligibility() as unknown as AnyAction );
		reduxStore.dispatch( setCurrentUser( user ) as AnyAction );
		reduxStore.dispatch( requestSites() as unknown as AnyAction );
	}
	return reduxStore;
};

declare const window: Window & {
	AppBoot?: () => void;
};

window.AppBoot = async () => {
	const user = ( await initializeCurrentUser() ) as unknown as CurrentUser;
	const queryClient = await setupQueryClient( user.ID );
	const reduxStore = setupReduxStore( user );
	initializeAnalytics( user, tracksSuperProps );

	ReactDom.render(
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<MomentProvider>
						<BrowserRouter basename="subscriptions">
							<WindowLocaleEffectManager />
							<SubscriptionManagementPage />
						</BrowserRouter>
					</MomentProvider>
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};
