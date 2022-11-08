/**
 * Global polyfills
 */
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import { QueryClient } from 'react-query';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setLocale as setLocaleAction } from 'calypso/state/ui/language/actions';
import { hideMasterbar as hideMasterbarAction } from 'calypso/state/ui/masterbar-visibility/actions';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import { setupContextMiddleware } from './page-middleware/setup-context';
import registerStatsPages from './routes';

import 'calypso/assets/stylesheets/style.scss';

const setLocale = ( dispatch ) => {
	const defaultLocale = config( 'i18n_default_locale_slug' ) || 'en';
	const siteLocale = config( 'i18n_locale_slug' );
	dispatch( setLocaleAction( siteLocale ? siteLocale : defaultLocale ) );
};

const hideMasterbar = ( dispatch ) => {
	dispatch( hideMasterbarAction() );
};

async function AppBoot() {
	const siteId = config( 'blog_id' );

	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		config( 'intial_state' ) ?? {},
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	setLocale( store.dispatch );
	hideMasterbar( store.dispatch );
	setupContextMiddleware( store, queryClient );

	if ( ! window.location?.hash ) {
		window.location.hash = `#!/stats/day/${ siteId }`;
	}
	registerStatsPages( config( 'admin_page_base' ) );
}
AppBoot();
