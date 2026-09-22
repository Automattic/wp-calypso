import { DomainAvailabilityStatus } from '@automattic/api-core';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld, isFqdnQuery } from '@automattic/domain-search';
import { type ComponentProps, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { recordAddDomainButtonClick } from 'calypso/state/domains/actions';
import {
	recordAcknowledgeTrademarkButtonClickInTrademarkNotice,
	recordChooseAnotherDomainButtonClickInTrademarkNotice,
	recordShowTrademarkNoticeButtonClickInTrademarkNotice,
} from '../trademark-claims-notice';
import {
	recordUseYourDomainButtonClick,
	recordDomainSearchStepSubmit,
	recordSearchFormView,
	recordSearchResultsReceive,
	recordDomainAvailabilityReceive,
	recordSearchFormSubmit,
	recordSearchFormSubmitButtonClick,
	recordDomainAddAvailabilityPreCheck,
	recordDomainClickMissing,
	recordFiltersReset,
	recordFiltersSubmit,
	recordShowMoreResults,
} from './analytics';
import type { SearchUiVersion } from '@automattic/domain-search';

export const useWPCOMDomainSearchEvents = ( {
	vendor,
	flowName,
	analyticsSection,
	query,
	searchUiVersion,
}: {
	flowName: string;
	analyticsSection: string;
	vendor?: string;
	query?: string;
	searchUiVersion?: SearchUiVersion;
} ) => {
	const dispatch = useDispatch();

	const searchCount = useRef( 0 );
	const lastSearchTime = useRef( Date.now() );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			onPageView: () => {
				dispatch( recordSearchFormView( analyticsSection, flowName, searchUiVersion ) );
			},
			onSearch: ( query, searchId, trigger ) => {
				searchCount.current++;
				const timeDiffFromLastSearchInSeconds = Math.floor(
					( Date.now() - lastSearchTime.current ) / 1000
				);
				lastSearchTime.current = Date.now();

				dispatch(
					recordSearchFormSubmit(
						query,
						analyticsSection,
						searchCount.current === 1 ? 0 : timeDiffFromLastSearchInSeconds,
						searchCount.current,
						vendor,
						flowName,
						searchId,
						trigger,
						isFqdnQuery( query ) ? 'fqdn' : 'keyword',
						searchUiVersion
					)
				);
			},
			onSkip: ( suggestion ) => {
				if ( suggestion ) {
					// Skipped by selecting a free subdomain
					dispatch(
						recordAddDomainButtonClick(
							suggestion?.domain_name,
							analyticsSection,
							0,
							false,
							flowName,
							'dot' // this is the vendor for free WPCOM subdomains
						)
					);
					// We only offer free WPCOM subdomains during signup
					dispatch( recordDomainSearchStepSubmit( suggestion, analyticsSection, flowName ) );
				} else {
					// Skipped by clicking on "Choose a domain later"
					const tracksProperties = {
						section: analyticsSection,
						flow: flowName,
						step: 'domains',
						should_hide_free_plan: false,
					};

					recordTracksEvent( 'calypso_signup_skip_step', tracksProperties );
				}
			},
			onAddDomainToCart: ( domainName, position, isPremium, rootVendor ) => {
				dispatch(
					recordAddDomainButtonClick(
						domainName,
						analyticsSection,
						position,
						isPremium,
						flowName,
						rootVendor
					)
				);
			},
			onExternalDomainClick: () => {
				dispatch(
					recordUseYourDomainButtonClick( analyticsSection, null, flowName, searchUiVersion )
				);
			},
			onSubmitButtonClick: ( query ) => {
				dispatch( recordSearchFormSubmitButtonClick( query, analyticsSection, flowName ) );
			},
			onQueryAvailabilityCheck: ( status, domainName, responseTime ) => {
				dispatch(
					recordDomainAvailabilityReceive(
						domainName,
						status,
						responseTime,
						analyticsSection,
						flowName
					)
				);
			},
			onDomainAddAvailabilityPreCheck: ( availability, domainName, rootVendor ) => {
				const isAvailable = DomainAvailabilityStatus.AVAILABLE === availability.status;
				const isAvailableSupportedPremiumDomain =
					DomainAvailabilityStatus.AVAILABLE_PREMIUM === availability.status &&
					availability.is_supported_premium_domain;

				// We only log the availability status if the domain is not available or not a supported premium domain
				const unavailableStatus =
					isAvailable || isAvailableSupportedPremiumDomain ? null : availability.status;

				dispatch(
					recordDomainAddAvailabilityPreCheck(
						domainName,
						unavailableStatus,
						analyticsSection,
						flowName,
						rootVendor
					)
				);
			},
			onFilterApplied: ( filter ) => {
				dispatch( recordFiltersSubmit( filter, analyticsSection, flowName ) );
			},
			onFilterReset: ( filter, keysToReset ) => {
				dispatch( recordFiltersReset( filter, keysToReset, analyticsSection, flowName ) );
			},
			onShowMoreResults: ( pageNumber ) => {
				dispatch(
					recordShowMoreResults(
						query ?? '',
						pageNumber,
						analyticsSection,
						flowName,
						'list',
						searchUiVersion
					)
				);
			},
			onSuggestionsReceive: ( query, suggestions, responseTime, details ) => {
				dispatch(
					recordSearchResultsReceive(
						query,
						suggestions,
						responseTime,
						analyticsSection,
						flowName,
						{
							...details,
							searchUiVersion,
						}
					)
				);
			},
			onSuggestionRender: ( suggestion, resultGroup, reason ) => {
				let resultSuffix = '';
				if ( reason === 'recommended' ) {
					resultSuffix = '#recommended';
				} else if ( reason === 'best-alternative' ) {
					resultSuffix = '#best-alternative';
				}

				recordTracksEvent( 'calypso_traintracks_render', {
					ui_position: suggestion.position,
					flow_name: flowName,
					railcar: suggestion.railcar,
					fetch_algo: `/domains/search/${ vendor }/${ analyticsSection }/${ suggestion.vendor }`,
					root_vendor: suggestion.vendor,
					rec_result: `${ suggestion.domain_name }${ resultSuffix }`,
					fetch_query: query,
					domain_type: suggestion.is_premium ? 'premium' : 'standard',
					tld: getTld( suggestion.domain_name ),
					result_set_id: suggestion.result_set_id ?? null,
					result_group: resultGroup,
					is_ai_generated: false,
					availability_at_render: suggestion.availability_at_render,
					search_ui_version: searchUiVersion,
				} );
			},
			onSuggestionInteract: ( suggestion ) => {
				recordTracksEvent( 'calypso_traintracks_interact', {
					railcar: suggestion.railcar,
					action: 'domain_added_to_cart',
					domain: suggestion.domain_name,
					root_vendor: suggestion.vendor,
					flow_name: flowName,
					section: analyticsSection,
				} );
			},
			onSuggestionNotFound: ( domainName ) => {
				dispatch(
					recordDomainClickMissing( domainName, analyticsSection, flowName, query ?? '', 'domain' )
				);
			},
			onTrademarkClaimsNoticeShown: ( suggestion ) => {
				dispatch(
					recordShowTrademarkNoticeButtonClickInTrademarkNotice(
						suggestion.domain_name,
						analyticsSection
					)
				);
			},
			onTrademarkClaimsNoticeClosed: ( suggestion ) => {
				dispatch(
					recordChooseAnotherDomainButtonClickInTrademarkNotice(
						suggestion.domain_name,
						analyticsSection
					)
				);
			},
			onTrademarkClaimsNoticeAccepted: ( suggestion ) => {
				dispatch(
					recordAcknowledgeTrademarkButtonClickInTrademarkNotice(
						suggestion.domain_name,
						analyticsSection
					)
				);
			},
			onBundleShown: ( bundle, placement ) => {
				recordTracksEvent( 'calypso_domain_bundle_shown', {
					domain_bundle_group_id: bundle.bundle_group_id,
					domain_count: bundle.domains.length,
					placement,
					result_group: 'bundle',
					flow_name: flowName,
					section: analyticsSection,
				} );
			},
			onBundleAddToCart: ( bundle, placement ) => {
				recordTracksEvent( 'calypso_domain_bundle_accepted', {
					domain_bundle_group_id: bundle.bundle_group_id,
					domain_count: bundle.domains.length,
					placement,
					flow_name: flowName,
					section: analyticsSection,
				} );
			},
		};
	}, [ flowName, vendor, query, analyticsSection, searchUiVersion, dispatch ] );

	return events;
};
