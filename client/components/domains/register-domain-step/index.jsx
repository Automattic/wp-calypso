/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import async from 'async';
import {
	compact,
	find,
	flatten,
	get,
	includes,
	isEmpty,
	mapKeys,
	noop,
	pickBy,
	reject,
	snakeCase,
	startsWith,
	times,
	uniqBy,
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
import Notice from 'components/notice';
import { checkDomainAvailability, getFixedDomainSearch } from 'lib/domains';
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
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { abtest } from 'lib/abtest';

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const SUGGESTION_QUANTITY = 10;
const INITIAL_SUGGESTION_QUANTITY = 2;

let searchVendor = 'domainsbot';
const fetchAlgo = searchVendor + '/v1';

let searchQueue = [];
let searchStackTimer = null;
let lastSearchTimestamp = null;
let searchCount = 0;
let recordSearchFormSubmitWithDispatch;

function isNumberString( string ) {
	return /^[0-9_]+$/.test( string );
}

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
		onDomainSearchChange: PropTypes.func,
	};

	static defaultProps = {
		onDomainsAvailabilityChange: noop,
		analyticsSection: 'domains',
		onSave: noop,
		onAddMapping: noop,
		onAddDomain: noop,
		onDomainSearchChange: noop,
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
			clickedExampleSuggestion: false,
			filters: this.getInitialFiltersState(),
			lastQuery: suggestion,
			lastDomainSearched: null,
			lastDomainStatus: null,
			lastDomainIsTransferrable: false,
			loadingResults: loadingResults,
			loadingSubdomainResults: this.props.includeWordPressDotCom && loadingResults,
			notice: null,
			searchResults: null,
			subdomainSearchResults: null,
		};
	}

	getInitialFiltersState() {
		return {
			excludeDashes: true,
			maxCharacters: '',
			showExactMatchesOnly: false,
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
			//don't modify global state
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
		const isKrackenUI = config.isEnabled( 'domains/kracken-ui' );

		return (
			<div className={ `register-domain-step ${ isKrackenUI ? 'is-kracken-ui' : '' }` }>
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
						describedBy={ 'formatted-header' }
						delaySearch={ true }
						delayTimeout={ 1000 }
						dir="ltr"
						maxLength={ 60 }
					/>
				</div>
				{ isKrackenUI && (
					<div className="register-domain-step__filter">
						<SearchFilters
							filters={ this.state.filters }
							onChange={ this.onFiltersChange }
							onFiltersReset={ this.onFiltersReset }
							onFiltersSubmit={ this.repeatSearch }
						/>
					</div>
				) }
				{ this.state.notice && (
					<Notice
						text={ this.state.notice }
						status={ `is-${ this.state.noticeSeverity }` }
						showDismiss={ false }
					/>
				) }
				{ this.content() }
				{ queryObject && <QueryDomainsSuggestions { ...queryObject } /> }
				<QueryContactDetailsCache />
			</div>
		);
	}

	handleClickExampleSuggestion = () => {
		this.focusSearchCard();

		this.setState( { clickedExampleSuggestion: true } );
	};

	content() {
		if ( Array.isArray( this.state.searchResults ) || this.state.loadingResults ) {
			return this.allSearchResults();
		}

		if ( this.props.showExampleSuggestions ) {
			return this.getExampleSuggestions();
		}

		return this.initialSuggestions();
	}

	save = () => {
		this.props.onSave( this.state );
	};

	repeatSearch = () => {
		this.onSearchChange( this.state.lastQuery, () => this.onSearch( this.state.lastQuery ) );
	};

	getSetFiltersForAPI() {
		const { filters } = this.state;
		return {
			...mapKeys(
				pickBy( filters, value => isNumberString( value ) || typeof value === 'boolean' ),
				( value, key ) => snakeCase( key )
			),
		};
	}

	onFiltersChange = newFilters => {
		this.setState( {
			filters: newFilters,
		} );
	};

	onFiltersReset = () => {
		this.setState(
			{
				filters: this.getInitialFiltersState(),
			},
			this.repeatSearch
		);
	};

	onSearchChange = ( searchQuery, callback = noop ) => {
		if ( ! this._isMounted ) {
			return;
		}

		const loadingResults = Boolean( getFixedDomainSearch( searchQuery ) );

		this.props.onDomainSearchChange( searchQuery );

		this.setState(
			{
				exactMatchDomain: null,
				lastQuery: searchQuery,
				lastDomainSearched: null,
				loadingResults: loadingResults,
				loadingSubdomainResults: loadingResults,
				notice: null,
				searchResults: null,
				subdomainSearchResults: null,
			},
			callback
		);
	};

	getTldWeightOverrides() {
		const { designType } = this.props;

		return designType && designType === 'blog' ? 'design_type_blog' : null;
	}

	checkDomainAvailability = ( domain, timestamp ) => callback => {
		if (
			! domain.match(
				/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/i
			)
		) {
			this.setState( { lastDomainStatus: null, lastDomainIsTransferrable: false } );
			return callback();
		}
		if ( this.props.isSignupStep && domain.match( /\.wordpress\.com$/ ) ) {
			return callback();
		}

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
				callback( null, isDomainAvailable ? result : null );
			}
		);
	};

	getDomainsSuggestions = ( domain, timestamp ) => callback => {
		const suggestionQuantity =
			this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain
				? SUGGESTION_QUANTITY - 1
				: SUGGESTION_QUANTITY;

		const query = {
			query: domain,
			quantity: suggestionQuantity,
			include_wordpressdotcom: false,
			include_dotblogsubdomain: false,
			tld_weight_overrides: this.getTldWeightOverrides(),
			vendor: searchVendor,
			vertical: this.props.surveyVertical,
			...this.getSetFiltersForAPI(),
		};

		domains
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

				callback( null, domainSuggestions );
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
				callback( error, null );
			} );
	};

	handleDomainSuggestions = domain => ( error, result ) => {
		if (
			! this.state.loadingResults ||
			domain !== this.state.lastDomainSearched ||
			! this._isMounted
		) {
			// this callback is irrelevant now, a newer search has been made or the results were cleared OR
			// domain registration was not available and component is unmounted
			return;
		}

		const suggestions = uniqBy( flatten( compact( result ) ), function( suggestion ) {
			return suggestion.domain_name;
		} );

		const isFreeOrUnknown = suggestion =>
			suggestion.is_free === true || suggestion.status === domainAvailability.UNKNOWN;
		const strippedDomainBase = this.getStrippedDomainBase( domain );
		const exactMatchBeforeTld = suggestion =>
			suggestion.domain_name === this.state.exactMatchDomain ||
			startsWith( suggestion.domain_name, `${ strippedDomainBase }.` );
		const bestAlternative = suggestion =>
			! exactMatchBeforeTld( suggestion ) && suggestion.isRecommended !== true;
		const availableSuggestions = reject( suggestions, isFreeOrUnknown );

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
			...this.getSetFiltersForAPI(),
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

	onSearch = searchQuery => {
		const domain = getFixedDomainSearch( searchQuery );

		this.setState(
			{ lastQuery: searchQuery, lastSurveyVertical: this.props.surveyVertical },
			this.save
		);

		if ( ! domain || ! this.state.loadingResults ) {
			// the search was cleared or the domain contained only spaces
			return;
		}

		enqueueSearchStatReport( { query: searchQuery, section: this.props.analyticsSection } );

		this.setState( {
			lastDomainSearched: domain,
			searchResults: [],
			subdomainSearchResults: [],
			railcarSeed: this.getNewRailcarSeed(),
		} );

		const timestamp = Date.now();
		const testGroup = abtest( 'domainSuggestionTestV6' );
		if ( includes( [ 'group_1', 'group_2', 'group_3', 'group_4' ], testGroup ) ) {
			searchVendor = testGroup;
		}

		async.parallel(
			[
				this.checkDomainAvailability( domain, timestamp ),
				this.getDomainsSuggestions( domain, timestamp ),
			],
			this.handleDomainSuggestions( domain )
		);

		if ( this.props.includeWordPressDotCom || this.props.includeDotBlogSubdomain ) {
			this.getSubdomainSuggestions( domain, timestamp );
		}
	};

	getStrippedDomainBase( domain ) {
		let strippedDomainBase = domain;
		const lastIndexOfDot = strippedDomainBase.lastIndexOf( '.' );

		if ( lastIndexOfDot !== -1 ) {
			strippedDomainBase = strippedDomainBase.substring( 0, lastIndexOfDot );
		}
		return strippedDomainBase.replace( /[ .]/g, '' );
	}

	initialSuggestions() {
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

	getExampleSuggestions() {
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

	allSearchResults() {
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

		const searchResults = this.state.searchResults || [];
		const testGroup = abtest( 'domainSuggestionTestV6' );
		let suggestions = includes( [ 'group_1', 'group_2', 'group_3', 'group_4' ], testGroup )
			? [ ...searchResults ]
			: reject( searchResults, matchesSearchedDomain );

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
				return this.getExampleSuggestions();
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
				placeholderQuantity={ SUGGESTION_QUANTITY }
				isSignupStep={ this.props.isSignupStep }
				railcarSeed={ this.state.railcarSeed }
				fetchAlgo={ fetchAlgo }
				cart={ this.props.cart }
			/>
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

const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', { section } )
	);

const recordTransferDomainButtonClick = ( section, source ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Use a Domain I own" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_transfer_button_click', { section, source } )
	);

const recordSearchFormSubmit = ( searchBoxValue, section, timeDiffFromLastSearch, count, vendor ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Submitted Search Form',
			'Search Box Value',
			searchBoxValue
		),
		recordTracksEvent( 'calypso_domain_search', {
			search_box_value: searchBoxValue,
			seconds_from_last_search: timeDiffFromLastSearch,
			search_count: count,
			search_vendor: vendor,
			section,
		} )
	);

const recordSearchFormView = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Landed on Search' ),
		recordTracksEvent( 'calypso_domain_search_pageview', { section } )
	);

const recordSearchResultsReceive = (
	searchQuery,
	searchResults,
	responseTimeInMs,
	resultCount,
	section
) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Receive Results', 'Response Time', responseTimeInMs ),
		recordTracksEvent( 'calypso_domain_search_results_suggestions_receive', {
			search_query: searchQuery,
			results: searchResults.join( ';' ),
			response_time_ms: responseTimeInMs,
			result_count: resultCount,
			section,
		} )
	);

const recordDomainAvailabilityReceive = (
	searchQuery,
	availableStatus,
	responseTimeInMs,
	section
) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			'Domain Availability Result',
			'Domain Available Status',
			availableStatus
		),
		recordTracksEvent( 'calypso_domain_search_results_availability_receive', {
			search_query: searchQuery,
			available_status: availableStatus,
			response_time: responseTimeInMs,
			section,
		} )
	);

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
