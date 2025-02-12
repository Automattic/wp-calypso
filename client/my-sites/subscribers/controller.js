import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { sanitizeInt } from './helpers';
import SubscribersPage from './main';
import SubscriberDetailsPage from './subscriber-details-page';

const scrollToTop = () => window?.scrollTo( 0, 0 );

const FILTER_KEY = 'f';
const PAGE_KEY = 'page';
const SEARCH_KEY = 's';
const SORT_KEY = 'sort';
const TIME_KEY = '_';

const queryStringChanged = ( key ) => ( value ) => {
	const path = window.location.pathname + window.location.search;

	if ( key !== TIME_KEY ) {
		scrollToTop();
	}

	if ( ! value ) {
		return page.show( removeQueryArgs( path, key ) );
	}

	return page.show( addQueryArgs( path, { [ key ]: value } ) );
};

const addSubscribersDataviewsClassName = () => {
	if ( ! document ) {
		return;
	}

	if ( isEnabled( 'subscribers-dataviews' ) ) {
		document.body.classList.add( 'is-subscribers-dataviews' );
	}
};

const removeSubscribersDataviewsClassName = () => {
	if ( ! document ) {
		return;
	}

	document.body.classList.remove( 'is-subscribers-dataviews' );
};

export function subscribers( context, next ) {
	const { query } = context;
	const filterOption = query[ FILTER_KEY ];
	const pageNumber = sanitizeInt( query[ PAGE_KEY ] ) ?? 1;
	const searchTerm = query[ SEARCH_KEY ];
	const sortTerm = query[ SORT_KEY ];
	const timestamp = query[ TIME_KEY ];

	addSubscribersDataviewsClassName();

	context.primary = (
		<SubscribersPage
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
			timestamp={ timestamp }
			filterOptionChanged={ queryStringChanged( FILTER_KEY ) }
			pageChanged={ queryStringChanged( PAGE_KEY ) }
			searchTermChanged={ queryStringChanged( SEARCH_KEY ) }
			sortTermChanged={ queryStringChanged( SORT_KEY ) }
			reloadData={ () => queryStringChanged( TIME_KEY )( Date.now() ) }
		/>
	);

	next();

	// Clean up when navigating away
	return () => removeSubscribersDataviewsClassName();
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
