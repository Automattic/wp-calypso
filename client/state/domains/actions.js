/**
 * Internal dependencies
 */
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'state/analytics/actions';

export const recordAddDomainButtonClick = ( domainName, section ) => composeAnalytics(
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Add" Button on a Domain Registration',
		'Domain Name',
		domainName
	),
	recordTracksEvent( 'calypso_domain_search_add_button_click', {
		domain_name: domainName,
		section,
	} ),
);

export const recordAddDomainButtonClickInMapDomain = ( domainName, section ) => composeAnalytics(
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Add" Button on a Domain Registration in Map Domain Step',
		'Domain Name',
		domainName
	),
	recordTracksEvent( 'calypso_map_domain_step_add_domain_click', {
		domain_name: domainName,
		section
	} ),
);

export const recordRemoveDomainButtonClick = ( domainName ) => composeAnalytics(
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Remove" Button on a Domain Registration',
		'Domain Name',
		domainName
	),
	recordTracksEvent( 'calypso_domain_remove_button_click', {
		domain_name: domainName,
	} ),
);
