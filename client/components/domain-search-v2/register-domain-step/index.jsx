import { fetchDomainSuggestions } from '@automattic/api-core';
import { isBlogger, isFreeWordPressComDomain } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ResponsiveToolbarGroup } from '@automattic/components';
import {
	DomainSearchControls,
	DomainSearchNotice,
	DomainSuggestionLoadMore,
	DomainSuggestionFilterReset,
	DomainSearchAlreadyOwnDomainCTA,
	getTld,
} from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import {
	AI_SITE_BUILDER_FLOW,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	isHundredYearDomainFlow,
	isDomainForGravatarFlow,
	NEW_HOSTED_SITE_FLOW,
} from '@automattic/onboarding';
import { withShoppingCart } from '@automattic/shopping-cart';
import {
	Button,
	Dropdown,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import {
	compact,
	find,
	flatten,
	get,
	includes,
	isEmpty,
	isEqual,
	mapKeys,
	pick,
	pickBy,
	reject,
	snakeCase,
} from 'lodash';
import PropTypes from 'prop-types';
import { stringify, parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	recordDomainAvailabilityReceive,
	recordDomainAddAvailabilityPreCheck,
	recordFiltersReset,
	recordFiltersSubmit,
	recordMapDomainButtonClick,
	recordSearchFormSubmit,
	recordSearchFormView,
	recordSearchResultsReceive,
	recordShowMoreResults,
	recordTransferDomainButtonClick,
	recordUseYourDomainButtonClick,
	recordDomainClickMissing,
	resetSearchCount,
	enqueueSearchStatReport,
} from 'calypso/components/domains/register-domain-step/analytics';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import { getDomainsInCart, hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import {
	checkDomainAvailability,
	getAvailableTlds,
	getDomainSuggestionSearch,
} from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import wpcom from 'calypso/lib/wp';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { shouldUseMultipleDomainsInCart } from 'calypso/signup/steps/domains/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { DomainSearch } from '../__legacy/domain-search';
import { DomainCartV2 } from '../domain-cart';
import { DomainSearchInput } from '../domain-search-input';
import DomainSearchResults from '../domain-search-results';
import {
	getStrippedDomainBase,
	getTldWeightOverrides,
	isNumberString,
	isUnknownSuggestion,
	isUnsupportedPremiumSuggestion,
	isMissingVendor,
	markFeaturedSuggestions,
} from './utility';

import './style.scss';

const debug = debugFactory( 'calypso:domains:register-domain-step' );

const noop = () => {};
const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const PAGE_SIZE = 10;
const EXACT_MATCH_PAGE_SIZE = 4;
const MAX_PAGES = 3;
const SUGGESTION_QUANTITY = PAGE_SIZE * MAX_PAGES;
const MIN_QUERY_LENGTH = 2;

// session storage key for query cache
const SESSION_STORAGE_QUERY_KEY = 'domain_step_query';

class RegisterDomainStep extends Component {
	static propTypes = {
		cart: PropTypes.object,
		isCartPendingUpdate: PropTypes.bool,
		isCartPendingUpdateDomain: PropTypes.object,
		isDomainOnly: PropTypes.bool,
		onDomainsAvailabilityChange: PropTypes.func,
		products: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		basePath: PropTypes.string.isRequired,
		suggestion: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		isSignupStep: PropTypes.bool,
		includeWordPressDotCom: PropTypes.bool,
		includeOwnedDomainInSuggestions: PropTypes.bool,
		includeDotBlogSubdomain: PropTypes.bool,
		showExampleSuggestions: PropTypes.bool,
		onSave: PropTypes.func,
		onAddMapping: PropTypes.func,
		onAddDomain: PropTypes.func,
		onMappingError: PropTypes.func,
		onAddTransfer: PropTypes.func,
		designType: PropTypes.string,
		deemphasiseTlds: PropTypes.array,
		recordFiltersSubmit: PropTypes.func.isRequired,
		recordFiltersReset: PropTypes.func.isRequired,
		/**
		 * A flag signalling if the step is being used in the onboarding flow
		 */
		isOnboarding: PropTypes.bool,
		showSkipButton: PropTypes.bool,
		onSkip: PropTypes.func,
		promoTlds: PropTypes.array,
		showAlreadyOwnADomain: PropTypes.bool,
		domainAndPlanUpsellFlow: PropTypes.bool,
		useProvidedProductsList: PropTypes.bool,
		otherManagedSubdomains: PropTypes.array,
		forceExactSuggestion: PropTypes.bool,
		checkDomainAvailabilityPromises: PropTypes.array,

		/**
		 * If an override is not provided we generate 1 suggestion per 1 other subdomain
		 * Multiple subdomains of .wordpress.com have not been tested
		 */
		otherManagedSubdomainsCountOverride: PropTypes.number,
		handleClickUseYourDomain: PropTypes.func,
		wpcomSubdomainSelected: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),

		/**
		 * Force the loading placeholder to show even if the search request has been completed, since there is other unresolved requests.
		 * Although it is a general functionality, but it's only needed by the hiding free subdomain test for now.
		 * It will be removed if there is still no need of it once the test concludes.
		 */
		hasPendingRequests: PropTypes.bool,

		// Whether subdomains (.wordpress.com, .blog subdomains) should be queried - used for hiding free subdomains in specific cases
		shouldQuerySubdomains: PropTypes.bool,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		deemphasiseTlds: [],
		includeDotBlogSubdomain: false,
		includeWordPressDotCom: false,
		includeOwnedDomainInSuggestions: false,
		isDomainOnly: false,
		onAddDomain: noop,
		onAddMapping: noop,
		onMappingError: noop,
		onDomainsAvailabilityChange: noop,
		onSave: noop,
		vendor: getSuggestionsVendor(),
		showExampleSuggestions: false,
		onSkip: noop,
		showSkipButton: false,
		useProvidedProductsList: false,
		otherManagedSubdomains: null,
		hasPendingRequests: false,
		forceExactSuggestion: false,
		shouldQuerySubdomains: true,
	};

	constructor( props ) {
		super( props );

		resetSearchCount();

		this._isMounted = false;
		this.state = this.getState( props );
		this.state.filters = this.getInitialFiltersState();
		this.state.lastFilters = this.getInitialFiltersState();

		if ( props.initialState ) {
			this.state = {
				...this.state,
				...props.initialState,
				// Always reset these flags on mount
				hasSubmitted: false,
				helperTermSubmitted: false,
			};

			if ( props.initialState.searchResults ) {
				this.state.loadingResults = false;
				this.state.searchResults = props.initialState.searchResults;
			}

			if ( props.initialState.subdomainSearchResults ) {
				this.state.loadingSubdomainResults = false;
				this.state.subdomainSearchResults = props.initialState.subdomainSearchResults;
			}

			if (
				this.state.searchResults ||
				this.state.subdomainSearchResults ||
				! props.initialState.isInitialQueryActive
			) {
				this.state.lastQuery = props.initialState.lastQuery;
			} else {
				this.state.railcarId = this.getNewRailcarId();
			}

			// If there's a domain name as a query parameter suggestion, we always search for it first when the page loads
			if ( props.suggestion ) {
				this.state.lastQuery = getDomainSuggestionSearch( props.suggestion, MIN_QUERY_LENGTH );

				// If we're coming from the general settings page, we want to use the exact site title as the initial query
				if ( props.forceExactSuggestion ) {
					this.state.lastQuery = props.suggestion;
				}
			}
		}
	}

	isSubdomainResultsVisible() {
		if ( ! this.props.shouldQuerySubdomains ) {
			return false;
		}

		return (
			this.props.includeWordPressDotCom ||
			this.props.includeDotBlogSubdomain ||
			this.props.otherManagedSubdomains?.length > 0
		);
	}

	getState( props ) {
		const suggestion = getDomainSuggestionSearch( props.suggestion, MIN_QUERY_LENGTH );
		const loadingResults = Boolean( suggestion );

		return {
			availabilityError: null,
			availabilityErrorData: null,
			availabilityErrorDomain: null,
			availableTlds: [],
			bloggerFilterAdded: false,
			clickedExampleSuggestion: false,
			filters: this.getInitialFiltersState(),
			lastDomainIsTransferrable: false,
			lastDomainSearched: null,
			lastDomainStatus: null,
			lastFilters: this.getInitialFiltersState(),
			lastQuery: suggestion,
			loadingResults,
			loadingSubdomainResults: this.isSubdomainResultsVisible() && loadingResults,
			pageNumber: 1,
			pageSize: PAGE_SIZE,
			premiumDomains: {},
			promoTldsAdded: false,
			searchResults: null,
			showAvailabilityNotice: false,
			showSuggestionNotice: false,
			subdomainSearchResults: null,
			suggestionError: null,
			suggestionErrorData: null,
			suggestionErrorDomain: null,
			pendingCheckSuggestion: null,
			unavailableDomains: [],
			trademarkClaimsNoticeInfo: null,
			selectedSuggestion: null,
			isInitialQueryActive: !! props.suggestion,
			checkAvailabilityTimeout: null,
		};
	}

	getInitialFiltersState() {
		return {
			exactSldMatchesOnly: false,
			tlds: [],
		};
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		// Reset state on site change
		if (
			nextProps.selectedSite &&
			nextProps.selectedSite.slug !== ( this.props.selectedSite || {} ).slug
		) {
			this.setState( this.getState( nextProps ) );
			nextProps.suggestion && this.onSearch( nextProps.suggestion );
		}
	}

	checkForBloggerPlan() {
		const plan = get( this.props, 'selectedSite.plan', {} );
		const products = get( this.props, 'cart.products', [] );
		const isBloggerPlan = isBlogger( plan ) || products.some( isBlogger );

		if (
			! this.state.bloggerFilterAdded &&
			isBloggerPlan &&
			isEqual( this.getInitialFiltersState(), this.state.filters )
		) {
			this.setState( { bloggerFilterAdded: true } );
			this.onFiltersChange( { tlds: [ 'blog' ] } );
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	// In the launch flow, the initial query could sometimes be missing if the user had
	// created a site by skipping the domain step. In these cases, fire the initial search
	// with the subdomain name.
	getInitialQueryInLaunchFlow() {
		if ( ! this.props.isInLaunchFlow || this.props.selectedSite === null ) {
			return;
		}

		if (
			typeof this.props.selectedSite !== 'object' ||
			typeof this.props.selectedSite.domain !== 'string'
		) {
			return;
		}

		const hostname = this.props.selectedSite.domain.split( '.' )[ 0 ];
		const regexHostnameWithRandomNumberSuffix = /^(.+?)([0-9]{5,})/i;
		const [ , strippedHostname ] = hostname.match( regexHostnameWithRandomNumberSuffix ) || [];
		return strippedHostname ?? hostname;
	}

	getInitialQueryFromSiteName() {
		// fallback to siteTitle in query string if there is no selected site in the props
		// This usually happens the first time this step is loaded for a free trial site
		const queryParams = parse( window.location.search.substring( 1 ) );
		const siteTitle = queryParams.siteTitle;
		return this.props.selectedSite?.name || siteTitle;
	}

	componentDidMount() {
		const storedQuery = globalThis?.sessionStorage?.getItem( SESSION_STORAGE_QUERY_KEY );
		let query = this.state.lastQuery || storedQuery;

		// Flow specific query fallbacks.
		if ( ! query && this.props.flowName === AI_SITE_BUILDER_FLOW ) {
			query = this.getInitialQueryFromSiteName();
		}

		if ( ! query && this.props.isInLaunchFlow ) {
			query = this.getInitialQueryInLaunchFlow();
		}

		if ( query && ! this.state.searchResults && ! this.state.subdomainSearchResults ) {
			this.onSearch( query );

			// Delete the stored query once it is consumed.
			globalThis?.sessionStorage?.removeItem( SESSION_STORAGE_QUERY_KEY );
		} else {
			this.getAvailableTlds();
			this.save();
		}
		this._isMounted = true;
		this.props.recordSearchFormView( this.props.analyticsSection, this.props.flowName );
	}

	componentDidUpdate( prevProps ) {
		this.checkForBloggerPlan();

		if (
			this.props.selectedSite &&
			prevProps.selectedSite &&
			this.props.selectedSite.domain !== prevProps.selectedSite.domain
		) {
			this.focusSearchCard();
		}

		// Filter out the free wp.com subdomains to avoid doing another API request.
		// Please note that it's intentional to be incomplete -- the complete version of this
		// should be able to handle flag transition the other way around, i.e.
		// when `includeWordPressDotCom` is first `false` and then transit to `true`. The
		// same should also be ported to the dotblog subdomain flag. However, this code is likely
		// temporary specific for the hiding free subdomain test, so it's not practical to implement
		// the complete version for now.
		if (
			prevProps.includeWordPressDotCom &&
			! this.props.includeWordPressDotCom &&
			this.state.subdomainSearchResults
		) {
			// this is fine since we've covered the condition to prevent infinite loop
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				subdomainSearchResults: this.state.subdomainSearchResults.filter(
					( subdomain ) => ! isFreeWordPressComDomain( subdomain )
				),
			} );
		}
	}

	getOtherManagedSubdomainsQuantity() {
		let otherManagedSubdomainsCount = 0;
		// In order to generate "other" (Not blog or wpcom) subdomains an Array of those subdomains need to be provided
		if ( Array.isArray( this.props.otherManagedSubdomains ) ) {
			// If an override is not provided we generate 1 suggestion per 1 other subdomain
			otherManagedSubdomainsCount = this.props.otherManagedSubdomains.length;
			if ( typeof this.props.otherManagedSubdomainsCountOverride === 'number' ) {
				otherManagedSubdomainsCount = this.props.otherManagedSubdomainsCountOverride;
			}
		}
		return otherManagedSubdomainsCount;
	}

	getFreeSubdomainSuggestionsQuantity() {
		return (
			this.props.includeWordPressDotCom +
			this.props.includeDotBlogSubdomain +
			this.getOtherManagedSubdomainsQuantity()
		);
	}

	getNewRailcarId() {
		return `${ crypto.randomUUID().replace( /-/g, '' ) }-domain-suggestion`;
	}

	focusSearchCard = () => {
		this.searchCard?.focus();
	};

	bindSearchCardReference = ( searchCard ) => {
		this.searchCard = searchCard;
	};

	getSuggestionsFromProps() {
		const { pageNumber, pageSize } = this.state;
		const searchResults = this.state.searchResults || [];

		const suggestions = searchResults.slice( 0, pageNumber * pageSize );

		if ( this.isSubdomainResultsVisible() ) {
			if ( this.state.loadingSubdomainResults && ! this.state.loadingResults ) {
				const freeSubdomainPlaceholders = Array( this.getFreeSubdomainSuggestionsQuantity() ).fill(
					{ is_placeholder: true }
				);
				suggestions.unshift( ...freeSubdomainPlaceholders );
			} else if ( ! isEmpty( this.state.subdomainSearchResults ) ) {
				suggestions.unshift( ...this.state.subdomainSearchResults );
			}
		}
		return suggestions;
	}

	getCart = () => {
		const { cart, onRemoveDomain } = this.props;
		const searchResults = this.state.searchResults || [];

		const domainsInCart = this.getDomainsInCart();

		const total = formatCurrency(
			domainsInCart.reduce( ( acc, item ) => acc + item.item_subtotal_integer, 0 ),
			cart.currency ?? 'USD',
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);

		return {
			isBusy: !! this.state.pendingCheckSuggestion || this.props.isMiniCartContinueButtonBusy,
			errorMessage: this.props.replaceDomainFailedMessage,
			items: domainsInCart.map( ( domain ) => {
				const [ domainName, ...tld ] = domain.meta.split( '.' );

				const hasPromotion = domain.cost_overrides?.some(
					( override ) => ! override.does_override_original_cost
				);

				const currentPrice = formatCurrency( domain.item_subtotal_integer, domain.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} );

				const originalPrice = formatCurrency( domain.item_original_cost_integer, domain.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} );

				return {
					uuid: domain.uuid,
					domain: domainName,
					tld: tld.join( '.' ),
					salePrice: hasPromotion ? currentPrice : undefined,
					price: hasPromotion ? originalPrice : currentPrice,
				};
			} ),
			total,
			onAddItem: ( domain_name ) => {
				// Try to find and add subdomain first
				const subdomain = this.state.subdomainSearchResults?.find(
					( suggestion ) => suggestion.domain_name === domain_name
				);

				if ( subdomain ) {
					const position = this.state.subdomainSearchResults.indexOf( subdomain );
					return this.onAddDomain( subdomain, position, false );
				}

				const suggestionPosition = searchResults.findIndex(
					( result ) => result.domain_name === domain_name
				);

				if ( suggestionPosition === -1 ) {
					// Not found in regular results, track it
					this.props.recordDomainClickMissing(
						domain_name,
						this.props.analyticsSection,
						this.props.flowName,
						this.state.lastQuery,
						'domain'
					);
					return;
				}

				const suggestion = searchResults[ suggestionPosition ];

				return this.onAddDomain( suggestion, suggestionPosition, false );
			},
			onRemoveItem: ( itemUuid ) => {
				const domainInCart = domainsInCart.find( ( product ) => product.cart_item_id === itemUuid );

				if ( ! domainInCart ) {
					return;
				}

				return onRemoveDomain( domainInCart );
			},
			hasItem: ( domain_name ) => {
				return domainsInCart.some( ( item ) => item.meta === domain_name );
			},
		};
	};

	renderGeneralNotices() {
		const {
			availabilityError,
			availabilityErrorData,
			availabilityErrorDomain,
			showAvailabilityNotice,
			showSuggestionNotice,
			suggestionError,
			suggestionErrorData,
			suggestionErrorDomain,
		} = this.state;

		const { message: suggestionMessage, severity: suggestionSeverity } = showSuggestionNotice
			? getAvailabilityNotice( suggestionErrorDomain, suggestionError, suggestionErrorData )
			: {};
		const { message: availabilityMessage, severity: availabilitySeverity } = showAvailabilityNotice
			? getAvailabilityNotice( availabilityErrorDomain, availabilityError, availabilityErrorData )
			: {};

		const notices = [
			availabilityMessage && (
				<DomainSearchNotice status={ availabilitySeverity }>
					{ availabilityMessage }
				</DomainSearchNotice>
			),
			suggestionMessage && availabilityError !== suggestionError && (
				<DomainSearchNotice status={ suggestionSeverity }>{ suggestionMessage }</DomainSearchNotice>
			),
		].filter( Boolean );

		if ( notices.length === 0 ) {
			return null;
		}

		return notices;
	}

	renderAlreadyOwnADomainButton() {
		const { handleClickUseYourDomain, shouldRenderUseYourDomain } = this.props;

		if ( ! shouldRenderUseYourDomain ) {
			return null;
		}

		return (
			<div className="wpcom-domain-search-v2__sticky-bottom">
				<DomainSearchAlreadyOwnDomainCTA
					onClick={ handleClickUseYourDomain ?? this.useYourDomainFunction() }
				/>
			</div>
		);
	}

	render() {
		const { onContinue, isDomainAndPlanPackageFlow, translate } = this.props;

		const notices = this.renderGeneralNotices();

		const showFreeDomainPromo =
			this.props.showFreeDomainPromo === false
				? false
				: this.props.isPlanSelectionAvailableInFlow || this.props.showFreeDomainPromo;

		const showHelperTerm =
			this.state.helperTermSubmitted || ( this.state.hasSubmitted && ! this.state.lastQuery );

		if ( this.isInInitialState() ) {
			return (
				<DomainSearch
					onContinue={ onContinue }
					cart={ this.getCart() }
					className="wpcom-domain-search-v2 initial-state"
				>
					<VStack spacing={ 8 } style={ { width: '100%' } }>
						<VStack spacing={ 2 }>
							<HStack spacing={ 4 } className="wpcom-domain-search-v2__empty-state-search-controls">
								{ this.renderSearchBar() }
								<DomainSearchControls.Submit
									onClick={ () => {
										const query = this.state.lastQuery;
										this.setState( { hasSubmitted: true } );

										if ( query ) {
											this.onSearch( query );
										}
									} }
								/>
							</HStack>
							{ showHelperTerm && (
								<Text variant="muted">
									{ translate(
										'Try searching for a word like {{studioLink}}studio{{/studioLink}} or {{coffeeLink}}coffee{{/coffeeLink}} to get started.',
										{
											components: {
												studioLink: (
													<Button
														variant="link"
														onClick={ () => this.onHelperTermClick( 'studio' ) }
														className="wpcom-domain-search-v2__empty-state-search-controls-helper-text-link"
													/>
												),
												coffeeLink: (
													<Button
														variant="link"
														onClick={ () => this.onHelperTermClick( 'coffee' ) }
														className="wpcom-domain-search-v2__empty-state-search-controls-helper-text-link"
													/>
												),
											},
										}
									) }
								</Text>
							) }
						</VStack>
						{ this.renderAlreadyOwnADomainButton() }
					</VStack>
				</DomainSearch>
			);
		}

		return (
			<DomainSearch
				onContinue={ onContinue }
				cart={ this.getCart() }
				className="wpcom-domain-search-v2"
			>
				<VStack spacing={ 8 } style={ { width: '100%' } }>
					<VStack spacing={ 4 }>
						{ this.renderSearchControls() }
						{ isDomainAndPlanPackageFlow && this.renderQuickFilters() }
						{ notices && <VStack spacing={ 2 }>{ notices }</VStack> }
					</VStack>
					{ showFreeDomainPromo && <FreeDomainForAYearPromo /> }
					{ this.renderContent() }
				</VStack>
				<DomainCartV2
					showFreeDomainPromo={ showFreeDomainPromo }
					onSkip={ this.props.showSkipButton ? this.props.onSkip : undefined }
				/>
			</DomainSearch>
		);
	}

	areArraysDifferent( a, b ) {
		if ( ! a || ! b ) {
			return a !== b;
		}
		if ( a.length !== b.length ) {
			return true;
		}
		const set = new Set( a );
		return b.some( ( item ) => ! set.has( item ) );
	}

	didFilterChange( newFilters ) {
		return (
			this.areArraysDifferent( this.state.lastFilters.tlds, newFilters.tlds ) ||
			this.state.lastFilters.exactSldMatchesOnly !== newFilters.exactSldMatchesOnly
		);
	}

	renderSearchFilters() {
		const isRenderingInitialSuggestions =
			! Array.isArray( this.state.searchResults ) &&
			! this.state.loadingResults &&
			! this.props.showExampleSuggestions;
		const showFilters = ! isRenderingInitialSuggestions || this.props.isOnboarding;

		if ( [ HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW ].includes( this.props.flowName ) ) {
			return null;
		}

		if ( ! showFilters ) {
			return null;
		}

		const filterCount =
			this.state.lastFilters.tlds.length + ( this.state.lastFilters.exactSldMatchesOnly ? 1 : 0 );

		return (
			<Dropdown
				showArrow={ false }
				popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false, inline: true } }
				renderToggle={ ( { onToggle } ) => {
					return <DomainSearchControls.FilterButton count={ filterCount } onClick={ onToggle } />;
				} }
				renderContent={ ( { onClose } ) => {
					return (
						<DomainSearchControls.FilterPopover
							availableTlds={ this.state.availableTlds }
							filter={ this.state.lastFilters }
							onClear={ () => {
								this.onFiltersReset();
								onClose();
							} }
							onApply={ ( newFilters ) => {
								if ( this.didFilterChange( newFilters ) ) {
									this.onFiltersChange( newFilters, { shouldSubmit: true } );
									onClose();
								}
							} }
						/>
					);
				} }
			/>
		);
	}

	getActiveIndexByKey( items, tlds ) {
		if ( undefined === tlds[ 0 ] ) {
			return 0;
		}

		return items.findIndex( ( item ) => item.key === tlds[ 0 ] );
	}

	renderQuickFilters() {
		if ( this.state.availableTlds.length === 0 ) {
			return;
		}

		const items = this.state.availableTlds.slice( 0, 10 ).map( ( tld ) => {
			return { key: `${ tld }`, text: `.${ tld }` };
		} );

		// translators: filter label displayed when all TLDs are enabled
		items.unshift( { key: 'all', text: this.props.translate( 'All' ) } );

		const handleClick = ( index ) => {
			const option = items[ index ].key;
			if ( 'all' === option ) {
				this.onFiltersReset();
			} else {
				this.onFiltersChange( { tlds: [ option ] }, { shouldSubmit: true } );
			}
		};

		return (
			<ResponsiveToolbarGroup
				className="register-domain-step__domains-quickfilter-group"
				initialActiveIndex={ this.getActiveIndexByKey( items, this.state.filters.tlds ) }
				forceSwipe={ 'undefined' === typeof window }
				onClick={ handleClick }
			>
				{ items.map( ( item ) => (
					<span key={ `domains-quickfilter-group-item-${ item.key }` }>{ item.text }</span>
				) ) }
			</ResponsiveToolbarGroup>
		);
	}

	renderSearchBar() {
		const componentProps = {
			className: this.state.clickedExampleSuggestion ? 'is-refocused' : undefined,
			autoFocus: true,
			delaySearch: true,
			delayTimeout: 1000,
			describedBy: 'step-header',
			dir: 'ltr',
			defaultValue: this.state.hideInitialQuery ? '' : this.state.lastQuery,
			value: this.state.hideInitialQuery ? '' : this.state.lastQuery,
			inputLabel: this.props.translate( 'What would you like your domain name to be?' ),
			minLength: MIN_QUERY_LENGTH,
			maxLength: 60,
			onBlur: this.save,
			onSearch: this.onSearch,
			onSearchChange: this.onSearchChange,
			ref: this.bindSearchCardReference,
			disableAutoSearch: this.isInInitialState(),
			isOnboarding: this.props.isOnboarding,
			placeholderAnimation: ! this.state.searchResults,
			childrenBeforeCloseButton:
				this.props.isDomainAndPlanPackageFlow && this.renderSearchFilters(),
		};

		return <DomainSearchInput { ...componentProps } />;
	}

	renderSearchControls() {
		return (
			<HStack spacing={ 4 }>
				{ this.renderSearchBar() }
				{ false === this.props.isDomainAndPlanPackageFlow && this.renderSearchFilters() }
			</HStack>
		);
	}

	clearTrademarkClaimState = () => {
		this.setState( {
			selectedSuggestion: null,
			selectedSuggestionPosition: null,
			trademarkClaimsNoticeInfo: null,
		} );
	};

	acceptTrademarkClaim = async () => {
		this.props.onAddDomain( this.state.selectedSuggestion, this.state.selectedSuggestionPosition );
		this.clearTrademarkClaimState();
	};

	renderFilterResetNotice() {
		const { exactSldMatchesOnly = false, tlds = [] } = this.state.lastFilters;
		const hasActiveFilters = exactSldMatchesOnly || tlds.length > 0;

		const suggestions = this.state.searchResults;
		const hasTooFewSuggestions = Array.isArray( suggestions ) && suggestions.length < 10;

		if ( ! ( hasActiveFilters && hasTooFewSuggestions ) ) {
			return null;
		}

		const onClickHandle = () => {
			this.onFiltersReset( 'tlds', 'exactSldMatchesOnly' );
		};

		return (
			<DomainSuggestionFilterReset
				disabled={ this.state.loadingResults }
				onClick={ onClickHandle }
			/>
		);
	}

	renderPaginationControls() {
		const { searchResults, pageNumber, pageSize, loadingResults: isLoading } = this.state;

		if ( searchResults === null ) {
			return null;
		}

		if ( pageNumber >= MAX_PAGES ) {
			return null;
		}

		if ( searchResults.length <= pageNumber * pageSize ) {
			return null;
		}

		return (
			<DomainSuggestionLoadMore
				isBusy={ isLoading }
				disabled={ isLoading }
				onClick={ this.showNextPage }
			/>
		);
	}

	handleClickExampleSuggestion = () => {
		this.focusSearchCard();

		this.setState( { clickedExampleSuggestion: true } );
	};

	renderContent() {
		return (
			<>
				{ this.renderSearchResults() }
				{ this.renderFilterResetNotice() }
				{ this.renderPaginationControls() }
			</>
		);
	}

	getDomainsInCart = () => {
		return ! shouldUseMultipleDomainsInCart( this.props.flowName )
			? []
			: getDomainsInCart( this.props.cart );
	};

	isInInitialState = () => {
		return ! Array.isArray( this.state.searchResults ) && ! this.state.loadingResults;
	};

	save = () => {
		this.props.onSave( this.state );
	};

	removeUnavailablePremiumDomain = ( domainName ) => {
		this.setState( ( state ) => {
			const premiumDomains = Object.fromEntries(
				Object.entries( state.premiumDomains ).filter( ( [ key ] ) => key !== domainName )
			);
			const { searchResults } = state;
			if ( Array.isArray( searchResults ) ) {
				const newSearchResults = searchResults.filter(
					( suggestion ) => suggestion.domain_name !== domainName
				);
				return {
					premiumDomains,
					searchResults: newSearchResults,
				};
			}
			return {
				premiumDomains,
				searchResults,
			};
		} );
	};

	saveAndGetPremiumPrices = () => {
		this.save();

		const premiumDomainsFetched = [];

		Object.keys( this.state.premiumDomains ).forEach( ( domainName ) => {
			premiumDomainsFetched.push(
				new Promise( ( resolve ) => {
					checkDomainAvailability(
						{
							domainName,
							blogId: get( this.props, 'selectedSite.ID', null ),
							vendor: this.props.vendor,
						},
						( err, availabilityResult ) => {
							if ( err ) {
								// if any error occurs, removes the domain from both premium domains and
								// search results state.
								this.removeUnavailablePremiumDomain( domainName );
								return resolve( null );
							}

							const status = availabilityResult?.status ?? err;

							const isAvailablePremiumDomain = domainAvailability.AVAILABLE_PREMIUM === status;
							const isAvailableSupportedPremiumDomain =
								domainAvailability.AVAILABLE_PREMIUM === status &&
								availabilityResult?.is_supported_premium_domain;

							if ( ! isAvailablePremiumDomain || ! isAvailableSupportedPremiumDomain ) {
								this.removeUnavailablePremiumDomain( domainName );
								return resolve( null );
							}

							this.setState(
								( state ) => {
									const newPremiumDomains = { ...state.premiumDomains };
									newPremiumDomains[ domainName ] = availabilityResult;
									return {
										premiumDomains: newPremiumDomains,
									};
								},
								() => resolve( domainName )
							);
						}
					);
				} )
			);
		} );

		Promise.all( premiumDomainsFetched ).then( () => {
			this.setState( {
				loadingResults: false,
			} );
		} );
	};

	repeatSearch = ( stateOverride = {} ) => {
		this.save();

		const { lastQuery } = this.state;
		const loadingResults = Boolean( getDomainSuggestionSearch( lastQuery, MIN_QUERY_LENGTH ) );

		const nextState = {
			availabilityError: null,
			availabilityErrorData: null,
			availabilityErrorDomain: null,
			exactMatchDomain: null,
			lastDomainSearched: null,
			lastFilters: this.state.filters,
			loadingResults,
			loadingSubdomainResults: loadingResults,
			showAvailabilityNotice: false,
			showSuggestionNotice: false,
			suggestionError: null,
			suggestionErrorData: null,
			suggestionErrorDomain: null,
			...stateOverride,
		};
		debug( 'Repeating a search with the following input for setState', nextState );
		this.setState( nextState, () => {
			loadingResults && this.onSearch( lastQuery );
		} );
	};

	getActiveFiltersForAPI() {
		const { filters } = this.state;
		const { promoTlds } = this.props;
		const filtersForAPI = mapKeys(
			pickBy(
				filters,
				( value ) => isNumberString( value ) || value === true || Array.isArray( value )
			),
			( value, key ) => snakeCase( key )
		);

		/**
		 * If promoTlds is set we want to make sure only those TLDs will be suggested
		 * so we set the filter to those or filter the existing tld filter just in case
		 */
		if ( promoTlds ) {
			if ( filtersForAPI?.tlds?.length > 0 ) {
				filtersForAPI.tlds = filtersForAPI.tlds.filter( ( tld ) => promoTlds.includes( tld ) );
			} else {
				filtersForAPI.tlds = promoTlds;
			}
		}
		return filtersForAPI;
	}

	toggleTldInFilter = ( event ) => {
		const isCurrentlySelected = event.currentTarget.dataset.selected === 'true';
		const newTld = event.currentTarget.value;

		const tlds = new Set( [ ...this.state.filters.tlds, newTld ] );
		if ( isCurrentlySelected ) {
			tlds.delete( newTld );
		}

		this.repeatSearch( {
			filters: {
				...this.state.filters,
				tlds: [ ...tlds ],
			},
			pageNumber: 1,
		} );
	};

	onFiltersChange = ( newFilters, { shouldSubmit = false } = {} ) => {
		this.setState(
			{
				filters: { ...this.state.filters, ...newFilters },
			},
			() => {
				shouldSubmit && this.onFiltersSubmit();
			}
		);
	};

	onFiltersReset = ( ...keysToReset ) => {
		this.props.recordFiltersReset(
			this.state.filters,
			keysToReset,
			this.props.analyticsSection,
			this.props.flowName
		);
		const filters = {
			...this.state.filters,
			...( Array.isArray( keysToReset ) && keysToReset.length > 0
				? pick( this.getInitialFiltersState(), keysToReset )
				: this.getInitialFiltersState() ),
		};
		this.repeatSearch( {
			filters,
			lastFilters: filters,
			pageNumber: 1,
		} );
	};

	onFiltersSubmit = () => {
		this.props.recordFiltersSubmit(
			this.state.filters,
			this.props.analyticsSection,
			this.props.flowName
		);
		this.repeatSearch( { pageNumber: 1 } );
	};

	onSearchChange = ( searchQuery, callback = noop ) => {
		if ( ! this._isMounted ) {
			return;
		}

		const cleanedQuery = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );
		const loadingResults = this.isInInitialState() ? false : Boolean( cleanedQuery );
		const isInitialQueryActive = ! searchQuery || searchQuery === this.props.suggestion;

		this.setState(
			{
				isInitialQueryActive,
				availabilityError: null,
				availabilityErrorData: null,
				availabilityErrorDomain: null,
				exactMatchDomain: null,
				lastDomainSearched: null,
				isQueryInvalid: false,
				lastQuery: cleanedQuery,
				hideInitialQuery: false,
				loadingResults,
				loadingSubdomainResults: loadingResults,
				pageNumber: 1,
				showAvailabilityNotice: false,
				showSuggestionNotice: false,
				suggestionError: null,
				suggestionErrorData: null,
				suggestionErrorDomain: null,
			},
			callback
		);
	};

	getAvailableTlds = ( domain = undefined, vendor = undefined ) => {
		const { promoTlds } = this.props;
		return getAvailableTlds( { vendor, search: domain } )
			.then( ( availableTlds ) => {
				let filteredAvailableTlds = availableTlds;
				if ( promoTlds ) {
					filteredAvailableTlds = availableTlds.filter( ( tld ) => promoTlds.includes( tld ) );
				}
				this.setState( {
					availableTlds: filteredAvailableTlds,
				} );
			} )
			.catch( noop );
	};

	fetchDomainPrice = ( domain ) => {
		return wpcom.req
			.get( `/domains/${ encodeURIComponent( domain ) }/price` )
			.then( ( data ) => ( {
				pending: false,
				is_premium: data.is_premium,
				cost: data.cost,
				sale_cost: data.sale_cost,
				renew_cost: data.renew_cost,
				is_price_limit_exceeded: data.is_price_limit_exceeded,
			} ) )
			.catch( ( error ) => ( {
				pending: true,
				error,
			} ) );
	};

	preCheckDomainAvailability = ( domain ) => {
		return new Promise( ( resolve ) => {
			checkDomainAvailability(
				{
					domainName: domain,
					blogId: get( this.props, 'selectedSite.ID', null ),
					isCartPreCheck: true,
					vendor: this.props.vendor,
				},
				( error, result ) => {
					const status = get( result, 'status', error );
					const isAvailable = domainAvailability.AVAILABLE === status;
					const isAvailableSupportedPremiumDomain =
						domainAvailability.AVAILABLE_PREMIUM === status && result?.is_supported_premium_domain;

					const trademarkClaimsNoticeInfo = get( result, 'trademark_claims_notice_info', null );

					resolve( {
						status: ! isAvailable && ! isAvailableSupportedPremiumDomain ? status : null,
						trademarkClaimsNoticeInfo: trademarkClaimsNoticeInfo
							? { domain, trademarkClaimsNoticeInfo }
							: null,
					} );
				}
			);
		} );
	};

	checkDomainAvailability = ( domain, timestamp ) => {
		if (
			! domain.match(
				/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/i
			)
		) {
			this.setState( { lastDomainStatus: null, lastDomainIsTransferrable: false } );
			return;
		}
		if ( this.props.isSignupStep && domain.match( /\.wordpress\.com$/ ) ) {
			this.setState( { lastDomainStatus: null, lastDomainIsTransferrable: false } );
			return;
		}

		if ( this.props.promoTlds && ! this.props.promoTlds.includes( getTld( domain ) ) ) {
			// We don't want to run an availability check if promoTlds are set
			// and the searched domain is not one of those TLDs
			return;
		}

		// Skips availability check for the Gravatar flow - so TLDs that are
		// available but not eligible for Gravatar won't be displayed
		if ( isDomainForGravatarFlow( this.props.flowName ) ) {
			this.clearSuggestionErrorMessage();
			const gravatarTlds = [
				'link',
				'bio',
				'contact',
				'cool',
				'fyi',
				'guru',
				'info',
				'life',
				'live',
				'ninja',
				'place',
				'pro',
				'rocks',
				'social',
				'world',
			];
			// Also, we want to error messages for unavailable TLDs in Gravatar.
			// Since only a limited number of tlds is enabled for now, we show the message for all other TLDs.
			if ( ! gravatarTlds.includes( getTld( domain ) ) ) {
				this.showSuggestionErrorMessage( domain, 'gravatar_tld_restriction', {} );
			}
			return;
		}

		// Skip availability check for the 100-year domain flow if the domain is not com/net/org
		if (
			isHundredYearDomainFlow( this.props.flowName ) &&
			! [ 'com', 'net', 'org', 'blog' ].includes( getTld( domain ) )
		) {
			this.showSuggestionErrorMessage( domain, 'hundred_year_domain_tld_restriction', {} );
			return;
		}

		return new Promise( ( resolve ) => {
			checkDomainAvailability(
				{
					domainName: domain,
					blogId: get( this.props, 'selectedSite.ID', null ),
					vendor: this.props.vendor,
				},
				( error, result ) => {
					const timeDiff = Date.now() - timestamp;
					const status = get( result, 'status', error );
					const mappable = get( result, 'mappable' );
					const domainChecked = get( result, 'domain_name', domain );

					const {
						AVAILABLE,
						AVAILABLE_PREMIUM,
						MAPPED,
						MAPPED_SAME_SITE_TRANSFERRABLE,
						MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE,
						MAPPED_SAME_SITE_REGISTRABLE,
						TRANSFERRABLE,
						TRANSFERRABLE_PREMIUM,
						UNKNOWN,
						REGISTERED_OTHER_SITE_SAME_USER,
					} = domainAvailability;

					const availableDomainStatuses = [ AVAILABLE, UNKNOWN, MAPPED_SAME_SITE_REGISTRABLE ];

					if ( error ) {
						resolve( null );
						return;
					}

					if ( this.props.includeOwnedDomainInSuggestions ) {
						availableDomainStatuses.push( REGISTERED_OTHER_SITE_SAME_USER );
					}

					const isDomainAvailable = availableDomainStatuses.includes( status );
					const isDomainTransferrable = TRANSFERRABLE === status;
					const isDomainMapped = MAPPED === mappable;
					const isAvailablePremiumDomain = AVAILABLE_PREMIUM === status;
					const isAvailableSupportedPremiumDomain =
						AVAILABLE_PREMIUM === status && result?.is_supported_premium_domain;

					/**
					 * In rare cases we don't get the FQDN as suggestion from the suggestion engine but only
					 * from the availability endpoint. Let's make sure the `is_premium` flag is set.
					 */
					if ( result?.is_supported_premium_domain ) {
						result.is_premium = true;
					}

					let availabilityStatus = status;

					// Mapped status always overrides other statuses, unless the domain is owned by the current user.
					if (
						isDomainMapped &&
						status !== REGISTERED_OTHER_SITE_SAME_USER &&
						status !== MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE &&
						status !== MAPPED_SAME_SITE_REGISTRABLE
					) {
						availabilityStatus = mappable;
					}

					if (
						[ HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW ].includes( this.props.flowName ) &&
						isAvailablePremiumDomain
					) {
						this.removeUnavailablePremiumDomain( domain );
						this.showSuggestionErrorMessage(
							domain,
							'hundred_year_domain_premium_name_restriction',
							{}
						);
						resolve( null );
					}

					this.setState( {
						exactMatchDomain: domainChecked,
						lastDomainTld: result.tld,
						lastDomainStatus: availabilityStatus,
						lastDomainIsTransferrable: isDomainTransferrable,
					} );
					if ( isDomainAvailable || isAvailableSupportedPremiumDomain ) {
						this.setState( {
							showAvailabilityNotice: false,
							availabilityError: null,
							availabilityErrorData: null,
						} );
					} else {
						let site = get( result, 'other_site_domain', null );
						if (
							includes(
								[ MAPPED_SAME_SITE_TRANSFERRABLE, AVAILABLE_PREMIUM, TRANSFERRABLE_PREMIUM ],
								status
							)
						) {
							site = get( this.props, 'selectedSite.slug', null );
						}
						this.showAvailabilityErrorMessage( domain, availabilityStatus, {
							site,
							maintenanceEndTime: get( result, 'maintenance_end_time', null ),
						} );
					}

					this.props.recordDomainAvailabilityReceive(
						domain,
						status,
						timeDiff,
						this.props.analyticsSection,
						this.props.flowName
					);

					this.props.onDomainsAvailabilityChange( true );
					resolve(
						isDomainAvailable || isAvailableSupportedPremiumDomain || isAvailablePremiumDomain
							? result
							: null
					);
				}
			);
		} );
	};

	getDomainsSuggestions = ( domain, timestamp ) => {
		const suggestionQuantity = SUGGESTION_QUANTITY - this.getFreeSubdomainSuggestionsQuantity();

		const query = {
			quantity: suggestionQuantity,
			include_wordpressdotcom: false,
			include_dotblogsubdomain: false,
			tld_weight_overrides: getTldWeightOverrides( this.props.designType ),
			vendor: this.props.vendor,
			site_slug: this.props?.selectedSite?.slug,
			recommendation_context: get( this.props, 'selectedSite.name', '' )
				.replace( ' ', ',' )
				.toLocaleLowerCase(),
			...this.getActiveFiltersForAPI(),
			include_internal_move_eligible: this.props.includeOwnedDomainInSuggestions,
		};

		debug( 'Fetching domains suggestions with the following query', query );

		return fetchDomainSuggestions( domain, query )
			.then( ( domainSuggestions ) => {
				this.props.onDomainsAvailabilityChange( true );
				const timeDiff = Date.now() - timestamp;
				const analyticsResults = domainSuggestions.map( ( suggestion ) => suggestion.domain_name );

				this.props.recordSearchResultsReceive(
					domain,
					analyticsResults,
					timeDiff,
					domainSuggestions.length,
					this.props.analyticsSection,
					this.props.flowName
				);

				return domainSuggestions;
			} )
			.catch( ( error ) => {
				const timeDiff = Date.now() - timestamp;
				if ( error && error.statusCode === 503 && ! this.props.isSignupStep ) {
					const maintenanceEndTime = get( error, 'data.maintenance_end_time', null );
					this.props.onDomainsAvailabilityChange( false, maintenanceEndTime );
				} else if ( error && error.error ) {
					this.showSuggestionErrorMessage( domain, error.error, {
						maintenanceEndTime: get( error, 'data.maintenance_end_time', null ),
						site: this.props?.selectedSite,
					} );
				}

				const analyticsResults = [
					error.code || error.error || 'ERROR' + ( error.statusCode || '' ),
				];
				this.props.recordSearchResultsReceive(
					domain,
					analyticsResults,
					timeDiff,
					-1,
					this.props.analyticsSection,
					this.props.flowName
				);
				throw error;
			} );
	};

	handleDomainSuggestions = ( domain ) => ( results ) => {
		if (
			! this.state.loadingResults ||
			domain !== this.state.lastDomainSearched ||
			! this._isMounted
		) {
			// this callback is irrelevant now, a newer search has been made or the results were cleared OR
			// domain registration was not available and component is unmounted
			return;
		}

		const suggestionMap = new Map();

		flatten( compact( results ) ).forEach( ( result ) => {
			const { domain_name: domainName } = result;
			suggestionMap.has( domainName )
				? suggestionMap.set( domainName, { ...suggestionMap.get( domainName ), ...result } )
				: suggestionMap.set( domainName, result );
		} );

		const suggestions = reject(
			reject( reject( [ ...suggestionMap.values() ], isUnknownSuggestion ), isMissingVendor ),
			isUnsupportedPremiumSuggestion
		);

		const hasAvailableFQDNSearch = [
			domainAvailability.AVAILABLE,
			domainAvailability.AVAILABLE_PREMIUM,
			this.props.includeOwnedDomainInSuggestions
				? domainAvailability.REGISTERED_OTHER_SITE_SAME_USER
				: null,
		]
			.filter( Boolean )
			.includes( suggestions?.[ 0 ]?.status );

		const markedSuggestions = markFeaturedSuggestions(
			suggestions,
			this.state.exactMatchDomain,
			getStrippedDomainBase( domain ),
			true,
			this.props.deemphasiseTlds,
			hasAvailableFQDNSearch
		);

		const premiumDomains = {};
		markedSuggestions
			.filter( ( suggestion ) => suggestion?.is_premium )
			.map( ( suggestion ) => {
				premiumDomains[ suggestion.domain_name ] = {
					pending: true,
				};
			} );

		this.setState(
			{
				premiumDomains,
				pageSize: hasAvailableFQDNSearch ? EXACT_MATCH_PAGE_SIZE : PAGE_SIZE,
				searchResults: markedSuggestions,
			},
			this.saveAndGetPremiumPrices
		);
	};

	getSubdomainSuggestions = ( domain, timestamp ) => {
		const subdomainQuery = {
			query: domain,
			quantity: this.getFreeSubdomainSuggestionsQuantity(),
			include_wordpressdotcom: this.props.includeWordPressDotCom,
			include_dotblogsubdomain: this.props.includeDotBlogSubdomain,
			only_wordpressdotcom: this.props.includeDotBlogSubdomain,
			tld_weight_overrides: null,
			vendor: 'dot',
			managed_subdomains: this.props.otherManagedSubdomains?.join(),
			managed_subdomain_quantity: this.getOtherManagedSubdomainsQuantity(),
			...this.getActiveFiltersForAPI(),
		};

		domains
			.suggestions( subdomainQuery )
			.then( this.handleSubdomainSuggestions( domain, subdomainQuery.vendor, timestamp ) )
			.catch( this.handleSubdomainSuggestionsFailure( domain, timestamp ) );
	};

	handleSubdomainSuggestions = ( domain, vendor, timestamp ) => ( subdomainSuggestions ) => {
		subdomainSuggestions = subdomainSuggestions.map( ( suggestion ) => {
			suggestion.fetch_algo = suggestion.domain_name.endsWith( '.wordpress.com' )
				? '/domains/search/wpcom'
				: '/domains/search/dotblogsub';
			suggestion.vendor = vendor;
			suggestion.isSubDomainSuggestion = true;

			return suggestion;
		} );

		this.props.onDomainsAvailabilityChange( true );
		const timeDiff = Date.now() - timestamp;
		const analyticsResults = subdomainSuggestions.map( ( suggestion ) => suggestion.domain_name );

		this.props.recordSearchResultsReceive(
			domain,
			analyticsResults,
			timeDiff,
			subdomainSuggestions.length,
			this.props.analyticsSection,
			this.props.flowName
		);

		// This part handles the other end of the condition handled by the line 282:
		// 1. The query request is sent.
		// 2. `includeWordPressDotCom` is changed by the loaded result of the experiment. (this is where the line 282 won't handle)
		// 3. The domain query result is returned and will be set here.
		// The drawback is that it'd add unnecessary computation if `includeWordPressDotCom ` never changes.
		if ( ! this.props.includeWordPressDotCom ) {
			subdomainSuggestions = subdomainSuggestions.filter(
				( subdomain ) => ! isFreeWordPressComDomain( subdomain )
			);
		}

		this.setState(
			{
				subdomainSearchResults: subdomainSuggestions,
				loadingSubdomainResults: false,
			},
			this.save
		);
	};

	handleSubdomainSuggestionsFailure = ( domain, timestamp ) => ( error ) => {
		const timeDiff = Date.now() - timestamp;

		if ( error && error.statusCode === 503 ) {
			this.props.onDomainsAvailabilityChange( false );
		} else if ( error && error.error ) {
			this.showSuggestionErrorMessage( domain, error.error );
		}

		const analyticsResults = [ error.code || error.error || 'ERROR' + ( error.statusCode || '' ) ];
		this.props.recordSearchResultsReceive(
			domain,
			analyticsResults,
			timeDiff,
			-1,
			this.props.analyticsSection,
			this.props.flowName
		);

		this.setState( {
			subdomainSearchResults: [],
			loadingSubdomainResults: false,
		} );
	};

	onSearch = async ( searchQuery ) => {
		debug( 'onSearch handler was triggered with query', searchQuery );

		const domain = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );

		this.setState(
			{
				lastQuery: domain,
				lastFilters: this.state.filters,
				hideInitialQuery: false,
				showAvailabilityNotice: false,
				showSuggestionNotice: false,
				availabilityError: null,
				availabilityErrorData: null,
				availabilityErrorDomain: null,
				suggestionError: null,
				suggestionErrorData: null,
				suggestionErrorDomain: null,
				lastDomainStatus: null,
			},
			this.save
		);

		if ( domain === '' ) {
			this.setState( { isQueryInvalid: searchQuery !== domain } );
			debug( 'onSearch handler was terminated by an empty domain input' );
			return;
		}

		enqueueSearchStatReport(
			{
				query: searchQuery,
				section: this.props.analyticsSection,
				vendor: this.props.vendor,
				flowName: this.props.flowName,
			},
			this.props.recordSearchFormSubmit
		);

		this.setState(
			{
				isQueryInvalid: false,
				lastDomainSearched: domain,
				railcarId: this.getNewRailcarId(),
				loadingResults: true,
				loadingSubdomainResults: this.isSubdomainResultsVisible(),
			},
			() => {
				const timestamp = Date.now();

				this.getAvailableTlds( domain, this.props.vendor );
				const domainSuggestions = Promise.all( [
					this.checkDomainAvailability( domain, timestamp ),
					this.getDomainsSuggestions( domain, timestamp ),
				] );

				domainSuggestions
					.catch( () => [] ) // handle the error and return an empty list
					.then( this.handleDomainSuggestions( domain ) );

				if ( this.isSubdomainResultsVisible() ) {
					this.getSubdomainSuggestions( domain, timestamp );
				}
			}
		);
	};

	showNextPage = () => {
		const pageNumber = this.state.pageNumber + 1;

		debug(
			`Showing page ${ pageNumber } with query "${ this.state.lastQuery }" in section "${ this.props.analyticsSection }"`
		);

		this.props.recordShowMoreResults(
			this.state.lastQuery,
			pageNumber,
			this.props.analyticsSection,
			this.props.flowName
		);

		this.setState( { pageNumber, pageSize: PAGE_SIZE }, this.save );
	};

	onAddDomain = async ( suggestion, position, previousState ) => {
		const domain = get( suggestion, 'domain_name' );
		const rootVendor = get( suggestion, 'vendor' );
		const { premiumDomains } = this.state;
		const { includeOwnedDomainInSuggestions } = this.props;
		const {
			DOMAIN_AVAILABILITY_THROTTLED,
			REGISTERED_OTHER_SITE_SAME_USER,
			MAPPED_SAME_SITE_REGISTRABLE,
		} = domainAvailability;

		// disable adding a domain to the cart while the premium price is still fetching
		if ( premiumDomains?.[ domain ]?.pending ) {
			return;
		}

		// also don't allow premium domain purchases over certain price point
		if ( premiumDomains?.[ domain ]?.is_price_limit_exceeded ) {
			return;
		}

		globalThis?.sessionStorage.setItem( SESSION_STORAGE_QUERY_KEY, this.state.lastQuery || '' );

		const isSubDomainSuggestion = get( suggestion, 'isSubDomainSuggestion' );
		if ( ! hasDomainInCart( this.props.cart, domain ) && ! isSubDomainSuggestion ) {
			this.setState( { pendingCheckSuggestion: suggestion } );
			const promise = this.preCheckDomainAvailability( domain )
				.then( ( { status, trademarkClaimsNoticeInfo } ) => {
					this.props.recordDomainAddAvailabilityPreCheck(
						domain,
						status,
						this.props.analyticsSection,
						this.props.flowName,
						rootVendor
					);

					const skipAvailabilityErrors =
						! status ||
						( status === REGISTERED_OTHER_SITE_SAME_USER && includeOwnedDomainInSuggestions ) ||
						status === DOMAIN_AVAILABILITY_THROTTLED ||
						status === MAPPED_SAME_SITE_REGISTRABLE;

					if ( ! skipAvailabilityErrors ) {
						this.setState( { unavailableDomains: [ ...this.state.unavailableDomains, domain ] } );
						this.showAvailabilityErrorMessage( domain, status, {
							availabilityPreCheck: true,
						} );
						this.props.onMappingError( domain, status );
					} else if ( trademarkClaimsNoticeInfo ) {
						this.setState( {
							trademarkClaimsNoticeInfo: trademarkClaimsNoticeInfo,
							selectedSuggestion: suggestion,
							selectedSuggestionPosition: position,
						} );
					} else {
						return this.props.onAddDomain( suggestion, position, previousState );
					}
				} )
				.finally( () => {
					this.setState( { pendingCheckSuggestion: null } );
				} );
			this.props.checkDomainAvailabilityPromises?.push( promise );
		} else {
			this.props.onAddDomain( suggestion, position, previousState );
		}
	};

	onHelperTermClick = ( term ) => {
		this.setState(
			{
				lastQuery: term,
				helperTermSubmitted: true,
			},
			() => this.onSearch( term )
		);
	};

	useYourDomainFunction = () => {
		return this.goToUseYourDomainStep;
	};

	getUseYourDomainHandler = () => {
		if ( [ NEW_HOSTED_SITE_FLOW, AI_SITE_BUILDER_FLOW ].includes( this.props.flowName ) ) {
			return null;
		}

		return this.props.handleClickUseYourDomain ?? this.useYourDomainFunction();
	};

	renderSearchResults() {
		const {
			exactMatchDomain,
			lastDomainIsTransferrable,
			lastDomainSearched,
			lastDomainStatus,
			lastDomainTld,
			premiumDomains,
		} = this.state;

		const matchesSearchedDomain = ( suggestion ) => suggestion.domain_name === exactMatchDomain;
		const availableDomain =
			[ domainAvailability.AVAILABLE, domainAvailability.REGISTERED_OTHER_SITE_SAME_USER ].includes(
				lastDomainStatus
			) && find( this.state.searchResults, matchesSearchedDomain );
		const onAddMapping = ( domain ) => this.props.onAddMapping( domain, this.state );

		const suggestions = this.getSuggestionsFromProps();

		return (
			<DomainSearchResults
				key="domain-search-results" // key is required for CSS transition of content/
				availableDomain={ availableDomain }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				isDomainOnly={ this.props.isDomainOnly }
				lastDomainSearched={ lastDomainSearched }
				lastDomainStatus={ lastDomainStatus }
				lastDomainTld={ lastDomainTld }
				lastDomainIsTransferrable={ lastDomainIsTransferrable }
				onAddMapping={ onAddMapping }
				onClickMapping={ this.goToMapDomainStep }
				onAddTransfer={ this.props.onAddTransfer }
				onClickUseYourDomain={ this.getUseYourDomainHandler() }
				tracksButtonClickSource="exact-match-top"
				suggestions={ suggestions }
				premiumDomains={ premiumDomains }
				isLoadingSuggestions={ this.state.loadingResults || this.props.hasPendingRequests }
				isLoadingSubdomainSuggestions={ this.state.loadingSubdomainResults }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerUnavailableOption={ this.props.offerUnavailableOption }
				showAlreadyOwnADomain={ this.props.showAlreadyOwnADomain }
				placeholderQuantity={ PAGE_SIZE }
				isSignupStep={ this.props.isSignupStep }
				showStrikedOutPrice={
					this.props.isSignupStep && ! this.props.forceHideFreeDomainExplainerAndStrikeoutUi
				}
				railcarId={ this.state.railcarId }
				fetchAlgo={ this.getFetchAlgo() }
				cart={ this.props.cart }
				isCartPendingUpdate={ this.props.isCartPendingUpdate }
				pendingCheckSuggestion={ this.state.pendingCheckSuggestion }
				unavailableDomains={ this.state.unavailableDomains }
				onSkip={ this.props.onSkip }
				showSkipButton={ this.props.showSkipButton }
				hideMatchReasons={ this.props.hideMatchReasons }
				domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
				useProvidedProductsList={ this.props.useProvidedProductsList }
				isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
				wpcomSubdomainSelected={ this.props.wpcomSubdomainSelected }
				temporaryCart={ this.props.temporaryCart }
				domainRemovalQueue={ this.props.domainRemovalQueue }
				flowName={ this.props.flowName }
				trademarkClaimsNoticeInfo={ this.state.trademarkClaimsNoticeInfo }
				onAcceptTrademarkClaim={ this.acceptTrademarkClaim }
				onRejectTrademarkClaim={ this.clearTrademarkClaimState }
			/>
		);
	}

	getFetchAlgo() {
		const fetchAlgoPrefix = '/domains/search/' + this.props.vendor;

		if ( this.props.isDomainOnly ) {
			return fetchAlgoPrefix + '/domain-only';
		}
		if ( this.props.isSignupStep ) {
			return fetchAlgoPrefix + '/signup';
		}
		return fetchAlgoPrefix + '/domains';
	}

	getMapDomainUrl() {
		let mapDomainUrl;

		if ( this.props.mapDomainUrl ) {
			mapDomainUrl = this.props.mapDomainUrl;
		} else {
			const query = stringify( { initialQuery: this.state.lastQuery.trim() } );
			mapDomainUrl = `${ this.props.basePath }/mapping`;
			if ( this.props.selectedSite ) {
				mapDomainUrl += `/${ this.props.selectedSite.slug }?${ query }`;
			}
		}

		return mapDomainUrl;
	}

	getUseYourDomainUrl() {
		let useYourDomainUrl;

		if ( this.props.useYourDomainUrl ) {
			useYourDomainUrl = this.props.useYourDomainUrl;
		} else {
			useYourDomainUrl = `${ this.props.basePath }/use-your-domain`;
			if ( this.props.selectedSite ) {
				useYourDomainUrl = domainUseMyDomain( this.props.selectedSite.slug, {
					domain: this.state.lastQuery.trim(),
				} );
			}
		}

		return useYourDomainUrl;
	}

	goToMapDomainStep = ( event ) => {
		event.preventDefault();

		this.props.recordMapDomainButtonClick( this.props.analyticsSection, this.props.flowName );

		page( this.getMapDomainUrl() );
	};

	goToUseYourDomainStep = ( event ) => {
		event.preventDefault();

		this.props.recordUseYourDomainButtonClick(
			this.props.analyticsSection,
			null,
			this.props.flowName
		);

		page( this.getUseYourDomainUrl() );
	};

	showAvailabilityErrorMessage( domain, error, errorData ) {
		const {
			DOTBLOG_SUBDOMAIN,
			TRANSFERRABLE,
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE,
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
			REGISTERED_OTHER_SITE_SAME_USER,
			REGISTERED_SAME_SITE,
		} = domainAvailability;

		const { isSignupStep, includeOwnedDomainInSuggestions } = this.props;
		const isGravatarDomain = isDomainForGravatarFlow( this.props.flowName );

		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE === error ||
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE === error ||
			( isSignupStep && DOTBLOG_SUBDOMAIN === error ) ||
			( includeOwnedDomainInSuggestions && REGISTERED_OTHER_SITE_SAME_USER === error ) ||
			( isGravatarDomain &&
				[ REGISTERED_OTHER_SITE_SAME_USER, REGISTERED_SAME_SITE ].includes( error ) )
		) {
			return;
		}
		this.setState( {
			showAvailabilityNotice: true,
			availabilityError: error,
			availabilityErrorData: errorData,
			availabilityErrorDomain: domain,
		} );
	}

	clearSuggestionErrorMessage() {
		this.setState( {
			showSuggestionNotice: false,
			suggestionError: null,
			suggestionErrorData: null,
			suggestionErrorDomain: null,
			showAvailabilityNotice: false,
			availabilityError: null,
			availabilityErrorData: null,
			availabilityErrorDomain: null,
		} );
	}

	showSuggestionErrorMessage( domain, error, errorData ) {
		const {
			DOTBLOG_SUBDOMAIN,
			TRANSFERRABLE,
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE,
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
		} = domainAvailability;
		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE === error ||
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE === error ||
			( this.props.isSignupStep && DOTBLOG_SUBDOMAIN === error )
		) {
			return;
		}
		this.setState( {
			showSuggestionNotice: true,
			suggestionError: error,
			suggestionErrorData: errorData,
			suggestionErrorDomain: domain,
		} );
	}
}

export default connect(
	( state ) => {
		return {
			currentUser: getCurrentUser( state ),
			isDomainAndPlanPackageFlow: !! getCurrentQueryArguments( state )?.domainAndPlanPackage,
			flowName: getCurrentFlowName( state ),
		};
	},
	{
		recordDomainAvailabilityReceive,
		recordDomainAddAvailabilityPreCheck,
		recordDomainClickMissing,
		recordFiltersReset,
		recordFiltersSubmit,
		recordMapDomainButtonClick,
		recordSearchFormSubmit,
		recordSearchFormView,
		recordSearchResultsReceive,
		recordShowMoreResults,
		recordTransferDomainButtonClick,
		recordUseYourDomainButtonClick,
	}
)( withCartKey( withShoppingCart( localize( RegisterDomainStep ) ) ) );
