/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import React from 'react';
import PropTypes from 'prop-types';
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
	times,
} from 'lodash';
import page from 'page';
import { v4 as uuid } from 'uuid';
import { stringify } from 'qs';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { withShoppingCart } from '@automattic/shopping-cart';
import Search from '@automattic/search';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';
import { CompactCard, Button } from '@automattic/components';
import Notice from 'calypso/components/notice';
import StickyPanel from 'calypso/components/sticky-panel';
import {
	checkDomainAvailability,
	getFixedDomainSearch,
	getAvailableTlds,
	getDomainSuggestionSearch,
	getTld,
} from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'calypso/components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'calypso/components/domains/domain-transfer-suggestion';
import DomainSkipSuggestion from 'calypso/components/domains/domain-skip-suggestion';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';
import DomainSearchResults from 'calypso/components/domains/domain-search-results';
import ExampleDomainSuggestions from 'calypso/components/domains/example-domain-suggestions';
import FreeDomainExplainer from 'calypso/components/domains/free-domain-explainer';
import {
	DropdownFilters,
	FilterResetNotice,
	TldFilterBar,
} from 'calypso/components/domains/search-filters';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryDomainsSuggestions from 'calypso/components/data/query-domains-suggestions';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError,
} from 'calypso/state/domains/suggestions/selectors';
import {
	getStrippedDomainBase,
	getTldWeightOverrides,
	isNumberString,
	isUnknownSuggestion,
	isMissingVendor,
	markFeaturedSuggestions,
} from 'calypso/components/domains/register-domain-step/utility';
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
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { isBlogger } from '@automattic/calypso-products';
import TrademarkClaimsNotice from 'calypso/components/domains/trademark-claims-notice';
import { isSitePreviewVisible } from 'calypso/state/signup/preview/selectors';
import { hideSitePreview, showSitePreview } from 'calypso/state/signup/preview/actions';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:domains:register-domain-step' );

// TODO: Enable A/B test handling for M2.1 release
const isPaginationEnabled = config.isEnabled( 'domains/kracken-ui/pagination' );

const noop = () => {};
const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const INITIAL_SUGGESTION_QUANTITY = 2;
const PAGE_SIZE = 10;
const MAX_PAGES = 3;
const SUGGESTION_QUANTITY = isPaginationEnabled ? PAGE_SIZE * MAX_PAGES : PAGE_SIZE;
const MIN_QUERY_LENGTH = 2;

function getQueryObject( props ) {
	if ( ! props.selectedSite || ! props.selectedSite.domain ) {
		return null;
	}

	return {
		query: props.selectedSite.domain.split( '.' )[ 0 ],
		quantity: SUGGESTION_QUANTITY,
		vendor: props.vendor,
		includeSubdomain: props.includeWordPressDotCom || props.includeDotBlogSubdomain,
		vertical: props.vertical,
	};
}

class RegisterDomainStep extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		isCartPendingUpdate: PropTypes.bool,
		isDomainOnly: PropTypes.bool,
		onDomainsAvailabilityChange: PropTypes.func,
		products: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		basePath: PropTypes.string.isRequired,
		suggestion: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		isSignupStep: PropTypes.bool,
		includeWordPressDotCom: PropTypes.bool,
		includeDotBlogSubdomain: PropTypes.bool,
		showExampleSuggestions: PropTypes.bool,
		onSave: PropTypes.func,
		onAddMapping: PropTypes.func,
		onAddDomain: PropTypes.func,
		onAddTransfer: PropTypes.func,
		designType: PropTypes.string,
		deemphasiseTlds: PropTypes.array,
		recordFiltersSubmit: PropTypes.func.isRequired,
		recordFiltersReset: PropTypes.func.isRequired,
		vertical: PropTypes.string,
		isReskinned: PropTypes.bool,
		showSkipButton: PropTypes.bool,
		onSkip: PropTypes.func,
		promoTlds: PropTypes.array,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		deemphasiseTlds: [],
		includeDotBlogSubdomain: false,
		includeWordPressDotCom: false,
		isDomainOnly: false,
		onAddDomain: noop,
		onAddMapping: noop,
		onDomainsAvailabilityChange: noop,
		onSave: noop,
		vendor: getSuggestionsVendor(),
		showExampleSuggestions: false,
		onSkip: noop,
		showSkipButton: false,
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

			if ( this.state.lastVertical && this.state.lastVertical !== props.vertical ) {
				this.state.loadingResults = true;

				if ( props.includeWordPressDotCom || props.includeDotBlogSubdomain ) {
					this.state.loadingSubdomainResults = true;
				}

				delete this.state.lastVertical;
			}

			if ( props.suggestion ) {
				this.state.lastQuery = props.suggestion;
			}

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
		}
	}

	getState( props ) {
		const suggestion = props.suggestion ? getFixedDomainSearch( props.suggestion ) : '';
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
			loadingSubdomainResults:
				( props.includeWordPressDotCom || props.includeDotBlogSubdomain ) && loadingResults,
			pageNumber: 1,
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
		};
	}

	getInitialFiltersState() {
		return {
			includeDashes: false,
			maxCharacters: '',
			exactSldMatchesOnly: false,
			tlds: [],
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// Reset state on site change
		if (
			nextProps.selectedSite &&
			nextProps.selectedSite.slug !== ( this.props.selectedSite || {} ).slug
		) {
			this.setState( this.getState( nextProps ) );
			nextProps.suggestion && this.onSearch( nextProps.suggestion );
		}

		if (
			this.props.defaultSuggestionsError === nextProps.defaultSuggestionsError ||
			( ! this.props.defaultSuggestionsError && ! nextProps.defaultSuggestionsError )
		) {
			return;
		}

		const error = nextProps.defaultSuggestionsError;

		if ( ! error ) {
			return nextProps.onDomainsAvailabilityChange( true );
		}
		if ( error && error.statusCode === 503 ) {
			return nextProps.onDomainsAvailabilityChange(
				false,
				get( nextProps, 'defaultSuggestionsError.data.maintenance_end_time', null )
			);
		}

		if ( error && error.error ) {
			// don't modify global state
			const queryObject = getQueryObject( nextProps );
			if ( queryObject ) {
				this.showSuggestionErrorMessage( queryObject.query, error.error );
			}
		}
	}

	checkForBloggerPlan() {
		const plan = get( this.props, 'selectedSite.plan', false );
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

	componentDidMount() {
		if (
			this.state.lastQuery &&
			! this.state.searchResults &&
			! this.state.subdomainSearchResults
		) {
			this.onSearch( this.state.lastQuery );
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

		// Hide the signup site preview when we're loading results
		if ( this.props.isSignupStep && this.state.loadingResults && this.props.isSitePreviewVisible ) {
			this.props.hideSitePreview();
		}
	}

	getFreeSubdomainSuggestionsQuantity() {
		return this.props.includeWordPressDotCom + this.props.includeDotBlogSubdomain;
	}

	getNewRailcarId() {
		return `${ uuid().replace( /-/g, '' ) }-domain-suggestion`;
	}

	focusSearchCard = () => {
		this.searchCard.focus();
	};

	isLoadingSuggestions() {
		return ! this.props.defaultSuggestions && ! this.props.defaultSuggestionsError;
	}

	bindSearchCardReference = ( searchCard ) => {
		this.searchCard = searchCard;
	};

	getSuggestionsFromProps() {
		const { pageNumber } = this.state;
		const searchResults = this.state.searchResults || [];
		const isKrackenUi = isPaginationEnabled;

		let suggestions;
		if ( isKrackenUi ) {
			suggestions = searchResults.slice( 0, pageNumber * PAGE_SIZE );
		} else {
			suggestions = [ ...searchResults ];
		}

		if ( this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain ) {
			if ( this.state.loadingSubdomainResults && ! this.state.loadingResults ) {
				const freeSubdomainPlaceholders = Array(
					this.getFreeSubdomainSuggestionsQuantity()
				).fill( { is_placeholder: true } );
				suggestions.unshift( ...freeSubdomainPlaceholders );
			} else if ( ! isEmpty( this.state.subdomainSearchResults ) ) {
				suggestions.unshift( ...this.state.subdomainSearchResults );
			}
		}
		return suggestions;
	}

	getPlaceholderText() {
		const { isSignupStep, translate } = this.props;
		return isSignupStep
			? translate( 'Type the domain you want here' )
			: translate( 'Enter a name or keyword' );
	}

	render() {
		const queryObject = getQueryObject( this.props );
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

		const searchBoxClassName = classNames( 'register-domain-step__search', {
			'register-domain-step__search-domain-step': this.props.isSignupStep,
		} );

		return (
			<div className="register-domain-step">
				<StickyPanel className={ searchBoxClassName }>
					<CompactCard className="register-domain-step__search-card">
						<Search
							className={ this.state.clickedExampleSuggestion ? 'is-refocused' : undefined }
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							delaySearch={ true }
							delayTimeout={ 1000 }
							describedBy={ 'step-header' }
							dir="ltr"
							defaultValue={ this.state.lastQuery }
							value={ this.state.lastQuery }
							inputLabel={ this.props.translate( 'What would you like your domain name to be?' ) }
							minLength={ MIN_QUERY_LENGTH }
							maxLength={ 60 }
							onBlur={ this.save }
							onSearch={ this.onSearch }
							onSearchChange={ this.onSearchChange }
							placeholder={ this.getPlaceholderText() }
							ref={ this.bindSearchCardReference }
						>
							{ this.renderSearchFilters() }
						</Search>
					</CompactCard>
				</StickyPanel>
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

				{ this.renderContent() }
				{ this.renderFilterResetNotice() }
				{ this.renderPaginationControls() }
				{ queryObject && <QueryDomainsSuggestions { ...queryObject } /> }
				<QueryContactDetailsCache />
			</div>
		);
	}

	renderSearchFilters() {
		const isKrackenUi =
			config.isEnabled( 'domains/kracken-ui/dashes-filter' ) ||
			config.isEnabled( 'domains/kracken-ui/exact-match-filter' ) ||
			config.isEnabled( 'domains/kracken-ui/max-characters-filter' );
		const isRenderingInitialSuggestions =
			! Array.isArray( this.state.searchResults ) &&
			! this.state.loadingResults &&
			! this.props.showExampleSuggestions;
		const showFilters = isKrackenUi && ! isRenderingInitialSuggestions;
		return (
			showFilters && (
				<DropdownFilters
					filters={ this.state.filters }
					lastFilters={ this.state.lastFilters }
					onChange={ this.onFiltersChange }
					onReset={ this.onFiltersReset }
					onSubmit={ this.onFiltersSubmit }
				/>
			)
		);
	}

	rejectTrademarkClaim = () => {
		this.setState( {
			selectedSuggestion: null,
			trademarkClaimsNoticeInfo: null,
		} );
	};

	acceptTrademarkClaim = () => {
		this.props.onAddDomain( this.state.selectedSuggestion );
	};

	renderTrademarkClaimsNotice() {
		const { isSignupStep } = this.props;
		const { selectedSuggestion, trademarkClaimsNoticeInfo } = this.state;
		const domain = get( selectedSuggestion, 'domain_name' );

		return (
			<TrademarkClaimsNotice
				domain={ domain }
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
		if ( ! isPaginationEnabled ) {
			return null;
		}

		const { searchResults, pageNumber, loadingResults: isLoading } = this.state;

		if ( searchResults === null ) {
			return null;
		}

		if ( pageNumber >= MAX_PAGES ) {
			return null;
		}

		if ( searchResults.length <= pageNumber * PAGE_SIZE ) {
			return null;
		}

		const className = classNames( 'register-domain-step__next-page', {
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

	renderContent() {
		if ( Array.isArray( this.state.searchResults ) || this.state.loadingResults ) {
			return this.renderSearchResults();
		}

		if ( this.props.showExampleSuggestions ) {
			return this.renderExampleSuggestions();
		}

		return this.renderInitialSuggestions( false );
	}

	save = () => {
		this.props.onSave( this.state );
	};

	saveAndGetPremiumPrices = () => {
		this.save();

		Object.keys( this.state.premiumDomains ).map( ( premiumDomain ) => {
			this.fetchDomainPricePromise( premiumDomain )
				.catch( () => [] )
				.then( ( domainPrice ) => {
					this.setState( ( state ) => {
						const newPremiumDomains = { ...state.premiumDomains };
						newPremiumDomains[ premiumDomain ] = domainPrice;
						return {
							premiumDomains: newPremiumDomains,
						};
					} );
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

		// Reshow the signup site preview if there is no search query
		if ( ! searchQuery && this.props.isSignupStep && ! this.props.isSitePreviewVisible ) {
			this.props.showSitePreview();
		}

		const cleanedQuery = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );
		const loadingResults = Boolean( cleanedQuery );
		const isInitialQueryActive = searchQuery === this.props.suggestion;

		if ( isEmpty( cleanedQuery ) ) {
			return;
		}

		this.setState(
			{
				isInitialQueryActive,
				availabilityError: null,
				availabilityErrorData: null,
				availabilityErrorDomain: null,
				exactMatchDomain: null,
				lastDomainSearched: null,
				lastQuery: cleanedQuery,
				loadingResults,
				loadingSubdomainResults: loadingResults,
				pageNumber: 1,
				searchResults: null,
				showAvailabilityNotice: false,
				showSuggestionNotice: false,
				subdomainSearchResults: null,
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

	fetchDomainPricePromise = ( domain ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getDomainPrice( domain, ( serverError, result ) => {
				if ( serverError ) {
					resolve( {
						pending: true,
						error: serverError,
					} );
					return;
				}

				resolve( {
					pending: false,
					is_premium: result.is_premium,
					cost: result.cost,
					is_price_limit_exceeded: result?.is_price_limit_exceeded,
				} );
			} );
		} );
	};

	preCheckDomainAvailability = ( domain ) => {
		return new Promise( ( resolve ) => {
			checkDomainAvailability(
				{
					domainName: domain,
					blogId: get( this.props, 'selectedSite.ID', null ),
					isCartPreCheck: true,
				},
				( error, result ) => {
					const status = get( result, 'status', error );
					const isAvailable = domainAvailability.AVAILABLE === status;
					const isAvailableSupportedPremiumDomain =
						config.isEnabled( 'domains/premium-domain-purchases' ) &&
						domainAvailability.AVAILABLE_PREMIUM === status &&
						result?.is_supported_premium_domain;
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

		return new Promise( ( resolve ) => {
			checkDomainAvailability(
				{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
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
						TRANSFERRABLE,
						TRANSFERRABLE_PREMIUM,
						UNKNOWN,
					} = domainAvailability;
					const isDomainAvailable = includes( [ AVAILABLE, UNKNOWN ], status );
					const isDomainTransferrable = TRANSFERRABLE === status;
					const isDomainMapped = MAPPED === mappable;
					const isAvailableSupportedPremiumDomain =
						config.isEnabled( 'domains/premium-domain-purchases' ) &&
						AVAILABLE_PREMIUM === status &&
						result?.is_supported_premium_domain;

					// Mapped status always overrides other statuses.
					const availabilityStatus = isDomainMapped ? mappable : status;

					this.setState( {
						exactMatchDomain: domainChecked,
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
					resolve( isDomainAvailable || isAvailableSupportedPremiumDomain ? result : null );
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
			vertical: this.props.vertical,
			recommendation_context: get( this.props, 'selectedSite.name', '' )
				.replace( ' ', ',' )
				.toLocaleLowerCase(),
			...this.getActiveFiltersForAPI(),
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
			reject( [ ...suggestionMap.values() ], isUnknownSuggestion ),
			isMissingVendor
		);
		const markedSuggestions = markFeaturedSuggestions(
			suggestions,
			this.state.exactMatchDomain,
			getStrippedDomainBase( domain ),
			true,
			this.props.deemphasiseTlds
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
				searchResults: markedSuggestions,
				loadingResults: false,
			},
			this.saveAndGetPremiumPrices
		);
	};

	getSubdomainSuggestions = ( domain, timestamp ) => {
		const subdomainQuery = {
			query: domain,
			quantity: this.getFreeSubdomainSuggestionsQuantity(),
			include_wordpressdotcom: true,
			include_dotblogsubdomain: this.props.includeDotBlogSubdomain,
			only_wordpressdotcom: this.props.includeDotBlogSubdomain,
			tld_weight_overrides: null,
			vendor: 'dot',
			vertical: this.props.vertical,
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

	onSearch = ( searchQuery, { shouldQuerySubdomains = true } = {} ) => {
		debug( 'onSearch handler was triggered with query', searchQuery );

		const domain = getDomainSuggestionSearch( searchQuery, MIN_QUERY_LENGTH );

		this.setState(
			{
				lastQuery: searchQuery,
				lastVertical: this.props.vertical,
				lastFilters: this.state.filters,
			},
			this.save
		);

		if ( domain === '' ) {
			debug( 'onSearch handler was terminated by an empty domain input' );
			return;
		}

		enqueueSearchStatReport(
			{ query: searchQuery, section: this.props.analyticsSection, vendor: this.props.vendor },
			this.props.recordSearchFormSubmit
		);

		this.setState( { lastDomainSearched: domain, railcarId: this.getNewRailcarId() }, () => {
			const timestamp = Date.now();

			this.getAvailableTlds( domain, this.props.vendor );
			const domainSuggestions = Promise.all( [
				this.checkDomainAvailability( domain, timestamp ),
				this.getDomainsSuggestions( domain, timestamp ),
			] );

			domainSuggestions
				.catch( () => [] ) // handle the error and return an empty list
				.then( this.handleDomainSuggestions( domain ) );

			if (
				shouldQuerySubdomains &&
				( this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain )
			) {
				this.getSubdomainSuggestions( domain, timestamp );
			}
		} );
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

		this.setState( { pageNumber }, this.save );
	};

	renderInitialSuggestions() {
		let domainRegistrationSuggestions;
		let domainUnavailableSuggestion;
		let suggestions;
		let domainSkipPurchase;

		if ( this.isLoadingSuggestions() || isEmpty( this.props.products ) ) {
			domainRegistrationSuggestions = times( INITIAL_SUGGESTION_QUANTITY + 1, function ( n ) {
				return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
			} );
		} else {
			// only display two suggestions initially
			suggestions = ( this.props.defaultSuggestions || [] ).slice( 0, INITIAL_SUGGESTION_QUANTITY );

			domainRegistrationSuggestions = suggestions.map( function ( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						isSignupStep={ this.props.isSignupStep }
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						isCartPendingUpdate={ this.props.isCartPendingUpdate }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						onButtonClick={ this.onAddDomain }
						pendingCheckSuggestion={ this.state.pendingCheckSuggestion }
						unavailableDomains={ this.state.unavailableDomains }
						isReskinned={ this.props.isReskinned }
					/>
				);
			}, this );

			domainUnavailableSuggestion = (
				<DomainTransferSuggestion
					onButtonClick={ this.goToUseYourDomainStep }
					tracksButtonClickSource="initial-suggestions-bottom"
				/>
			);

			domainSkipPurchase = (
				<DomainSkipSuggestion
					selectedSiteSlug={ this.props.selectedSite.slug }
					onButtonClick={ this.props.onSkip }
				/>
			);
		}

		return (
			<div
				key="initial-suggestions" // Key is required for CSS transition of content.
				className="register-domain-step__domain-suggestions"
			>
				{ domainRegistrationSuggestions }
				{ domainUnavailableSuggestion }
				{ this.props.showSkipButton && domainSkipPurchase }
			</div>
		);
	}

	renderExampleSuggestions() {
		return (
			<ExampleDomainSuggestions
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				offerUnavailableOption={ this.props.offerUnavailableOption }
				onClickExampleSuggestion={ this.handleClickExampleSuggestion }
				path={ this.props.path }
				products={ this.props.products }
				url={ this.getUseYourDomainUrl() }
			/>
		);
	}

	renderFreeDomainExplainer() {
		return (
			<FreeDomainExplainer
				onSkip={ this.props.hideFreePlan }
				isReskinned={ this.props.isReskinned }
			/>
		);
	}

	onAddDomain = ( suggestion ) => {
		const domain = get( suggestion, 'domain_name' );
		const { premiumDomains } = this.state;

		// disable adding a domain to the cart while the premium price is still fetching
		if ( premiumDomains?.[ domain ]?.pending ) {
			return;
		}

		// also don't allow premium domain purchases over certain price point
		if ( premiumDomains?.[ domain ]?.is_price_limit_exceeded ) {
			return;
		}

		const isSubDomainSuggestion = get( suggestion, 'isSubDomainSuggestion' );
		if ( ! hasDomainInCart( this.props.cart, domain ) && ! isSubDomainSuggestion ) {
			this.setState( { pendingCheckSuggestion: suggestion } );

			this.preCheckDomainAvailability( domain )
				.catch( () => [] )
				.then( ( { status, trademarkClaimsNoticeInfo } ) => {
					this.setState( { pendingCheckSuggestion: null } );
					this.props.recordDomainAddAvailabilityPreCheck(
						domain,
						status,
						this.props.analyticsSection
					);
					if ( status ) {
						this.setState( { unavailableDomains: [ ...this.state.unavailableDomains, domain ] } );
						this.showAvailabilityErrorMessage( domain, status, {
							availabilityPreCheck: true,
						} );
					} else if ( trademarkClaimsNoticeInfo ) {
						this.setState( {
							trademarkClaimsNoticeInfo: trademarkClaimsNoticeInfo,
							selectedSuggestion: suggestion,
						} );
					} else {
						this.props.onAddDomain( suggestion );
					}
				} );
		} else {
			this.props.onAddDomain( suggestion );
		}
	};

	renderSearchResults() {
		const {
			exactMatchDomain,
			lastDomainIsTransferrable,
			lastDomainSearched,
			lastDomainStatus,
			premiumDomains,
		} = this.state;

		const matchesSearchedDomain = ( suggestion ) => suggestion.domain_name === exactMatchDomain;
		const availableDomain =
			lastDomainStatus === domainAvailability.AVAILABLE &&
			find( this.state.searchResults, matchesSearchedDomain );
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

		const showTldFilterBar =
			( Array.isArray( this.state.searchResults ) &&
				this.state.searchResults.length > 0 &&
				Array.isArray( this.state.availableTlds ) &&
				this.state.availableTlds.length > 0 ) ||
			this.state.loadingResults;

		const hasResults =
			( Array.isArray( this.state.searchResults ) && this.state.searchResults.length ) > 0 &&
			! this.state.loadingResults;

		const useYourDomainFunction =
			domainAvailability.MAPPED === lastDomainStatus
				? this.goToTransferDomainStep
				: this.goToUseYourDomainStep;

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
				lastDomainIsTransferrable={ lastDomainIsTransferrable }
				onAddMapping={ onAddMapping }
				onClickResult={ this.onAddDomain }
				onClickMapping={ this.goToMapDomainStep }
				onAddTransfer={ this.props.onAddTransfer }
				onClickTransfer={ this.goToTransferDomainStep }
				onClickUseYourDomain={ useYourDomainFunction }
				tracksButtonClickSource="exact-match-top"
				suggestions={ suggestions }
				premiumDomains={ premiumDomains }
				isLoadingSuggestions={ this.state.loadingResults }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerUnavailableOption={ this.props.offerUnavailableOption }
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
			>
				{ hasResults && isFreeDomainExplainerVisible && this.renderFreeDomainExplainer() }

				{ showTldFilterBar && (
					<TldFilterBar
						availableTlds={ this.state.availableTlds }
						filters={ this.state.filters }
						isSignupStep={ this.props.isSignupStep }
						lastFilters={ this.state.lastFilters }
						onChange={ this.onFiltersChange }
						onReset={ this.onFiltersReset }
						onSubmit={ this.onFiltersSubmit }
						showPlaceholder={ this.state.loadingResults || ! this.getSuggestionsFromProps() }
					/>
				) }
			</DomainSearchResults>
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
			const query = stringify( { initialQuery: this.state.lastQuery.trim() } );
			useYourDomainUrl = `${ this.props.basePath }/use-your-domain`;
			if ( this.props.selectedSite ) {
				useYourDomainUrl += `/${ this.props.selectedSite.slug }?${ query }`;
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
		const { DOTBLOG_SUBDOMAIN, TRANSFERRABLE } = domainAvailability;
		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
			( this.props.isSignupStep && DOTBLOG_SUBDOMAIN === error )
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
		const { DOTBLOG_SUBDOMAIN, TRANSFERRABLE } = domainAvailability;
		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
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
	( state, props ) => {
		const queryObject = getQueryObject( props );
		return {
			isSitePreviewVisible: isSitePreviewVisible( state ),
			currentUser: getCurrentUser( state ),
			defaultSuggestions: getDomainsSuggestions( state, queryObject ),
			defaultSuggestionsError: getDomainsSuggestionsError( state, queryObject ),
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
		hideSitePreview,
		showSitePreview,
	}
)( withShoppingCart( localize( RegisterDomainStep ) ) );
