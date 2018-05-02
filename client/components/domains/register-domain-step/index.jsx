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
	startsWith,
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
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import { checkDomainAvailability, getFixedDomainSearch, getAvailableTlds } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import SearchCard from 'components/search-card';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'components/domains/domain-transfer-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSearchResults from 'components/domains/domain-search-results';
import ExampleDomainSuggestions from 'components/domains/example-domain-suggestions';
import SearchFilters from 'components/domains/search-filters';
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
} from 'components/domains/register-domain-step/utility';
import {
	recordDomainAvailabilityReceive,
	recordMapDomainButtonClick,
	recordSearchFormSubmit,
	recordSearchFormView,
	recordSearchResultsReceive,
	recordTransferDomainButtonClick,
} from 'components/domains/register-domain-step/analytics';
import Spinner from 'components/spinner';

const debug = debugFactory( 'calypso:domains:register-domain-step' );

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const INITIAL_SUGGESTION_QUANTITY = 2;
const PAGE_SIZE = 10;
const MAX_PAGES = 3;
const SUGGESTION_QUANTITY = config.isEnabled( 'domains/kracken-ui/pagination' )
	? PAGE_SIZE * MAX_PAGES
	: PAGE_SIZE;

let searchVendor = 'group_1';
const fetchAlgo = searchVendor + '/v1';

let searchQueue = [];
let searchStackTimer = null;
let lastSearchTimestamp = null;
let searchCount = 0;
let recordSearchFormSubmitWithDispatch;

function getQueryObject( props ) {
	if ( ! props.selectedSite || ! props.selectedSite.domain ) {
		return null;
	}

	return {
		query: props.selectedSite.domain.split( '.' )[ 0 ],
		quantity: SUGGESTION_QUANTITY,
		vendor: searchVendor,
		includeSubdomain: props.includeWordPressDotCom,
		surveyVertical: props.surveyVertical,
	};
}

function processSearchStatQueue() {
	const queue = searchQueue.slice();
	window.clearTimeout( searchStackTimer );
	searchStackTimer = null;
	searchQueue = [];

	outerLoop: for ( let i = 0; i < queue.length; i++ ) {
		for ( let k = i + 1; k < queue.length; k++ ) {
			if ( startsWith( queue[ k ].query, queue[ i ].query ) ) {
				continue outerLoop;
			}
		}
		reportSearchStats( queue[ i ] );
	}
}

function reportSearchStats( { query, section, timestamp } ) {
	let timeDiffFromLastSearchInSeconds = 0;
	if ( lastSearchTimestamp ) {
		timeDiffFromLastSearchInSeconds = Math.floor( ( timestamp - lastSearchTimestamp ) / 1000 );
	}
	lastSearchTimestamp = timestamp;
	searchCount++;
	recordSearchFormSubmitWithDispatch(
		query,
		section,
		timeDiffFromLastSearchInSeconds,
		searchCount,
		searchVendor
	);
}

function enqueueSearchStatReport( search ) {
	searchQueue.push( Object.assign( {}, search, { timestamp: Date.now() } ) );
	if ( searchStackTimer ) {
		window.clearTimeout( searchStackTimer );
	}
	searchStackTimer = window.setTimeout( processSearchStatQueue, 10000 );
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
	};

	static defaultProps = {
		onDomainsAvailabilityChange: noop,
		analyticsSection: 'domains',
		onSave: noop,
		onAddMapping: noop,
		onAddDomain: noop,
	};

	constructor( props ) {
		super( props );

		this.state = this.getState();

		recordSearchFormSubmitWithDispatch = this.props.recordSearchFormSubmit;
	}

	getState() {
		const suggestion = this.props.suggestion ? getFixedDomainSearch( this.props.suggestion ) : '';
		const loadingResults = Boolean( suggestion );

		return {
			availableTlds: [],
			clickedExampleSuggestion: false,
			filters: this.getInitialFiltersState(),
			lastFilters: this.getInitialFiltersState(),
			lastQuery: suggestion,
			lastDomainSearched: null,
			lastDomainStatus: null,
			lastDomainIsTransferrable: false,
			loadingResults,
			loadingSubdomainResults: this.props.includeWordPressDotCom && loadingResults,
			notice: null,
			pageNumber: 1,
			searchResults: null,
			subdomainSearchResults: null,
		};
	}

	getInitialFiltersState() {
		return {
			includeDashes: false,
			maxCharacters: '',
			showExactMatchesOnly: false,
			tlds: [],
		};
	}

	getNewRailcarSeed() {
		// Generate a 7 character random hash on base16. E.g. ac618a3
		return Math.floor( ( 1 + Math.random() ) * 0x10000000 )
			.toString( 16 )
			.substring( 1 );
	}

	componentWillReceiveProps( nextProps ) {
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
			return nextProps.onDomainsAvailabilityChange( false );
		}

		if ( error && error.error ) {
			// don't modify global state
			const queryObject = getQueryObject( nextProps );
			if ( queryObject ) {
				this.showValidationErrorMessage( queryObject.query, error.error );
			}
		}
	}

	componentWillMount() {
		searchCount = 0; // reset the counter

		if ( this.props.initialState ) {
			const state = { ...this.props.initialState, railcarSeed: this.getNewRailcarSeed() };

			if ( state.lastSurveyVertical && state.lastSurveyVertical !== this.props.surveyVertical ) {
				state.loadingResults = true;

				if ( this.props.includeWordPressDotCom ) {
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

		this.getAvailableTlds();

		this._isMounted = false;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidMount() {
		if ( this.state.lastQuery ) {
			this.onSearch( this.state.lastQuery );
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

	render() {
		const queryObject = getQueryObject( this.props );

		return (
			<div className="register-domain-step">
				<div className="register-domain-step__search">
					<SearchCard
						ref={ this.bindSearchCardReference }
						additionalClasses={ this.state.clickedExampleSuggestion ? 'is-refocused' : undefined }
						initialValue={ this.state.lastQuery }
						onSearch={ this.onSearch }
						onSearchChange={ this.onSearchChange }
						onBlur={ this.save }
						placeholder={ this.props.translate( 'Enter a name or keyword' ) }
						autoFocus={ true }
						describedBy={ 'step-header' }
						delaySearch={ true }
						delayTimeout={ 1000 }
						dir="ltr"
						maxLength={ 60 }
					/>
				</div>
				{ this.renderSearchFilters() }
				{ this.state.notice && (
					<Notice
						text={ this.state.notice }
						status={ `is-${ this.state.noticeSeverity }` }
						showDismiss={ false }
					/>
				) }
				{ this.renderContent() }
				{ this.renderPaginationControls() }
				{ queryObject && <QueryDomainsSuggestions { ...queryObject } /> }
				<QueryContactDetailsCache />
			</div>
		);
	}

	renderSearchFilters() {
		const isKrackenUi = config.isEnabled( 'domains/kracken-ui/filters' );
		const isRenderingInitialSuggestions =
			! Array.isArray( this.state.searchResults ) &&
			! this.state.loadingResults &&
			! this.props.showExampleSuggestions;
		return (
			isKrackenUi &&
			! isRenderingInitialSuggestions && (
				<div className="register-domain-step__filter">
					<SearchFilters
						availableTlds={ this.state.availableTlds }
						filters={ this.state.filters }
						onChange={ this.onFiltersChange }
						onFiltersReset={ this.onFiltersReset }
						onFiltersSubmit={ this.onFiltersSubmit }
					/>
				</div>
			)
		);
	}

	renderTldButtons() {
		const isKrackenUi = config.isEnabled( 'domains/kracken-ui/filters' );
		const { availableTlds, lastFilters: { tlds: selectedTlds } } = this.state;
		return (
			isKrackenUi && (
				<CompactCard className="register-domain-step__tld-buttons">
					{ availableTlds.slice( 0, 8 ).map( tld => (
						<Button
							className={ classNames( { 'is-active': includes( selectedTlds, tld ) } ) }
							data-selected={ includes( selectedTlds, tld ) }
							key={ tld }
							onClick={ this.toggleTldInFilter }
							value={ tld }
						>
							.{ tld }
						</Button>
					) ) }
				</CompactCard>
			)
		);
	}

	renderPaginationControls() {
		const isKrackenUi = config.isEnabled( 'domains/kracken-ui/pagination' );
		if ( ! isKrackenUi ) {
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
			exactMatchDomain: null,
			lastDomainSearched: null,
			loadingResults,
			loadingSubdomainResults: loadingResults,
			notice: null,
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

		this.setState(
			{
				filters: {
					...this.state.filters,
					tlds: [ ...tlds ],
				},
			},
			() => {
				this.save();
				this.repeatSearch( { pageNumber: 1 } );
			}
		);
	};

	onFiltersChange = newFilters => {
		this.setState( {
			filters: newFilters,
		} );
	};

	onFiltersReset = ( ...keysToReset ) => {
		this.setState(
			{
				filters: {
					...this.state.filters,
					...pick( this.getInitialFiltersState(), keysToReset ),
				},
			},
			() => {
				this.repeatSearch();
			}
		);
	};

	onFiltersSubmit = () => {
		this.repeatSearch( { pageNumber: 1 } );
	};

	onSearchChange = ( searchQuery, callback = noop ) => {
		if ( ! this._isMounted ) {
			return;
		}

		const loadingResults = Boolean( getFixedDomainSearch( searchQuery ) );

		this.setState(
			{
				exactMatchDomain: null,
				lastQuery: searchQuery,
				lastDomainSearched: null,
				loadingResults,
				loadingSubdomainResults: loadingResults,
				notice: null,
				pageNumber: 1,
				searchResults: null,
				subdomainSearchResults: null,
			},
			callback
		);
	};

	getAvailableTlds = () => {
		getAvailableTlds().then( availableTlds => {
			this.setState( { availableTlds } );
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
			return;
		}

		return new Promise( resolve => {
			checkDomainAvailability(
				{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
				( error, result ) => {
					const timeDiff = Date.now() - timestamp;
					const status = get( result, 'status', error );
					const domainChecked = get( result, 'domain_name', domain );

					const { AVAILABLE, TRANSFERRABLE, UNKNOWN } = domainAvailability;
					const isDomainAvailable = includes( [ AVAILABLE, UNKNOWN ], status );
					const isDomainTransferrable = TRANSFERRABLE === status;

					this.setState( {
						exactMatchDomain: domainChecked,
						lastDomainStatus: status,
						lastDomainIsTransferrable: isDomainTransferrable,
					} );
					if ( isDomainAvailable ) {
						this.setState( { notice: null } );
					} else {
						this.showValidationErrorMessage(
							domain,
							status,
							get( result, 'other_site_domain', null )
						);
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
			vendor: searchVendor,
			vertical: this.props.surveyVertical,
			...this.getActiveFiltersForAPI(),
		};
		this.setState( { lastFilters: this.state.filters } );

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

				if ( error && error.statusCode === 503 ) {
					this.props.onDomainsAvailabilityChange( false );
				} else if ( error && error.error ) {
					this.showValidationErrorMessage( domain, error.error );
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
		const suggestions = [ ...suggestionMap.values() ];

		const strippedDomainBase = getStrippedDomainBase( domain );
		const exactMatchBeforeTld = suggestion =>
			suggestion.domain_name === this.state.exactMatchDomain ||
			startsWith( suggestion.domain_name, `${ strippedDomainBase }.` );
		const bestAlternative = suggestion =>
			! exactMatchBeforeTld( suggestion ) && suggestion.isRecommended !== true;

		const availableSuggestions = reject( suggestions, isUnknownSuggestion );

		const recommendedSuggestion = find( availableSuggestions, exactMatchBeforeTld );

		if ( recommendedSuggestion ) {
			recommendedSuggestion.isRecommended = true;
		} else if ( availableSuggestions.length > 0 ) {
			availableSuggestions[ 0 ].isRecommended = true;
		}

		const bestAlternativeSuggestion = find( availableSuggestions, bestAlternative );
		if ( bestAlternativeSuggestion ) {
			bestAlternativeSuggestion.isBestAlternative = true;
		} else if ( availableSuggestions.length > 1 ) {
			availableSuggestions[ 1 ].isBestAlternative = true;
		}

		this.setState(
			{
				searchResults: suggestions,
				loadingResults: false,
			},
			this.save
		);
	};

	getSubdomainSuggestions = ( domain, timestamp ) => {
		const includeWordPressDotCom =
			this.props.surveyVertical && this.props.includeDotBlogSubdomain ? false : true;
		const subdomainQuery = {
			query: domain,
			quantity: 1,
			include_wordpressdotcom: includeWordPressDotCom,
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
		const domain = getFixedDomainSearch( searchQuery );

		this.setState(
			{ lastQuery: searchQuery, lastSurveyVertical: this.props.surveyVertical },
			this.save
		);

		if ( domain === '' ) {
			debug( 'onSearch handler was terminated by an empty domain input' );
			return;
		}

		enqueueSearchStatReport( { query: searchQuery, section: this.props.analyticsSection } );

		this.setState( {
			lastDomainSearched: domain,
			railcarSeed: this.getNewRailcarSeed(),
		} );

		const timestamp = Date.now();

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
		debug( 'showNextPage was triggered' );

		this.setState( { pageNumber: this.state.pageNumber + 1 }, this.save );
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
					onButtonClick={ this.goToTransferDomainStep }
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
				url={ this.getTransferDomainUrl() }
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
			pageNumber,
		} = this.state;

		const matchesSearchedDomain = suggestion => suggestion.domain_name === exactMatchDomain;
		const availableDomain =
			lastDomainStatus === domainAvailability.AVAILABLE &&
			find( this.state.searchResults, matchesSearchedDomain );
		const onAddMapping = domain => this.props.onAddMapping( domain, this.state );

		const searchResults = this.state.searchResults || [];

		const isKrackenUi = config.isEnabled( 'domains/kracken-ui/pagination' );

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

		if ( suggestions.length === 0 && ! this.state.loadingResults ) {
			// the search returned no results
			if ( this.props.showExampleSuggestions ) {
				return this.renderExampleSuggestions();
			}

			suggestions = this.props.defaultSuggestions || [];
		}

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
				tracksButtonClickSource="exact-match-top"
				suggestions={ suggestions }
				isLoadingSuggestions={ this.state.loadingResults }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerUnavailableOption={ this.props.offerUnavailableOption }
				placeholderQuantity={ PAGE_SIZE }
				isSignupStep={ this.props.isSignupStep }
				railcarSeed={ this.state.railcarSeed }
				fetchAlgo={ fetchAlgo }
				cart={ this.props.cart }
			>
				{ this.renderTldButtons() }
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

	showValidationErrorMessage( domain, error, site ) {
		const { TRANSFERRABLE } = domainAvailability;
		if ( TRANSFERRABLE === error && this.state.lastDomainIsTransferrable ) {
			return;
		}

		if ( ! site ) {
			site = get( this.props, 'selectedSite.slug', null );
		}

		const { message, severity } = getAvailabilityNotice( domain, error, site );
		this.setState( { notice: message, noticeSeverity: severity } );
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
		recordMapDomainButtonClick,
		recordSearchFormSubmit,
		recordSearchFormView,
		recordSearchResultsReceive,
		recordTransferDomainButtonClick,
	}
)( localize( RegisterDomainStep ) );
