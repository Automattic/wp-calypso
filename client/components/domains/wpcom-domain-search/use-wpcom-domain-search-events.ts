import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld } from '@automattic/domain-search';
import { debounce, useEvent } from '@wordpress/compose';
import { type ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react';
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

type AnalyticsAction = {
	type: string;
	meta?: {
		analytics?: { payload: { service: string; properties?: Record< string, unknown > } }[];
	};
};

type SearchUiVersion = 'legacy_v1' | 'i4_v1';

export const getSearchUiVersion = ( isNamePulse: boolean ): SearchUiVersion =>
	isNamePulse ? 'i4_v1' : 'legacy_v1';

export const withSearchUiVersion = < T extends AnalyticsAction >(
	action: T,
	searchUiVersion: SearchUiVersion
): T => {
	if ( ! action.meta?.analytics ) {
		return action;
	}

	return {
		...action,
		meta: {
			...action.meta,
			analytics: action.meta.analytics.map( ( entry ) =>
				entry.payload.service === 'tracks'
					? {
							...entry,
							payload: {
								...entry.payload,
								properties: { ...entry.payload.properties, search_ui_version: searchUiVersion },
							},
						}
					: entry
			),
		},
	};
};

// Hardcoded so every event name can be searched for.
const NAME_PULSE_TRACKS_EVENTS = {
	results_error: 'calypso_domain_search_results_error',
	view_cart_click: 'calypso_domain_search_view_cart_click',
	remove_button_click: 'calypso_domain_remove_button_click',
	query_clear: 'calypso_domain_search_query_clear',
} as const;

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
	isNamePulse = false,
}: {
	flowName: string;
	analyticsSection: string;
	vendor?: string;
	query?: string;
	isNamePulse?: boolean;
} ) => {
	const reduxDispatch = useDispatch();

	const searchUiVersion = getSearchUiVersion( isNamePulse );

	const dispatch = useCallback(
		( action: AnalyticsAction ) => reduxDispatch( withSearchUiVersion( action, searchUiVersion ) ),
		[ reduxDispatch, searchUiVersion ]
	);

	const recordEvent = useCallback(
		( name: string, properties: Record< string, unknown > ) =>
			recordTracksEvent( name, { ...properties, search_ui_version: searchUiVersion } ),
		[ searchUiVersion ]
	);

	const railcarId = useRef( getNewRailcarId( 'domain-suggestion' ) );
	const searchCount = useRef( 0 );

	const lastSearchTime = useRef( Date.now() );

	const pendingSearch = useRef< PendingSearch | undefined >( undefined );

	const recordSearch = useEvent(
		(
			query: string,
			trigger: SearchTrigger,
			startedAt: number,
			properties?: Record< string, unknown >
		) => {
			searchCount.current++;
			const timeDiffFromLastSearchInSeconds = Math.floor(
				( startedAt - lastSearchTime.current ) / 1000
			);
			lastSearchTime.current = startedAt;

			const args = [
				query,
				analyticsSection,
				searchCount.current === 1 ? 0 : timeDiffFromLastSearchInSeconds,
				searchCount.current,
				vendor,
				flowName,
				trigger,
				startedAt,
			] as const;

			dispatch(
				properties
					? recordSearchFormSubmit( ...args, properties )
					: recordSearchFormSubmit( ...args )
			);
		}
	);

	const triggerDomainSearchEvent = useEvent( () => {
		if ( ! pendingSearch.current ) {
			return;
		}

		const { query, trigger, startedAt } = pendingSearch.current;
		pendingSearch.current = undefined;

		recordSearch( query, trigger, startedAt );
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
				// Name Pulse records settled searches through onNamePulseSearch.
				if ( isNamePulse ) {
					return;
				}

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

					recordEvent( 'calypso_signup_skip_step', tracksProperties );
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
			onShowMoreResults: ( pageNumber, properties ) => {
				dispatch(
					recordShowMoreResults( query ?? '', pageNumber, analyticsSection, flowName, properties )
				);
			},
			onSuggestionsReceive: ( query, suggestions, responseTime, properties ) => {
				dispatch(
					recordSearchResultsReceive(
						query,
						suggestions,
						responseTime,
						analyticsSection,
						flowName,
						properties
					)
				);
			},
			onSuggestionRender: ( suggestion, reason, properties ) => {
				let resultSuffix = '';
				if ( reason === 'recommended' ) {
					resultSuffix = '#recommended';
				} else if ( reason === 'best-alternative' ) {
					resultSuffix = '#best-alternative';
				}

				recordEvent( 'calypso_traintracks_render', {
					ui_position: suggestion.position,
					flow_name: flowName,
					// Name Pulse sends its own railcar in `properties`.
					railcar: `${ railcarId.current }-${ suggestion.position }`,
					fetch_algo: `/domains/search/${ vendor }/${ analyticsSection }/${ suggestion.vendor }`,
					root_vendor: suggestion.vendor,
					rec_result: `${ suggestion.domain_name }${ resultSuffix }`,
					fetch_query: query,
					domain_type: suggestion.is_premium ? 'premium' : 'standard',
					tld: getTld( suggestion.domain_name ),
					...properties,
				} );
			},
			onSuggestionInteract: ( suggestion, railcar ) => {
				recordEvent( 'calypso_traintracks_interact', {
					railcar: railcar ?? `${ railcarId.current }-${ suggestion.position }`,
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
				recordEvent( 'calypso_domain_bundle_shown', {
					domain_bundle_group_id: bundle.bundle_group_id,
					domain_count: bundle.domains.length,
					placement,
				} );
			},
			onBundleAddToCart: ( bundle, placement ) => {
				recordEvent( 'calypso_domain_bundle_accepted', {
					domain_bundle_group_id: bundle.bundle_group_id,
					domain_count: bundle.domains.length,
					placement,
				} );
			},
			onNamePulseSearch: ( query, trigger, properties ) => {
				recordSearch( query, trigger, Date.now(), properties );
			},
			onNamePulseTracksEvent: ( name, properties ) => {
				recordEvent( NAME_PULSE_TRACKS_EVENTS[ name ], {
					section: analyticsSection,
					flow_name: flowName,
					...properties,
				} );
			},
		};
	}, [
		flowName,
		vendor,
		query,
		debouncedDomainSearchEvent,
		analyticsSection,
		dispatch,
		recordEvent,
		recordSearch,
		isNamePulse,
	] );

	return events;
};
