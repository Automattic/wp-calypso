/**
 * Internal dependencies
 */

import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export const recordAddDomainButtonClick = ( domainName, section ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Add" Button on a Domain Registration',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_search_add_button_click', {
			domain_name: domainName,
			section,
		} )
	);

export const recordAddDomainButtonClickInMapDomain = ( domainName, section ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Add" Button on a Domain Registration in Map Domain Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_map_domain_step_add_domain_click', {
			domain_name: domainName,
			section,
		} )
	);

export const recordAddDomainButtonClickInTransferDomain = ( domainName, section ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Transfer" Button on a Domain Registration in Transfer Domain Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_transfer_domain_step_add_domain_click', {
			domain_name: domainName,
			section,
		} )
	);

export const recordAddDomainButtonClickInUseYourDomain = ( domainName, section ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Use Your Domain" Button on a Domain Search Step',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_transfer_domain_step_add_domain_click', {
			domain_name: domainName,
			section,
		} )
	);

export const recordStartTransferClickInThankYou = ( domainName ) =>
	recordTracksEvent( 'calypso_thank_you_start_transfer', {
		meta: domainName,
	} );

export const recordRemoveDomainButtonClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Remove" Button on a Domain Registration',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_remove_button_click', {
			domain_name: domainName,
		} )
	);

export const recordFormSubmitInMapDomain = ( searchBoxValue ) =>
	recordGoogleEvent(
		'Domain Search',
		'Submitted Form in Map Domain Step',
		'Search Box Value',
		searchBoxValue
	);

export const recordInputFocusInMapDomain = ( searchBoxValue ) =>
	recordGoogleEvent(
		'Domain Search',
		'Focused On Search Box Input in Map Domain Step',
		'Search Box Value',
		searchBoxValue
	);

export const recordGoButtonClickInMapDomain = ( searchBoxValue, section ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Clicked "Go" Button in Map Domain Step',
			'Search Box Value',
			searchBoxValue
		),
		recordTracksEvent( 'calypso_map_domain_step_go_click', {
			search_box_value: searchBoxValue,
			section,
		} )
	);
