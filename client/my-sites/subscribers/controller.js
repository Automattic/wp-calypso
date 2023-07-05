import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { sanitizeInt } from './helpers';
import SubscribersPage from './main';
import SubscriberDetailsPage from './subscriber-details-page';

const scrollToTop = () => window?.scrollTo( 0, 0 );

const FILTER_KEY = 'f';
const PAGE_KEY = 'page';
const SEARCH_KEY = 's';
const SORT_KEY = 'sort';

const queryStringChanged = ( path, key ) => ( value ) => {
	scrollToTop();

	if ( ! value ) {
		return page.show( removeQueryArgs( path, key ) );
	}

	return page.show( addQueryArgs( path, { [ key ]: value } ) );
};

export function subscribers( context, next ) {
	const { path, query } = context;
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
			filterOptionChanged={ queryStringChanged( path, FILTER_KEY ) }
			pageChanged={ queryStringChanged( path, PAGE_KEY ) }
			searchTermChanged={ queryStringChanged( path, SEARCH_KEY ) }
			sortTermChanged={ queryStringChanged( path, SORT_KEY ) }
		/>
	);

	next();
}

export function subscriberDetails( context, next ) {
	const { path, query } = context;
	const userId = path.split( '/' ).pop();
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
	const { path, query } = context;
	const subscriberId = path.split( '/' ).pop();
	const filterOption = query[ FILTER_KEY ];
	const pageNumber = sanitizeInt( query[ PAGE_KEY ] ) ?? 1;
	const searchTerm = query[ SEARCH_KEY ];
	const sortTerm = query[ SORT_KEY ];

	context.primary = (
		<SubscriberDetailsPage
			subscriptionId={ subscriberId }
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
		/>
	);

	next();
}
