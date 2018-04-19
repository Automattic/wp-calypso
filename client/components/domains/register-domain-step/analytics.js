/** @format */

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', { section } )
	);

export const recordTransferDomainButtonClick = ( section, source ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_transfer_button_click', { section, source } )
	);

export const recordSearchFormSubmit = (
	searchBoxValue,
	section,
	timeDiffFromLastSearch,
	count,
	vendor
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
		} )
	);

export const recordSearchFormView = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Landed on Search' ),
		recordTracksEvent( 'calypso_domain_search_pageview', { section } )
	);

export const recordSearchResultsReceive = (
	searchQuery,
	searchResults,
	responseTimeInMs,
	resultCount,
	section
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Receive Results', 'Response Time', responseTimeInMs ),
		recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
			search_query: searchQuery,
			results: searchResults.join( ';' ),
			response_time_ms: responseTimeInMs,
			result_count: resultCount,
			section,
		} )
	);

export const recordDomainAvailabilityReceive = (
	searchQuery,
	availableStatus,
	responseTimeInMs,
	section
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
		} )
	);
