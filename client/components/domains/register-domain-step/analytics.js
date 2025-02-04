import { mapKeys, mapValues, snakeCase, startsWith } from 'lodash';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

const noop = () => {};

export const recordMapDomainButtonClick = ( section, flowName ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', {
			section,
			flow_name: flowName,
		} )
	);

export const recordTransferDomainButtonClick = ( section, source, flowName ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_transfer_button_click', {
			section,
			source,
			flow_name: flowName,
		} )
	);

export const recordUseYourDomainButtonClick = ( section, source, flowName ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_use_my_domain_button_click', {
			section,
			source,
			flow_name: flowName,
		} )
	);

export const recordSearchFormSubmit = (
	searchBoxValue,
	section,
	timeDiffFromLastSearch,
	count,
	vendor,
	flowName
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Submitted Search Form',
			'Search Box Value',
			searchBoxValue
		),
		recordTracksEvent( 'calypso_domain_search', {
			search_box_value: searchBoxValue,
			seconds_from_last_search: timeDiffFromLastSearch,
			search_count: count,
			search_vendor: vendor,
			section,
			flow_name: flowName,
		} )
	);

export const recordSearchFormView = ( section, flowName ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Landed on Search' ),
		recordTracksEvent( 'calypso_domain_search_pageview', { section, flow_name: flowName } )
	);

export const recordSearchResultsReceive = (
	searchQuery,
	searchResults,
	responseTimeInMs,
	resultCount,
	section,
	flowName
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Receive Results', 'Response Time', responseTimeInMs ),
		recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
			search_query: searchQuery,
			results: searchResults.join( ';' ),
			response_time_ms: responseTimeInMs,
			result_count: resultCount,
			section,
			flow_name: flowName,
		} )
	);

export const recordDomainAvailabilityReceive = (
	searchQuery,
	availableStatus,
	responseTimeInMs,
	section,
	flowName
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Domain Availability Result',
			'Domain Available Status',
			availableStatus
		),
		recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
			search_query: searchQuery,
			available_status: availableStatus,
			response_time: responseTimeInMs,
			section,
			flow_name: flowName,
		} )
	);

export const recordDomainAddAvailabilityPreCheck = (
	domain,
	unavailableStatus,
	section,
	flowName
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Domain Add',
			'Domain Precheck Unavailable',
			unavailableStatus
		),
		recordTracksEvent( 'calypso_domain_add_availability_precheck', {
			domain: domain,
			unavailable_status: unavailableStatus,
			section,
			flow_name: flowName,
		} )
	);

export function recordShowMoreResults( searchQuery, pageNumber, section, flowName ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Show More Results' ),
		recordTracksEvent( 'calypso_domain_search_show_more_results', {
			search_query: searchQuery,
			page_number: pageNumber,
			section,
			flow_name: flowName,
		} )
	);
}

function processFiltersForAnalytics( filters ) {
	const convertArraysToCSV = ( input ) =>
		mapValues( input, ( value ) => ( Array.isArray( value ) ? value.join( ',' ) : value ) );
	const prepareKeys = ( input ) =>
		mapKeys( input, ( value, key ) => `filters_${ snakeCase( key ) }` );
	return convertArraysToCSV( prepareKeys( filters ) );
}

export function recordFiltersReset( filters, keysToReset, section, flowName ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Filters Reset' ),
		recordTracksEvent( 'calypso_domain_search_filters_reset', {
			keys_to_reset: keysToReset.join( ',' ),
			section,
			flow_name: flowName,
			...processFiltersForAnalytics( filters ),
		} )
	);
}

export function recordFiltersSubmit( filters, section, flowName ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Filters Submit' ),
		recordTracksEvent( 'calypso_domain_search_filters_submit', {
			section,
			flow_name: flowName,
			...processFiltersForAnalytics( filters ),
		} )
	);
}

let searchQueue = [];
let searchStackTimer = null;
let lastSearchTimestamp = null;
let searchCount = 0;
let recordSearchFormSubmitWithDispatch = noop;

export function resetSearchCount() {
	searchCount = 0;
}

export function enqueueSearchStatReport( search, recordFunction ) {
	recordSearchFormSubmitWithDispatch = recordFunction;
	searchQueue.push( Object.assign( {}, search, { timestamp: Date.now() } ) );
	if ( searchStackTimer ) {
		window.clearTimeout( searchStackTimer );
	}
	searchStackTimer = window.setTimeout( processSearchStatQueue, 10000 );
}

function processSearchStatQueue() {
	const queue = searchQueue.slice();
	window.clearTimeout( searchStackTimer );
	searchStackTimer = null;
	searchQueue = [];

	outerLoop: for ( let i = 0; i < queue.length; i++ ) {
		for ( let k = i + 1; k < queue.length; k++ ) {
			if ( startsWith( queue[ k ].query, queue[ i ].query ) ) {
				continue outerLoop;
			}
		}
		reportSearchStats( queue[ i ] );
	}
}

function reportSearchStats( { query, section, timestamp, vendor, flowName } ) {
	let timeDiffFromLastSearchInSeconds = 0;
	if ( lastSearchTimestamp ) {
		timeDiffFromLastSearchInSeconds = Math.floor( ( timestamp - lastSearchTimestamp ) / 1000 );
	}
	lastSearchTimestamp = timestamp;
	searchCount++;
	recordSearchFormSubmitWithDispatch(
		query,
		section,
		timeDiffFromLastSearchInSeconds,
		searchCount,
		vendor,
		flowName
	);
}
