import { isBlogger, isFreeWordPressComDomain } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, CompactCard, ResponsiveToolbarGroup } from '@automattic/components';
import { isHundredYearDomainFlow } from '@automattic/onboarding';
import Search from '@automattic/search';
import { withShoppingCart } from '@automattic/shopping-cart';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
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
import { stringify } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import { v4 as uuid } from 'uuid';
import Illustration from 'calypso/assets/images/domains/domain.svg';
import DomainSearchResults from 'calypso/components/domains/domain-search-results';
import ExampleDomainSuggestions from 'calypso/components/domains/example-domain-suggestions';
import FreeDomainExplainer from 'calypso/components/domains/free-domain-explainer';
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
	resetSearchCount,
	enqueueSearchStatReport,
} from 'calypso/components/domains/register-domain-step/analytics';
import {
	getStrippedDomainBase,
	getTldWeightOverrides,
	isNumberString,
	isUnknownSuggestion,
	isUnsupportedPremiumSuggestion,
	isMissingVendor,
	markFeaturedSuggestions,
} from 'calypso/components/domains/register-domain-step/utility';
import { DropdownFilters, FilterResetNotice } from 'calypso/components/domains/search-filters';
import TrademarkClaimsNotice from 'calypso/components/domains/trademark-claims-notice';
import EmptyContent from 'calypso/components/empty-content';
import Notice from 'calypso/components/notice';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import {
	checkDomainAvailability,
	getAvailableTlds,
	getDomainSuggestionSearch,
	getTld,
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
import AlreadyOwnADomain from './already-own-a-domain';
import tip from './tip';

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
		isReskinned: PropTypes.bool,
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
	};

	constructor( props ) {
		super( props );

		resetSearchCount();

		this._isMounted = false;
		this.state = this.getState( props );
		this.state.filters = this.getInitialFiltersState();
		this.state.lastFilters = this.getInitialFiltersState();

		if ( props.initialState ) {
			this.state = { ...this.state, ...props.initialState };

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
		if ( ! this.props.isInLaunchFlow ) {
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

	componentDidMount() {
		const storedQuery = globalThis?.sessionStorage?.getItem( SESSION_STORAGE_QUERY_KEY );
		const query = this.state.lastQuery || storedQuery || this.getInitialQueryInLaunchFlow();

		if ( query && ! this.state.searchResults && ! this.state.subdomainSearchResults ) {
			this.onSearch( query );

			// Delete the stored query once it is consumed.
			globalThis?.sessionStorage?.removeItem( SESSION_STORAGE_QUERY_KEY );
		} else {
			this.getAvailableTlds();
			this.save();
		}
		this._isMounted = true;
		this.props.recordSearchFormView( this.props.analyticsSection );
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
		return `${ uuid().replace( /-/g, '' ) }-domain-suggestion`;
	}

	focusSearchCard = () => {
		this.searchCard.focus();
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

	render() {
		const {
			isSignupStep,
			showAlreadyOwnADomain,
			isDomainAndPlanPackageFlow,
			replaceDomainFailedMessage,
			dismissReplaceDomainFailed,
		} = this.props;

		const {
			availabilityError,
			availabilityErrorData,
			availabilityErrorDomain,
			showAvailabilityNotice,
			showSuggestionNotice,
			suggestionError,
			suggestionErrorData,
			suggestionErrorDomain,
			trademarkClaimsNoticeInfo,
			isQueryInvalid,
		} = this.state;

		if ( trademarkClaimsNoticeInfo ) {
			return this.renderTrademarkClaimsNotice();
		}

		const { message: suggestionMessage, severity: suggestionSeverity } = showSuggestionNotice
			? getAvailabilityNotice( suggestionErrorDomain, suggestionError, suggestionErrorData )
			: {};
		const { message: availabilityMessage, severity: availabilitySeverity } = showAvailabilityNotice
			? getAvailabilityNotice( availabilityErrorDomain, availabilityError, availabilityErrorData )
			: {};

		const containerDivClassName = clsx( 'register-domain-step', {
			'register-domain-step__signup': this.props.isSignupStep,
		} );

		const searchBoxClassName = clsx( 'register-domain-step__search', {
			'register-domain-step__search-domain-step': this.props.isSignupStep,
		} );

		return (
			<>
				<div className={ containerDivClassName }>
					<div className={ searchBoxClassName }>
						<CompactCard className="register-domain-step__search-card">
							{ this.renderSearchBar() }
						</CompactCard>
					</div>
					{ isDomainAndPlanPackageFlow && this.renderQuickFilters() }

					{ ! isSignupStep && isQueryInvalid && (
						<Notice
							className="register-domain-step__notice"
							text={ `Please search for domains with more than ${ MIN_QUERY_LENGTH } characters length.` }
							status="is-info"
							showDismiss={ false }
						/>
					) }
					{ availabilityMessage && (
						<Notice
							className="register-domain-step__notice"
							text={ availabilityMessage }
							status={ `is-${ availabilitySeverity }` }
							showDismiss={ false }
						/>
					) }
					{ suggestionMessage && availabilityError !== suggestionError && (
						<Notice
							className="register-domain-step__notice"
							text={ suggestionMessage }
							status={ `is-${ suggestionSeverity }` }
							showDismiss={ false }
						/>
					) }
					{ replaceDomainFailedMessage && (
						<Notice
							status="is-error"
							text={ replaceDomainFailedMessage }
							showDismiss
							onDismissClick={ dismissReplaceDomainFailed }
						/>
					) }
					{ this.renderFilterContent() }
					{ this.renderDomainExplanationImage() }
					{ this.renderSideContent() }
				</div>
				{ showAlreadyOwnADomain && (
					<AlreadyOwnADomain
						onClick={ this.props.handleClickUseYourDomain ?? this.useYourDomainFunction() }
					/>
				) }
			</>
		);
	}

	renderSearchFilters() {
		const isRenderingInitialSuggestions =
			! Array.isArray( this.state.searchResults ) &&
			! this.state.loadingResults &&
			! this.props.showExampleSuggestions;
		const showFilters = ! isRenderingInitialSuggestions || this.props.isReskinned;

		const showTldFilter =
			( Array.isArray( this.state.availableTlds ) && this.state.availableTlds.length > 0 ) ||
			this.state.loadingResults;

		return (
			showFilters && (
				<DropdownFilters
					availableTlds={ this.state.availableTlds }
					filters={ this.state.filters }
					lastFilters={ this.state.lastFilters }
					onChange={ this.onFiltersChange }
					onReset={ this.onFiltersReset }
					onSubmit={ this.onFiltersSubmit }
					showPlaceholder={ this.state.loadingResults || ! this.getSuggestionsFromProps() }
					showTldFilter={ showTldFilter }
				/>
			)
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

		items.unshift( { key: 'all', text: 'All' } );

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
			isReskinned: this.props.isReskinned,
			childrenBeforeCloseButton:
				this.props.isDomainAndPlanPackageFlow && this.renderSearchFilters(),
		};

		return (
			<>
				<Search { ...componentProps }></Search>
				{ false === this.props.isDomainAndPlanPackageFlow && this.renderSearchFilters() }
			</>
		);
	}

	rejectTrademarkClaim = () => {
		this.setState( {
			selectedSuggestion: null,
			selectedSuggestionPosition: null,
			trademarkClaimsNoticeInfo: null,
		} );
	};

	acceptTrademarkClaim = () => {
		this.props.onAddDomain( this.state.selectedSuggestion, this.state.selectedSuggestionPosition );
	};

	renderTrademarkClaimsNotice() {
		const { isSignupStep } = this.props;
		const { selectedSuggestion, trademarkClaimsNoticeInfo, isLoading } = this.state;
		const domain = get( selectedSuggestion, 'domain_name' );

		return (
			<TrademarkClaimsNotice
				domain={ domain }
				isLoading={ isLoading }
				isSignupStep={ isSignupStep }
				onAccept={ this.acceptTrademarkClaim }
				onGoBack={ this.rejectTrademarkClaim }
				onReject={ this.rejectTrademarkClaim }
				suggestion={ selectedSuggestion }
				trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
			/>
		);
	}

	renderFilterResetNotice() {
		return (
			<FilterResetNotice
				className="register-domain-step__filter-reset-notice"
				isLoading={ this.state.loadingResults }
				lastFilters={ this.state.lastFilters }
				onReset={ this.onFiltersReset }
				suggestions={ this.state.searchResults }
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

		const className = clsx( 'register-domain-step__next-page', {
			'register-domain-step__next-page--is-loading': isLoading,
		} );
		return (
			<CompactCard className={ className }>
				<Button
					className="register-domain-step__next-page-button"
					disabled={ isLoading }
					busy={ isLoading }
					onClick={ this.showNextPage }
				>
					{ this.props.translate( 'Show more results' ) }
				</Button>
			</CompactCard>
		);
	}

	handleClickExampleSuggestion = () => {
		this.focusSearchCard();

		this.setState( { clickedExampleSuggestion: true } );
	};

	renderFilterContent() {
		const { isSignupStep } = this.props;
		const isSearching = this.state.lastQuery !== '' || this.state.loadingResults;

		if ( isSignupStep || isSearching ) {
			return (
				<>
					{ this.renderContent() }
					{ this.renderFilterResetNotice() }
					{ this.renderPaginationControls() }
				</>
			);
		}

		return (
			<>
				{ this.renderBestNamesPrompt() }
				<EmptyContent
					title=""
					className="register-domain-step__placeholder"
					illustration={ Illustration }
					illustrationWidth={ 280 }
				/>
			</>
		);
	}

	renderDomainExplanationImage() {
		return (
			<div className="register-domain-step__domain-side-content-container-domain-explanation-image">
				<span></span>
				<span></span>
				<span className="register-domain-step__domain-side-content-container-domain-explanation-image-url">
					https://
					{ this.props.translate( 'yoursitename', {
						comment: 'example url used to explain what a domain is.',
					} ) }
					.com
				</span>
				<span></span>
			</div>
		);
	}

	renderContent() {
		if ( Array.isArray( this.state.searchResults ) || this.state.loadingResults ) {
			return this.renderSearchResults();
		}

		if ( this.props.showExampleSuggestions ) {
			return this.renderExampleSuggestions();
		}

		return null;
	}

	save = () => {
		this.props.onSave( this.state );
	};

	removeUnavailablePremiumDomain = ( domainName ) => {
		this.setState( ( state ) => {
			const newPremiumDomains = { ...state.premiumDomains };
			delete newPremiumDomains[ domainName ];
			return {
				premiumDomains: newPremiumDomains,
				searchResults: state.searchResults.filter(
					( suggestion ) => suggestion.domain_name !== domainName
				),
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

	repeatSearch = ( stateOverride = {}, { shouldQuerySubdomains = true } = {} ) => {
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
			loadingResults && this.onSearch( lastQuery, { shouldQuerySubdomains } );
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
		this.props.recordFiltersReset( this.state.filters, keysToReset, this.props.analyticsSection );
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
		this.props.recordFiltersSubmit( this.state.filters, this.props.analyticsSection );
		this.repeatSearch( { pageNumber: 1 } );
	};

	onSearchChange = ( searchQuery, callback = noop ) => {
		if ( ! this._isMounted ) {
			return;
		}

		const cleanedQuery = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );
		const loadingResults = Boolean( cleanedQuery );
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
					resolve( {
						status: ! isAvailable && ! isAvailableSupportedPremiumDomain ? status : null,
						trademarkClaimsNoticeInfo: get( result, 'trademark_claims_notice_info', null ),
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
		if ( this.props.flowName === 'domain-for-gravatar' ) {
			// Also, we want to error messages for unavailable TLDs in Gravatar.
			// Since only .link is enabled for now, we show the message for all other TLDs.
			if ( getTld( domain ) !== 'link' ) {
				this.showSuggestionErrorMessage( domain, 'gravatar_tld_restriction', {} );
			}
			return;
		}

		// Skip availability check for the 100-year domain flow if the domain is not com/net/org
		if (
			isHundredYearDomainFlow( this.props.flowName ) &&
			! [ 'com', 'net', 'org' ].includes( getTld( domain ) )
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
						this.props.analyticsSection
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
			query: domain,
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

		return domains
			.suggestions( query )
			.then( ( domainSuggestions ) => {
				this.props.onDomainsAvailabilityChange( true );
				const timeDiff = Date.now() - timestamp;
				const analyticsResults = domainSuggestions.map( ( suggestion ) => suggestion.domain_name );

				this.props.recordSearchResultsReceive(
					domain,
					analyticsResults,
					timeDiff,
					domainSuggestions.length,
					this.props.analyticsSection
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
					this.props.analyticsSection
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
		].includes( suggestions?.[ 0 ]?.status );

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
			this.props.analyticsSection
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
			this.props.analyticsSection
		);

		this.setState( {
			subdomainSearchResults: [],
			loadingSubdomainResults: false,
		} );
	};

	onSearch = async ( searchQuery, { shouldQuerySubdomains = true } = {} ) => {
		debug( 'onSearch handler was triggered with query', searchQuery );

		const domain = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );

		this.setState(
			{
				lastQuery: domain,
				lastFilters: this.state.filters,
				hideInitialQuery: false,
			},
			this.save
		);

		if ( domain === '' ) {
			this.setState( { isQueryInvalid: searchQuery !== domain } );
			debug( 'onSearch handler was terminated by an empty domain input' );
			return;
		}

		enqueueSearchStatReport(
			{ query: searchQuery, section: this.props.analyticsSection, vendor: this.props.vendor },
			this.props.recordSearchFormSubmit
		);

		this.setState(
			{
				isQueryInvalid: false,
				lastDomainSearched: domain,
				railcarId: this.getNewRailcarId(),
				loadingResults: true,
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

				if ( shouldQuerySubdomains && this.isSubdomainResultsVisible() ) {
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
			this.props.analyticsSection
		);

		this.setState( { pageNumber, pageSize: PAGE_SIZE }, this.save );
	};

	renderBestNamesPrompt() {
		const { translate, promptText } = this.props;
		return (
			<div className="register-domain-step__example-prompt">
				<Icon icon={ tip } size={ 20 } />
				{ promptText ?? translate( 'The best names are short and memorable' ) }
			</div>
		);
	}

	renderExampleSuggestions() {
		const { isReskinned, domainsWithPlansOnly, offerUnavailableOption, products, path } =
			this.props;

		if ( isReskinned ) {
			return this.renderBestNamesPrompt();
		}

		return (
			<ExampleDomainSuggestions
				domainsWithPlansOnly={ domainsWithPlansOnly }
				offerUnavailableOption={ offerUnavailableOption }
				onClickExampleSuggestion={ this.handleClickExampleSuggestion }
				path={ path }
				products={ products }
				url={ this.getUseYourDomainUrl() }
			/>
		);
	}

	renderFreeDomainExplainer() {
		return <FreeDomainExplainer onSkip={ this.props.hideFreePlan } />;
	}

	onAddDomain = async ( suggestion, position, previousState ) => {
		const domain = get( suggestion, 'domain_name' );
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
			// For Multi-domain flows, add the domain first, than check availability
			if ( shouldUseMultipleDomainsInCart( this.props.flowName ) ) {
				this.props.onAddDomain( suggestion, position, previousState );
			}

			this.setState( { pendingCheckSuggestion: suggestion } );
			const promise = this.preCheckDomainAvailability( domain )
				.catch( () => [] )
				.then( ( { status, trademarkClaimsNoticeInfo } ) => {
					this.setState( { pendingCheckSuggestion: null } );
					this.props.recordDomainAddAvailabilityPreCheck(
						domain,
						status,
						this.props.analyticsSection
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
						this.props.onMappingError( domain, status );
					} else if ( ! shouldUseMultipleDomainsInCart( this.props.flowName ) ) {
						this.props.onAddDomain( suggestion, position, previousState );
					}
				} );
			this.props.checkDomainAvailabilityPromises?.push( promise );
		} else {
			this.props.onAddDomain( suggestion, position, previousState );
		}
	};

	useYourDomainFunction = () => {
		return this.goToUseYourDomainStep;
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

		// the search returned no results
		if (
			suggestions.length === 0 &&
			! this.state.loadingResults &&
			this.props.showExampleSuggestions
		) {
			return this.renderExampleSuggestions();
		}

		const hasResults =
			( Array.isArray( this.state.searchResults ) && this.state.searchResults.length ) > 0 &&
			! this.state.loadingResults;

		const isFreeDomainExplainerVisible =
			! this.props.forceHideFreeDomainExplainerAndStrikeoutUi &&
			this.props.isPlanSelectionAvailableInFlow;

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
				onClickResult={ this.onAddDomain }
				onClickMapping={ this.goToMapDomainStep }
				onAddTransfer={ this.props.onAddTransfer }
				onClickTransfer={ this.goToTransferDomainStep }
				onClickUseYourDomain={ this.props.handleClickUseYourDomain ?? this.useYourDomainFunction() }
				tracksButtonClickSource="exact-match-top"
				suggestions={ suggestions }
				premiumDomains={ premiumDomains }
				isLoadingSuggestions={ this.state.loadingResults || this.props.hasPendingRequests }
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
				isReskinned={ this.props.isReskinned }
				domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
				useProvidedProductsList={ this.props.useProvidedProductsList }
				isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
				wpcomSubdomainSelected={ this.props.wpcomSubdomainSelected }
				temporaryCart={ this.props.temporaryCart }
				domainRemovalQueue={ this.props.domainRemovalQueue }
			>
				{ ! this.props.isReskinned &&
					hasResults &&
					isFreeDomainExplainerVisible &&
					this.renderFreeDomainExplainer() }
			</DomainSearchResults>
		);
	}

	renderSideContent() {
		return this.props.isReskinned && ! this.state.loadingResults && this.props.reskinSideContent;
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

	getTransferDomainUrl() {
		let transferDomainUrl;

		if ( this.props.transferDomainUrl ) {
			transferDomainUrl = this.props.transferDomainUrl;
		} else {
			const query = stringify( { initialQuery: this.state.lastQuery.trim() } );
			transferDomainUrl = `${ this.props.basePath }/transfer`;
			if ( this.props.selectedSite ) {
				transferDomainUrl += `/${ this.props.selectedSite.slug }?${ query }`;
			}
		}

		return transferDomainUrl;
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

		this.props.recordMapDomainButtonClick( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	goToTransferDomainStep = ( event ) => {
		event.preventDefault();

		const source = event.currentTarget.dataset.tracksButtonClickSource;

		this.props.recordTransferDomainButtonClick( this.props.analyticsSection, source );

		page( this.getTransferDomainUrl() );
	};

	goToUseYourDomainStep = ( event ) => {
		event.preventDefault();

		this.props.recordUseYourDomainButtonClick( this.props.analyticsSection );

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
		const isGravatarFlow = this.props.flowName === 'domain-for-gravatar';

		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE === error ||
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE === error ||
			( isSignupStep && DOTBLOG_SUBDOMAIN === error ) ||
			( includeOwnedDomainInSuggestions && REGISTERED_OTHER_SITE_SAME_USER === error ) ||
			( isGravatarFlow &&
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
