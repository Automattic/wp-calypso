import page from '@automattic/calypso-router';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { sanitizeInt } from './helpers';
import SubscribersPage from './main';
import SubscriberDetailsPage from './subscriber-details-page';

const scrollToTop = () => window?.scrollTo( 0, 0 );

const FILTER_KEY = 'f';
const PAGE_KEY = 'page';
const SEARCH_KEY = 's';
const SORT_KEY = 'sort';

const queryStringChanged = ( key ) => ( value ) => {
	const path = window.location.pathname + window.location.search;

	scrollToTop();

	if ( ! value ) {
		return page.show( removeQueryArgs( path, key ) );
	}

	return page.show( addQueryArgs( path, { [ key ]: value } ) );
};

export async function redirectIfInsufficientPrivileges( context, next ) {
	const { store } = context;
	const state = store.getState();
	const site = getSelectedSite( state );
	const canManageOptions = canCurrentUser( state, site.ID, 'manage_options' );

	// if site loaded, but user cannot manage site, redirect
	if ( site && ! canManageOptions ) {
		page.redirect( `/home/${ site.slug }` );
		return;
	}

	next();
}

export function subscribers( context, next ) {
	const { query } = context;
	const filterOption = query[ FILTER_KEY ];
	const pageNumber = sanitizeInt( query[ PAGE_KEY ] ) ?? 1;
	const searchTerm = query[ SEARCH_KEY ];
	const sortTerm = query[ SORT_KEY ];

	context.primary = (
		<SubscribersPage
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
			filterOptionChanged={ queryStringChanged( FILTER_KEY ) }
			pageChanged={ queryStringChanged( PAGE_KEY ) }
			searchTermChanged={ queryStringChanged( SEARCH_KEY ) }
			sortTermChanged={ queryStringChanged( SORT_KEY ) }
		/>
	);

	next();
}

export function subscriberDetails( context, next ) {
	const { query } = context;
	const userId = context.params?.user;
	const filterOption = query[ FILTER_KEY ];
	const pageNumber = sanitizeInt( query[ PAGE_KEY ] ) ?? 1;
	const searchTerm = query[ SEARCH_KEY ];
	const sortTerm = query[ SORT_KEY ];

	context.primary = (
		<SubscriberDetailsPage
			userId={ userId }
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
		/>
	);

	next();
}

export function externalSubscriberDetails( context, next ) {
	const { query } = context;
	const subscriptionId = context.params?.subscriber;
	const filterOption = query[ FILTER_KEY ];
	const pageNumber = sanitizeInt( query[ PAGE_KEY ] ) ?? 1;
	const searchTerm = query[ SEARCH_KEY ];
	const sortTerm = query[ SORT_KEY ];

	context.primary = (
		<SubscriberDetailsPage
			subscriptionId={ subscriptionId }
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
		/>
	);

	next();
}
