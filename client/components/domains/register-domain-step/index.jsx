/** @format */

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
	mapKeys,
	noop,
	pick,
	pickBy,
	reject,
	snakeCase,
	times,
} from 'lodash';
import page from 'page';
import { stringify } from 'qs';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import StickyPanel from 'components/sticky-panel';
import { checkDomainAvailability, getFixedDomainSearch, getAvailableTlds } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import Search from 'components/search';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'components/domains/domain-transfer-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSearchResults from 'components/domains/domain-search-results';
import ExampleDomainSuggestions from 'components/domains/example-domain-suggestions';
import DropdownFilters from 'components/domains/search-filters/dropdown-filters';
import FilterResetNotice from 'components/domains/search-filters/filter-reset-notice';
import TldFilterBar from 'components/domains/search-filters/tld-filter-bar';
import { getCurrentUser } from 'state/current-user/selectors';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError,
} from 'state/domains/suggestions/selectors';
import {
	getStrippedDomainBase,
	getTldWeightOverrides,
	isNumberString,
	isUnknownSuggestion,
	markFeaturedSuggestions,
} from 'components/domains/register-domain-step/utility';
import {
	recordDomainAvailabilityReceive,
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
} from 'components/domains/register-domain-step/analytics';
import Spinner from 'components/spinner';

const debug = debugFactory( 'calypso:domains:register-domain-step' );

// TODO: Enable A/B test handling for M2.1 release
const isPaginationEnabled = config.isEnabled( 'domains/kracken-ui/pagination' );

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const INITIAL_SUGGESTION_QUANTITY = 2;
const PAGE_SIZE = 10;
const MAX_PAGES = 3;
const SUGGESTION_QUANTITY = isPaginationEnabled ? PAGE_SIZE * MAX_PAGES : PAGE_SIZE;
const MIN_QUERY_LENGTH = 2;

const FEATURED_SUGGESTIONS_AT_TOP = [ 'group_7', 'group_8' ];

function getQueryObject( props ) {
	if ( ! props.selectedSite || ! props.selectedSite.domain ) {
		return null;
	}

	return {
		query: props.selectedSite.domain.split( '.' )[ 0 ],
		quantity: SUGGESTION_QUANTITY,
		vendor: props.vendor,
		includeSubdomain: props.includeWordPressDotCom || props.includeDotBlogSubdomain,
		surveyVertical: props.surveyVertical,
	};
}

class RegisterDomainStep extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		onDomainsAvailabilityChange: PropTypes.func,
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		basePath: PropTypes.string.isRequired,
		suggestion: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		isSignupStep: PropTypes.bool,
		surveyVertical: PropTypes.string,
		includeWordPressDotCom: PropTypes.bool,
		includeDotBlogSubdomain: PropTypes.bool,
		showExampleSuggestions: PropTypes.bool,
		onSave: PropTypes.func,
		onAddMapping: PropTypes.func,
		onAddDomain: PropTypes.func,
		onAddTransfer: PropTypes.func,
		designType: PropTypes.string,
		recordFiltersSubmit: PropTypes.func.isRequired,
		recordFiltersReset: PropTypes.func.isRequired,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		onAddDomain: noop,
		onAddMapping: noop,
		onDomainsAvailabilityChange: noop,
		onSave: noop,
		vendor: 'domainsbot',
	};

	state = this.getState();

	getState() {
		const suggestion = this.props.suggestion ? getFixedDomainSearch( this.props.suggestion ) : '';
		const loadingResults = Boolean( suggestion );

		return {
			availableTlds: [],
			clickedExampleSuggestion: false,
			error: null,
			errorData: null,
			filters: this.getInitialFiltersState(),
			lastFilters: this.getInitialFiltersState(),
			lastQuery: suggestion,
			lastDomainSearched: null,
			lastDomainStatus: null,
			lastDomainIsTransferrable: false,
			loadingResults,
			loadingSubdomainResults:
				( this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain ) &&
				loadingResults,
			showNotice: false,
			pageNumber: 1,
			searchResults: null,
			subdomainSearchResults: null,
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

	getNewRailcarSeed() {
		// Generate a 7 character random hash on base16. E.g. ac618a3
		return Math.floor( ( 1 + Math.random() ) * 0x10000000 )
			.toString( 16 )
			.substring( 1 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// Reset state on site change
		if (
			nextProps.selectedSite &&
			nextProps.selectedSite.slug !== ( this.props.selectedSite || {} ).slug
		) {
			this.setState( this.getState() );
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
				get( nextProps, 'defaultSuggestionsError.data.maintenance_end_time', 0 )
			);
		}

		if ( error && error.error ) {
			// don't modify global state
			const queryObject = getQueryObject( nextProps );
			if ( queryObject ) {
				this.showValidationErrorMessage( queryObject.query, error.error );
			}
		}
	}

	UNSAFE_componentWillMount() {
		resetSearchCount();

		if ( this.props.initialState ) {
			const state = { ...this.props.initialState, railcarSeed: this.getNewRailcarSeed() };

			if ( state.lastSurveyVertical && state.lastSurveyVertical !== this.props.surveyVertical ) {
				state.loadingResults = true;

				if ( this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain ) {
					state.loadingSubdomainResults = true;
				}

				delete state.lastSurveyVertical;
			}

			if ( this.props.suggestion ) {
				state.lastQuery = this.props.suggestion;
				state.loadingResults = true;
			}

			this.setState( state );
		}

		this._isMounted = false;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidMount() {
		if ( this.state.lastQuery ) {
			this.onSearch( this.state.lastQuery );
		} else {
			this.getAvailableTlds();
		}

		this.props.recordSearchFormView( this.props.analyticsSection );

		this._isMounted = true;
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.selectedSite &&
			this.props.selectedSite.domain !== prevProps.selectedSite.domain
		) {
			this.focusSearchCard();
		}
	}

	focusSearchCard = () => {
		this.searchCard.focus();
	};

	isLoadingSuggestions() {
		return ! this.props.defaultSuggestions && ! this.props.defaultSuggestionsError;
	}

	bindSearchCardReference = searchCard => {
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
				suggestions.unshift( { is_placeholder: true } );
			} else if ( this.state.subdomainSearchResults && this.state.subdomainSearchResults.length ) {
				suggestions.unshift( this.state.subdomainSearchResults[ 0 ] );
			}
		}
		return suggestions;
	}

	render() {
		const queryObject = getQueryObject( this.props );
		const { errorData, error, lastDomainSearched, showNotice } = this.state;
		const { message, severity } = showNotice
			? getAvailabilityNotice( lastDomainSearched, error, errorData )
			: {};
		return (
			<div className="register-domain-step">
				<StickyPanel className="register-domain-step__search">
					<CompactCard>
						<Search
							additionalClasses={ this.state.clickedExampleSuggestion ? 'is-refocused' : undefined }
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							delaySearch={ true }
							delayTimeout={ 1000 }
							describedBy={ 'step-header' }
							dir="ltr"
							initialValue={ this.state.lastQuery }
							minLength={ MIN_QUERY_LENGTH }
							maxLength={ 60 }
							onBlur={ this.save }
							onSearch={ this.onSearch }
							onSearchChange={ this.onSearchChange }
							placeholder={ this.props.translate( 'Enter a name or keyword' ) }
							ref={ this.bindSearchCardReference }
						/>
						{ this.renderSearchFilters() }
					</CompactCard>
				</StickyPanel>
				{ message && (
					<Notice
						className="register-domain-step__notice"
						text={ message }
						status={ `is-${ severity }` }
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

		const className = classNames( 'button', 'register-domain-step__next-page', {
			'register-domain-step__next-page--is-loading': isLoading,
		} );
		return (
			<Card
				className={ className }
				disabled={ isLoading }
				onClick={ this.showNextPage }
				tagName="button"
			>
				<div className="register-domain-step__next-page-content">
					{ this.props.translate( 'Show more results' ) }
				</div>
				<div className="register-domain-step__next-page-loader">
					<Spinner size={ 20 } />
				</div>
			</Card>
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

		return this.renderInitialSuggestions();
	}

	save = () => {
		this.props.onSave( this.state );
	};

	repeatSearch = ( stateOverride = {}, { shouldQuerySubdomains = true } = {} ) => {
		this.save();

		const { lastQuery } = this.state;
		const loadingResults = Boolean( getFixedDomainSearch( lastQuery ) );

		const nextState = {
			error: null,
			errorData: null,
			exactMatchDomain: null,
			lastDomainSearched: null,
			loadingResults,
			loadingSubdomainResults: loadingResults,
			showNotice: false,
			...stateOverride,
		};
		debug( 'Repeating a search with the following input for setState', nextState );
		this.setState( nextState, () => {
			loadingResults && this.onSearch( lastQuery, { shouldQuerySubdomains } );
		} );
	};

	getActiveFiltersForAPI() {
		const { filters } = this.state;
		return mapKeys(
			pickBy(
				filters,
				value => isNumberString( value ) || value === true || Array.isArray( value )
			),
			( value, key ) => snakeCase( key )
		);
	}

	toggleTldInFilter = event => {
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

		let cleanedQuery = getFixedDomainSearch( searchQuery );
		if ( cleanedQuery.length < MIN_QUERY_LENGTH ) {
			cleanedQuery = '';
		}

		const loadingResults = Boolean( cleanedQuery );

		this.setState(
			{
				error: null,
				errorData: null,
				exactMatchDomain: null,
				lastQuery: cleanedQuery,
				lastDomainSearched: null,
				loadingResults,
				loadingSubdomainResults: loadingResults,
				showNotice: false,
				pageNumber: 1,
				searchResults: null,
				subdomainSearchResults: null,
			},
			callback
		);
	};

	getAvailableTlds = ( domain = undefined, vendor = undefined ) => {
		return getAvailableTlds( { vendor, search: domain } )
			.then( availableTlds => {
				this.setState( { availableTlds } );
			} )
			.catch( noop );
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

		return new Promise( resolve => {
			checkDomainAvailability(
				{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
				( error, result ) => {
					const timeDiff = Date.now() - timestamp;
					const status = get( result, 'status', error );
					const domainChecked = get( result, 'domain_name', domain );

					const {
						AVAILABLE,
						MAPPED_SAME_SITE_TRANSFERRABLE,
						TRANSFERRABLE,
						UNKNOWN,
					} = domainAvailability;
					const isDomainAvailable = includes( [ AVAILABLE, UNKNOWN ], status );
					const isDomainTransferrable = TRANSFERRABLE === status;

					this.setState( {
						exactMatchDomain: domainChecked,
						lastDomainStatus: status,
						lastDomainIsTransferrable: isDomainTransferrable,
					} );
					if ( isDomainAvailable ) {
						this.setState( {
							showNotice: false,
							error: null,
							errorData: null,
						} );
					} else {
						let site = get( result, 'other_site_domain', null );
						if ( MAPPED_SAME_SITE_TRANSFERRABLE === status ) {
							site = get( this.props, 'selectedSite.slug', null );
						}
						this.showValidationErrorMessage( domain, status, {
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
					resolve( isDomainAvailable ? result : null );
				}
			);
		} );
	};

	getDomainsSuggestions = ( domain, timestamp ) => {
		const suggestionQuantity =
			this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain
				? SUGGESTION_QUANTITY - 1
				: SUGGESTION_QUANTITY;

		const query = {
			query: domain,
			quantity: suggestionQuantity,
			include_wordpressdotcom: false,
			include_dotblogsubdomain: false,
			tld_weight_overrides: getTldWeightOverrides( this.props.designType ),
			vendor: this.props.vendor,
			vertical: this.props.surveyVertical,
			recommendation_context: get( this.props, 'selectedSite.name', '' )
				.replace( ' ', ',' )
				.toLocaleLowerCase(),
			...this.getActiveFiltersForAPI(),
		};

		debug( 'Fetching domains suggestions with the following query', query );

		return domains
			.suggestions( query )
			.then( domainSuggestions => {
				this.props.onDomainsAvailabilityChange( true );
				const timeDiff = Date.now() - timestamp;
				const analyticsResults = domainSuggestions.map( suggestion => suggestion.domain_name );

				this.props.recordSearchResultsReceive(
					domain,
					analyticsResults,
					timeDiff,
					domainSuggestions.length,
					this.props.analyticsSection
				);

				return domainSuggestions;
			} )
			.catch( error => {
				const timeDiff = Date.now() - timestamp;
				if ( error && error.statusCode === 503 && ! this.props.isSignupStep ) {
					const maintenanceEndTime = get( error, 'data.maintenance_end_time', 0 );
					this.props.onDomainsAvailabilityChange( false, maintenanceEndTime );
				} else if ( error && error.error ) {
					this.showValidationErrorMessage( domain, error.error, {
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

	handleDomainSuggestions = domain => results => {
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
		flatten( compact( results ) ).forEach( result => {
			const { domain_name: domainName } = result;
			suggestionMap.has( domainName )
				? suggestionMap.set( domainName, { ...suggestionMap.get( domainName ), ...result } )
				: suggestionMap.set( domainName, result );
		} );
		const suggestions = reject( [ ...suggestionMap.values() ], isUnknownSuggestion );
		const markedSuggestions = markFeaturedSuggestions(
			suggestions,
			this.state.exactMatchDomain,
			getStrippedDomainBase( domain ),
			includes( FEATURED_SUGGESTIONS_AT_TOP, this.props.vendor )
		);

		this.setState(
			{
				searchResults: markedSuggestions,
				loadingResults: false,
			},
			this.save
		);
	};

	getSubdomainSuggestions = ( domain, timestamp ) => {
		const subdomainQuery = {
			query: domain,
			quantity: 1,
			include_wordpressdotcom: ! this.props.includeDotBlogSubdomain,
			include_dotblogsubdomain: this.props.includeDotBlogSubdomain,
			tld_weight_overrides: null,
			vendor: 'wpcom',
			vertical: this.props.surveyVertical,
			...this.getActiveFiltersForAPI(),
		};

		domains
			.suggestions( subdomainQuery )
			.then( this.handleSubdomainSuggestions( domain, timestamp ) )
			.catch( this.handleSubdomainSuggestionsFailure( domain, timestamp ) );
	};

	handleSubdomainSuggestions = ( domain, timestamp ) => subdomainSuggestions => {
		this.props.onDomainsAvailabilityChange( true );
		const timeDiff = Date.now() - timestamp;
		const analyticsResults = subdomainSuggestions.map( suggestion => suggestion.domain_name );

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

	handleSubdomainSuggestionsFailure = ( domain, timestamp ) => error => {
		const timeDiff = Date.now() - timestamp;

		if ( error && error.statusCode === 503 ) {
			this.props.onDomainsAvailabilityChange( false );
		} else if ( error && error.error ) {
			this.showValidationErrorMessage( domain, error.error );
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

		let domain = getFixedDomainSearch( searchQuery );
		if ( domain.length < MIN_QUERY_LENGTH ) {
			domain = '';
		}

		this.setState(
			{
				lastQuery: searchQuery,
				lastSurveyVertical: this.props.surveyVertical,
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

		this.setState( {
			lastDomainSearched: domain,
			railcarSeed: this.getNewRailcarSeed(),
		} );

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
	};

	showNextPage = () => {
		const pageNumber = this.state.pageNumber + 1;

		debug(
			`Showing page ${ pageNumber } with query "${ this.state.lastQuery }" in section "${
				this.props.analyticsSection
			}"`
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

		if ( this.isLoadingSuggestions() || isEmpty( this.props.products ) ) {
			domainRegistrationSuggestions = times( INITIAL_SUGGESTION_QUANTITY + 1, function( n ) {
				return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
			} );
		} else {
			// only display two suggestions initially
			suggestions = ( this.props.defaultSuggestions || [] ).slice( 0, INITIAL_SUGGESTION_QUANTITY );

			domainRegistrationSuggestions = suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						isSignupStep={ this.props.isSignupStep }
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						onButtonClick={ this.props.onAddDomain }
					/>
				);
			}, this );

			domainUnavailableSuggestion = (
				<DomainTransferSuggestion
					onButtonClick={ this.goToUseYourDomainStep }
					tracksButtonClickSource="initial-suggestions-bottom"
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
			</div>
		);
	}

	renderExampleSuggestions() {
		return (
			<ExampleDomainSuggestions
				onClickExampleSuggestion={ this.handleClickExampleSuggestion }
				url={ this.getUseYourDomainUrl() }
				path={ this.props.path }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				products={ this.props.products }
			/>
		);
	}

	renderSearchResults() {
		const {
			exactMatchDomain,
			lastDomainIsTransferrable,
			lastDomainSearched,
			lastDomainStatus,
		} = this.state;

		const matchesSearchedDomain = suggestion => suggestion.domain_name === exactMatchDomain;
		const availableDomain =
			lastDomainStatus === domainAvailability.AVAILABLE &&
			find( this.state.searchResults, matchesSearchedDomain );
		const onAddMapping = domain => this.props.onAddMapping( domain, this.state );

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

		return (
			<DomainSearchResults
				key="domain-search-results" // key is required for CSS transition of content/
				availableDomain={ availableDomain }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				lastDomainSearched={ lastDomainSearched }
				lastDomainStatus={ lastDomainStatus }
				lastDomainIsTransferrable={ lastDomainIsTransferrable }
				onAddMapping={ onAddMapping }
				onClickResult={ this.props.onAddDomain }
				onClickMapping={ this.goToMapDomainStep }
				onAddTransfer={ this.props.onAddTransfer }
				onClickTransfer={ this.goToTransferDomainStep }
				onClickUseYourDomain={ this.goToUseYourDomainStep }
				tracksButtonClickSource="exact-match-top"
				suggestions={ suggestions }
				isLoadingSuggestions={ this.state.loadingResults }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerUnavailableOption={ this.props.offerUnavailableOption }
				placeholderQuantity={ PAGE_SIZE }
				isSignupStep={ this.props.isSignupStep }
				railcarSeed={ this.state.railcarSeed }
				fetchAlgo={ `${ this.props.vendor }/v1` }
				cart={ this.props.cart }
			>
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

	goToMapDomainStep = event => {
		event.preventDefault();

		this.props.recordMapDomainButtonClick( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	goToTransferDomainStep = event => {
		event.preventDefault();

		const source = event.currentTarget.dataset.tracksButtonClickSource;

		this.props.recordTransferDomainButtonClick( this.props.analyticsSection, source );

		page( this.getTransferDomainUrl() );
	};

	goToUseYourDomainStep = event => {
		event.preventDefault();

		this.props.recordUseYourDomainButtonClick( this.props.analyticsSection );

		page( this.getUseYourDomainUrl() );
	};

	showValidationErrorMessage( domain, error, errorData ) {
		const { DOTBLOG_SUBDOMAIN, TRANSFERRABLE } = domainAvailability;
		if (
			( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) ||
			( this.props.isSignupStep && DOTBLOG_SUBDOMAIN === error )
		) {
			return;
		}
		this.setState( { showNotice: true, error, errorData } );
	}
}

export default connect(
	( state, props ) => {
		const queryObject = getQueryObject( props );
		return {
			currentUser: getCurrentUser( state ),
			defaultSuggestions: getDomainsSuggestions( state, queryObject ),
			defaultSuggestionsError: getDomainsSuggestionsError( state, queryObject ),
		};
	},
	{
		recordDomainAvailabilityReceive,
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
)( localize( RegisterDomainStep ) );
