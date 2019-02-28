/**
 * External dependencies
 */
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import QuerySites from 'components/data/query-sites';
import Navigation from 'my-sites/navigation';
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import { combineReducers } from 'state/utils';
import currentUser from 'state/current-user/reducer';
import media from 'state/media/reducer';
import preferences from 'state/preferences/reducer';
import postTypes from 'state/post-types/reducer';
import sites from 'state/sites/reducer';
import siteSettings from 'state/site-settings/reducer';
import stats from 'state/stats/reducer';
import users from 'state/users/reducer';
import layoutFocus from 'state/ui/layout-focus/reducer';
import userFactory from 'lib/user';
import { setCurrentUserOnReduxStore } from 'lib/redux-helpers';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { setSelectedSiteId } from 'state/ui/actions';

/**
 * Style dependencies
 */
import 'stylesheets/shared/_reset.scss';
import 'stylesheets/shared/_color-schemes.scss';
import 'stylesheets/shared/_forms.scss';
import 'stylesheets/_main.scss';
import './style.scss';

// Create Redux store
const reducer = combineReducers( {
	currentUser,
	media,
	preferences,
	postTypes,
	sites,
	siteSettings,
	stats,
	users,
	ui: combineReducers( {
		layoutFocus,
	} ),
} );

const store = createStore( reducer, applyMiddleware( thunkMiddleware, wpcomApiMiddleware ) );

// Create Sidebar/Site Selector component
const TheSidebar = connect(
	state => ( {
		focus: getCurrentLayoutFocus( state ),
	} ),
	dispatch => ( {
		onSiteSelect: siteId => {
			dispatch( setSelectedSiteId( siteId ) );
			return true;
		},
	} )
)( ( { focus, onSiteSelect } ) => (
	<div className={ `layout focus-${ focus }` }>
		<div id="secondary" className="layout__secondary">
			<QueryPreferences />
			<QuerySites allSites />
			<Navigation path="/" siteBasePath="/show" onSiteSelect={ onSiteSelect } />
		</div>
	</div>
) );

const userStore = userFactory();
const userInitialized = new Promise( resolve => {
	if ( userStore.initialized ) {
		resolve( userStore.get() );
	} else {
		userStore.once( 'change', () => resolve( userStore.get() ) );
	}
} );

userInitialized.then( user => {
	setCurrentUserOnReduxStore( user, store );
	store.dispatch( setSelectedSiteId( getPrimarySiteId( store.getState() ) ) );

	ReactDOM.render(
		<Provider store={ store }>
			<TheSidebar />
		</Provider>,
		document.getElementById( 'sidebar__root' )
	);
} );
