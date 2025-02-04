import 'calypso/components/environment-badge/style.scss';
import '@automattic/calypso-polyfills';
import { getGenericSuperPropsGetter, initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { CurrentUser, User, UserActions } from '@automattic/data-stores';
import { QueryClientProvider } from '@tanstack/react-query';
import { dispatch } from '@wordpress/data';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AnyAction } from 'redux';
import { setupLocale } from 'calypso/boot/locale';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import GlobalNotices from 'calypso/components/global-notices';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { WindowLocaleEffectManager } from 'calypso/landing/stepper/utils/window-locale-effect-manager';
import { SiteSubscriptionPage } from 'calypso/landing/subscriptions/components/site-subscription-page';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { SubscriptionManagerPage } from 'calypso/landing/subscriptions/components/subscription-manager-page';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import RecordPageView from './tracks/record-page-view';
import './styles/styles.scss';

const setupReduxStore = ( user: CurrentUser ) => {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( user.ID ) );
	setupLocale( user, reduxStore );

	const userStoreKey = User.register();
	if ( user?.ID ) {
		reduxStore.dispatch( setCurrentUser( user ) as AnyAction );
		( dispatch( userStoreKey ) as UserActions ).receiveCurrentUser( user );
	} else {
		( dispatch( userStoreKey ) as UserActions ).receiveCurrentUserFailed();
	}

	return reduxStore;
};

async function main() {
	const user = ( await initializeCurrentUser() ) as unknown as CurrentUser;
	const { queryClient } = await createQueryClient( user.ID );
	const reduxStore = setupReduxStore( user );
	initializeAnalytics( user, getGenericSuperPropsGetter( config ) );

	ReactDom.render(
		<CalypsoI18nProvider>
			<Provider store={ reduxStore }>
				<GlobalNotices />
				<QueryClientProvider client={ queryClient }>
					<MomentProvider>
						<WindowLocaleEffectManager />
						<BrowserRouter>
							<RecordPageView />
							<Routes>
								<Route
									path="/subscriptions/site/:blogId/*"
									element={
										<SubscriptionManagerContextProvider
											portal={ SubscriptionsPortal.Subscriptions }
										>
											<SiteSubscriptionPage />
										</SubscriptionManagerContextProvider>
									}
								/>
								<Route path="/subscriptions/*" element={ <SubscriptionManagerPage /> } />
							</Routes>
						</BrowserRouter>
					</MomentProvider>
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
}

main();
