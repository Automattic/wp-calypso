import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSearch, getTld } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useMemo, useRef, type ComponentProps } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { submitDomainStepSelection } from 'calypso/signup/steps/domains/legacy';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordAddDomainButtonClick } from 'calypso/state/domains/actions';
import { recordUseYourDomainButtonClick } from '../../domain-search-v2/register-domain-step/analytics';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' | 'events' > & {
	currentSiteId?: number;
	flowName: string;
	events?: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue?: ( items: ResponseCartProduct[] ) => void;
		beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
	};
	isFirstDomainFreeForFirstYear?: boolean;
	flowAllowsMultipleDomainsInCart: boolean;
	analyticsSection: string;
};

const DomainSearchWithCart = ( {
	currentSiteId,
	currentSiteUrl,
	flowName,
	config: externalConfig,
	isFirstDomainFreeForFirstYear,
	flowAllowsMultipleDomainsInCart,
	analyticsSection,
	...props
}: DomainSearchProps ) => {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitelessCartKey = isLoggedIn ? 'no-site' : 'no-user';
	const cartKey = currentSiteId ?? sitelessCartKey;
	const railcarId = useRef( getNewRailcarId( 'domain-suggestion' ) );

	const { query } = props;

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear || false,
		flowAllowsMultipleDomainsInCart,
		onContinue: props.events?.onContinue,
		beforeAddDomainToCart: props.events?.beforeAddDomainToCart,
	} );

	const cartItemsLength = cart.items.length;

	const config = useMemo( () => {
		return {
			...externalConfig,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear:
					( cartItemsLength === 0 && isFirstDomainFreeForFirstYear ) || isNextDomainFree,
			},
		};
	}, [ externalConfig, isNextDomainFree, cartItemsLength, isFirstDomainFreeForFirstYear ] );

	const searchCount = useRef( 0 );
	const lastSearchTime = useRef( Date.now() );

	const triggerDomainSearchEvent = useCallback(
		( query: string ) => {
			searchCount.current++;
			const timeDiffFromLastSearchInSeconds = Math.floor(
				( Date.now() - lastSearchTime.current ) / 1000
			);
			lastSearchTime.current = Date.now();

			recordTracksEvent( 'calypso_domain_search', {
				search_box_value: query,
				search_count: searchCount.current,
				search_vendor: config.vendor,
				section: analyticsSection,
				seconds_from_last_search: searchCount.current === 1 ? 0 : timeDiffFromLastSearchInSeconds,
				flow_name: flowName,
			} );
		},
		[ config.vendor, flowName, analyticsSection ]
	);

	const debouncedDomainSearchEvent = useDebounce( triggerDomainSearchEvent, 10000 );

	const events: ComponentProps< typeof DomainSearch >[ 'events' ] = useMemo( () => {
		return {
			...props.events,
			onPageView: () => {
				recordTracksEvent( 'calypso_domain_search_pageview', {
					section: analyticsSection,
					flow_name: flowName,
				} );
			},
			onQueryChange: ( query ) => {
				railcarId.current = getNewRailcarId( 'domain-suggestion' );
				debouncedDomainSearchEvent( query );
				props.events?.onQueryChange?.( query );
			},
			onContinue: () => {
				props.events?.onContinue?.( items );
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
					dispatch( submitDomainStepSelection( suggestion, analyticsSection ) );
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

				props.events?.onSkip?.( suggestion );
			},
			onAddDomainToCart: ( domainName, position, isPremium, rootVendor ) => {
				recordTracksEvent( 'calypso_domain_search_add_button_click', {
					domain: domainName,
					position,
					section: analyticsSection,
					is_premium: isPremium,
					flow_name: flowName,
					root_vendor: rootVendor,
				} );
			},
			onExternalDomainClick: ( domainName ) => {
				dispatch( recordUseYourDomainButtonClick( analyticsSection, null, flowName ) );

				props.events?.onExternalDomainClick?.( domainName );
			},
			onQueryAvailabilityCheck: ( status, domainName, responseTime ) => {
				recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
					available_status: status,
					flow_name: flowName,
					response_time: responseTime,
					search_query: domainName,
					section: analyticsSection,
				} );
			},
			onDomainAddAvailabilityPreCheck: ( availability, domainName, rootVendor ) => {
				const isAvailable = DomainAvailabilityStatus.AVAILABLE === availability.status;
				const isAvailableSupportedPremiumDomain =
					DomainAvailabilityStatus.AVAILABLE_PREMIUM === availability.status &&
					availability.is_supported_premium_domain;

				// We only log the availability status if the domain is not available or not a supported premium domain
				const unavailableStatus =
					isAvailable || isAvailableSupportedPremiumDomain ? null : availability.status;

				recordTracksEvent( 'calypso_domain_add_availability_precheck', {
					domain: domainName,
					flow_name: flowName,
					root_vendor: rootVendor,
					section: analyticsSection,
					unavailable_status: unavailableStatus,
				} );
			},
			onFilterApplied: ( filter ) => {
				debouncedDomainSearchEvent( query ?? '' );
				recordTracksEvent( 'calypso_domain_search_filters_submit', {
					flow_name: flowName,
					filters_tlds: filter.tlds?.join( ',' ),
					filters_exact_sld_matches_only: filter.exactSldMatchesOnly,
					section: analyticsSection,
				} );
			},
			onFilterReset: ( filter, keysToReset ) => {
				debouncedDomainSearchEvent( query ?? '' );
				recordTracksEvent( 'calypso_domain_search_filters_reset', {
					keys_to_reset: keysToReset?.join( ',' ),
					filter_exact_sld_matches_only: filter.exactSldMatchesOnly,
					filter_tlds: filter.tlds?.join( ',' ),
					flow_name: flowName,
					section: analyticsSection,
				} );
			},
			onSuggestionsReceive: ( query, suggestions, responseTime ) => {
				recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
					search_query: query,
					results: suggestions.length > 0 ? suggestions.join( ';' ) : 'empty_results',
					response_time_ms: responseTime,
					result_count: suggestions.length,
					flow_name: flowName,
					section: analyticsSection,
				} );
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
					fetch_algo: `/domains/search/${ config.vendor }/${ analyticsSection }/${ suggestion.vendor }`,
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
				recordTracksEvent( 'calypso_domain_click_missing_from_results', {
					domain: domainName,
					section: analyticsSection,
					flow_name: flowName,
					search_query: query,
					type: 'domain',
				} );
			},
			onTrademarkClaimsNoticeShown: ( suggestion ) => {
				recordTracksEvent( 'calypso_show_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: analyticsSection,
				} );
			},
			onTrademarkClaimsNoticeClosed: ( suggestion ) => {
				recordTracksEvent( 'calypso_choose_another_domain_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: analyticsSection,
				} );
			},
			onTrademarkClaimsNoticeAccepted: ( suggestion ) => {
				recordTracksEvent( 'calypso_acknowledge_trademark_notice_click', {
					domain_name: suggestion.domain_name,
					section: analyticsSection,
				} );
			},
		};
	}, [
		props.events,
		items,
		flowName,
		config.vendor,
		query,
		debouncedDomainSearchEvent,
		analyticsSection,
		dispatch,
	] );

	return (
		<DomainSearch
			{ ...props }
			currentSiteUrl={ currentSiteUrl }
			currentSiteId={ currentSiteId }
			config={ config }
			cart={ cart }
			events={ events }
		/>
	);
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<CalypsoShoppingCartProvider>
			<DomainSearchWithCart { ...props } />
		</CalypsoShoppingCartProvider>
	);
};
