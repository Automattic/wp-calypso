import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld } from '@automattic/domain-search';
import { debounce, useEvent } from '@wordpress/compose';
import { type ComponentProps, useEffect, useMemo, useRef } from 'react';
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
import type { SearchTrigger } from '@automattic/domain-search';

type PendingSearch = {
	query: string;
	trigger: SearchTrigger;
	startedAt: number;
};

export const useWPCOMDomainSearchEvents = ( {
	vendor,
	flowName,
	analyticsSection,
	query,
}: {
	flowName: string;
	analyticsSection: string;
	vendor?: string;
	query?: string;
} ) => {
	const dispatch = useDispatch();

	const railcarId = useRef( getNewRailcarId( 'domain-suggestion' ) );
	const searchCount = useRef( 0 );
	const lastSearchTime = useRef( Date.now() );

	const pendingSearch = useRef< PendingSearch | undefined >( undefined );

	const triggerDomainSearchEvent = useEvent( () => {
		if ( ! pendingSearch.current ) {
			return;
		}

		const { query, trigger, startedAt } = pendingSearch.current;
		pendingSearch.current = undefined;

		searchCount.current++;
		const timeDiffFromLastSearchInSeconds = Math.floor(
			( startedAt - lastSearchTime.current ) / 1000
		);
		lastSearchTime.current = startedAt;

		dispatch(
			recordSearchFormSubmit(
				query,
				analyticsSection,
				searchCount.current === 1 ? 0 : timeDiffFromLastSearchInSeconds,
				searchCount.current,
				vendor,
				flowName,
				trigger,
				startedAt
			)
		);
	} );

	// Created during render, not in an effect, because DomainSearch reports its mount search
	// before this hook's effects run. A pending search is sent early when the user leaves.
	const debouncedDomainSearchEvent = useMemo(
		() => debounce( triggerDomainSearchEvent, 10_000 ),
		[ triggerDomainSearchEvent ]
	);

	useEffect( () => {
		const sendPendingSearch = () => debouncedDomainSearchEvent.flush();

		window.addEventListener( 'pagehide', sendPendingSearch );

		return () => {
			window.removeEventListener( 'pagehide', sendPendingSearch );
			sendPendingSearch();
		};
	}, [ debouncedDomainSearchEvent ] );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			onPageView: () => {
				dispatch( recordSearchFormView( analyticsSection, flowName ) );
			},
			onQueryChange: () => {
				railcarId.current = getNewRailcarId( 'domain-suggestion' );
			},
			onSearchStart: ( query, trigger ) => {
				pendingSearch.current = { query, trigger, startedAt: Date.now() };
				debouncedDomainSearchEvent();
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
					dispatch( recordDomainSearchStepSubmit( suggestion, analyticsSection ) );
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
				dispatch( recordUseYourDomainButtonClick( analyticsSection, null, flowName ) );
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
				dispatch( recordShowMoreResults( query ?? '', pageNumber, analyticsSection, flowName ) );
			},
			onSuggestionsReceive: ( query, suggestions, responseTime ) => {
				dispatch(
					recordSearchResultsReceive( query, suggestions, responseTime, analyticsSection, flowName )
				);
			},
			onSuggestionRender: ( suggestion, reason ) => {
				let resultSuffix = '';
				if ( reason === 'recommended' ) {
					resultSuffix = '#recommended';
				} else if ( reason === 'best-alternative' ) {
					resultSuffix = '#best-alternative';
				}

				recordTracksEvent( 'calypso_traintracks_render', {
					ui_position: suggestion.position,
					flow_name: flowName,
					railcar: `${ railcarId.current }-${ suggestion.position }`,
					fetch_algo: `/domains/search/${ vendor }/${ analyticsSection }/${ suggestion.vendor }`,
					root_vendor: suggestion.vendor,
					rec_result: `${ suggestion.domain_name }${ resultSuffix }`,
					fetch_query: query,
					domain_type: suggestion.is_premium ? 'premium' : 'standard',
					tld: getTld( suggestion.domain_name ),
				} );
			},
			onSuggestionInteract: ( suggestion ) => {
				recordTracksEvent( 'calypso_traintracks_interact', {
					railcar: `${ railcarId.current }-${ suggestion.position }`,
					action: 'domain_added_to_cart',
					domain: suggestion.domain_name,
					root_vendor: suggestion.vendor,
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
				} );
			},
			onBundleAddToCart: ( bundle, placement ) => {
				recordTracksEvent( 'calypso_domain_bundle_accepted', {
					domain_bundle_group_id: bundle.bundle_group_id,
					domain_count: bundle.domains.length,
					placement,
				} );
			},
		};
	}, [ flowName, vendor, query, debouncedDomainSearchEvent, analyticsSection, dispatch ] );

	return events;
};
