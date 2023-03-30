import '../load-config';
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import MomentProvider from 'calypso/components/localized-moment/provider';
import StatsWidget from 'calypso/my-sites/customer-home/cards/features/stats';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import setLocale from '../lib/set-locale';

import 'calypso/assets/stylesheets/style.scss';
import './style.scss';

/**
 * Loads and runs the main chunk for Stats Widget.
 */
export function init() {
	const store = createStore(
		combineReducers( {
			// TODO: look at implementing a simple reducer to replace this.
			sites,
		} ),
		config( 'intial_state' ),
		compose( addReducerEnhancer, applyMiddleware( thunkMiddleware, wpcomApiMiddleware ) )
	);

	setStore( store );
	setLocale( store.dispatch );
	store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );

	render(
		<Provider store={ store }>
			<MomentProvider>
				<StatsWidget />
			</MomentProvider>
		</Provider>,
		document.getElementById( 'dashboard_stats' )
	);
}
