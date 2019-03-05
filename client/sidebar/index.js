/**
 * External dependencies
 */
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import QuerySites from 'components/data/query-sites';
import Navigation from 'my-sites/navigation';
import userFactory from 'lib/user';
import { setCurrentUser } from 'state/current-user/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { setSelectedSiteId } from 'state/ui/actions';
import createStore from './store';

/**
 * Style dependencies
 */
import 'stylesheets/shared/_reset.scss';
import 'stylesheets/shared/_color-schemes.scss';
import 'stylesheets/shared/_forms.scss';
import 'stylesheets/_main.scss';
import './style.scss';

// Create Redux store
const store = createStore();

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
	store.dispatch( setCurrentUser( user ) );
	store.dispatch( setSelectedSiteId( getPrimarySiteId( store.getState() ) ) );

	ReactDOM.render(
		<Provider store={ store }>
			<TheSidebar />
		</Provider>,
		document.getElementById( 'sidebar__root' )
	);
} );
