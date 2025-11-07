import { DomainAvailabilityStatus, FreeDomainSuggestion } from '@automattic/api-core';
import { mapKeys, mapValues, snakeCase } from 'lodash';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

export const recordDomainSearchStepSubmit = (
	suggestion: FreeDomainSuggestion | { domain_name: string },
	section: string
) => {
	let domainType = 'domain_reg';
	if ( 'is_free' in suggestion ) {
		domainType = 'wpcom_subdomain';
		if ( suggestion.domain_name.endsWith( '.blog' ) ) {
			domainType = 'dotblog_subdomain';
		}
	}

	const tracksObjects: Record< string, string > = {
		domain_name: suggestion.domain_name,
		section,
		type: domainType,
	};

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			`Submitted Domain Selection for a ${ domainType } on a Domain Registration`,
			'Domain Name',
			suggestion.domain_name
		),
		recordTracksEvent( 'calypso_domain_search_submit_step', tracksObjects )
	);
};

export const recordUseYourDomainButtonClick = (
	section: string,
	source: string | null,
	flowName: string
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_use_my_domain_button_click', {
			section,
			source,
			flow_name: flowName,
		} )
	);

export const recordSearchFormSubmitButtonClick = (
	query: string,
	section: string,
	flowName: string
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Search domains" Button' ),
		recordTracksEvent( 'calypso_domain_search_submit_button_click', {
			search_query: query,
			section,
			flow_name: flowName,
		} )
	);

export const recordSearchFormSubmit = (
	searchBoxValue: string,
	section: string,
	timeDiffFromLastSearch: number,
	count: number,
	vendor: string | undefined,
	flowName: string
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

export const recordSearchFormView = ( section: string, flowName: string ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Landed on Search' ),
		recordTracksEvent( 'calypso_domain_search_pageview', { section, flow_name: flowName } )
	);

export const recordSearchResultsReceive = (
	query: string,
	suggestions: string[],
	responseTimeInMs: number,
	analyticsSection: string,
	flowName: string
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Receive Results', 'Response Time', responseTimeInMs ),
		recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
			search_query: query,
			results: suggestions.length > 0 ? suggestions.join( ';' ) : 'empty_results',
			response_time_ms: responseTimeInMs,
			result_count: suggestions.length,
			flow_name: flowName,
			section: analyticsSection,
		} )
	);

export const recordDomainAvailabilityReceive = (
	query: string,
	availableStatus: DomainAvailabilityStatus,
	responseTimeInMs: number,
	analyticsSection: string,
	flowName: string
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Domain Availability Result',
			'Domain Available Status',
			availableStatus
		),
		recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
			search_query: query,
			available_status: availableStatus,
			response_time: responseTimeInMs,
			section: analyticsSection,
			flow_name: flowName,
		} )
	);

export const recordDomainAddAvailabilityPreCheck = (
	domain: string,
	unavailableStatus: DomainAvailabilityStatus | null,
	section: string,
	flowName: string,
	rootVendor: string
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
			root_vendor: rootVendor,
		} )
	);

type FilterValue = string | string[] | boolean;
type FilterObject = Record< string, FilterValue >;

function processFiltersForAnalytics( filters: FilterObject ) {
	const convertArraysToCSV = ( input: FilterObject ) =>
		mapValues( input, ( value ) => ( Array.isArray( value ) ? value.join( ',' ) : value ) );
	const prepareKeys = ( input: FilterObject ) =>
		mapKeys( input, ( _value, key ) => `filters_${ snakeCase( key ) }` );
	return convertArraysToCSV( prepareKeys( filters ) );
}

export function recordFiltersReset(
	filters: FilterObject,
	keysToReset: string[],
	section: string,
	flowName: string
) {
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

export function recordFiltersSubmit( filters: FilterObject, section: string, flowName: string ) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Filters Submit' ),
		recordTracksEvent( 'calypso_domain_search_filters_submit', {
			section,
			flow_name: flowName,
			...processFiltersForAnalytics( filters ),
		} )
	);
}

export function recordDomainClickMissing(
	domain: string,
	section: string,
	flowName: string,
	query: string,
	type: string
) {
	return composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Domain Click Missing from Results' ),
		recordTracksEvent( 'calypso_domain_click_missing_from_results', {
			domain,
			section,
			flow_name: flowName,
			search_query: query,
			type,
		} )
	);
}

export function recordShowMoreResults(
	searchQuery: string,
	pageNumber: number,
	section: string,
	flowName: string
) {
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
