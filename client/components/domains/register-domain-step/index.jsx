/**
 * External dependencies
 */
import React from 'react';
import async from 'async';
import {
	compact,
	find,
	flatten,
	includes,
	noop,
	reject,
	startsWith,
	times,
	uniqBy
} from 'lodash';
import page from 'page';
import qs from 'qs';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Notice from 'components/notice';
import { checkDomainAvailability, getFixedDomainSearch } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import SearchCard from 'components/search-card';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSearchResults from 'components/domains/domain-search-results';
import ExampleDomainSuggestions from 'components/domains/example-domain-suggestions';
import analyticsMixin from 'lib/mixins/analytics';
import { getCurrentUser } from 'state/current-user/selectors';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError
} from 'state/domains/suggestions/selectors';

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const SUGGESTION_QUANTITY = 10;
const INITIAL_SUGGESTION_QUANTITY = 2;

const analytics = analyticsMixin( 'registerDomain' ),
	searchVendor = 'domainsbot';

let searchQueue = [],
	searchStackTimer = null,
	lastSearchTimestamp = null,
	searchCount = 0;

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

	outerLoop:
		for ( let i = 0; i < queue.length; i++ ) {
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
	analytics.recordEvent( 'searchFormSubmit', query, section, timeDiffFromLastSearchInSeconds, searchCount, searchVendor );
}

function enqueueSearchStatReport( search ) {
	searchQueue.push( Object.assign( {}, search, { timestamp: Date.now() } ) );
	if ( searchStackTimer ) {
		window.clearTimeout( searchStackTimer );
	}
	searchStackTimer = window.setTimeout( processSearchStatQueue, 10000 );
}

const RegisterDomainStep = React.createClass( {
	mixins: [ analytics ],

	propTypes: {
		cart: React.PropTypes.object,
		onDomainsAvailabilityChange: React.PropTypes.func,
		products: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] ),
		basePath: React.PropTypes.string.isRequired,
		suggestion: React.PropTypes.string,
		domainsWithPlansOnly: React.PropTypes.bool,
		isSignupStep: React.PropTypes.bool,
		surveyVertical: React.PropTypes.string,
		includeWordPressDotCom: React.PropTypes.bool,
		includeDotBlogSubdomain: React.PropTypes.bool,
		showExampleSuggestions: React.PropTypes.bool,
		onSave: React.PropTypes.func,
		onAddMapping: React.PropTypes.func,
		onAddDomain: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			onDomainsAvailabilityChange: noop,
			analyticsSection: 'domains',
			onSave: noop,
			onAddMapping: noop,
			onAddDomain: noop
		};
	},

	getInitialState: function() {
		const suggestion = this.props.suggestion ? getFixedDomainSearch( this.props.suggestion ) : '';

		return {
			clickedExampleSuggestion: false,
			lastQuery: suggestion,
			lastDomainSearched: null,
			lastDomainStatus: null,
			loadingResults: Boolean( suggestion ),
			notice: null,
			searchResults: null
		};
	},

	componentWillReceiveProps( nextProps ) {
		// Reset state on site change
		if ( nextProps.selectedSite && nextProps.selectedSite.slug !== ( this.props.selectedSite || {} ).slug ) {
			this.setState( this.getInitialState() );
		}

		if ( this.props.defaultSuggestionsError === nextProps.defaultSuggestionsError ||
			( ! this.props.defaultSuggestionsError && ! nextProps.defaultSuggestionsError ) ) {
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
			const domainError = new Error();
			domainError.code = error.error;
			const queryObject = getQueryObject( nextProps );
			if ( queryObject ) {
				this.showValidationErrorMessage( queryObject.query, domainError );
			}
		}
	},

	componentWillMount: function() {
		searchCount = 0; // reset the counter
		lastSearchTimestamp = null; // reset timer

		if ( this.props.initialState ) {
			const state = { ...this.props.initialState };

			if ( state.lastSurveyVertical &&
				( state.lastSurveyVertical !== this.props.surveyVertical ) ) {
				state.loadingResults = true;
				delete state.lastSurveyVertical;
			}

			this.setState( state );
		}
	},

	componentDidMount: function() {
		if ( this.state.lastQuery ) {
			this.onSearch( this.state.lastQuery );
		}
		this.recordEvent( 'searchFormView', this.props.analyticsSection );
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.selectedSite && this.props.selectedSite.domain !== prevProps.selectedSite.domain ) {
			this.focusSearchCard();
		}
	},

	componentWillUnmount() {
		// Don't wait for the timeout if the user is navigating away
		processSearchStatQueue();
	},

	focusSearchCard: function() {
		this.refs.searchCard.focus();
	},

	isLoadingSuggestions: function() {
		return ! this.props.defaultSuggestions && ! this.props.defaultSuggestionsError;
	},

	render: function() {
		const queryObject = getQueryObject( this.props );
		return (
			<div className="register-domain-step">
					<div className="register-domain-step__search">
						<SearchCard
							ref="searchCard"
							additionalClasses={ this.state.clickedExampleSuggestion ? 'is-refocused' : undefined }
							initialValue={ this.state.lastQuery }
							onSearch={ this.onSearch }
							onSearchChange={ this.onSearchChange }
							onBlur={ this.save }
							placeholder={ this.props.translate( 'Enter a name or keyword' ) }
							autoFocus={ true }
							delaySearch={ true }
							delayTimeout={ 1000 }
							dir="ltr"
							maxLength={ 60 }
						/>
					</div>
				{
					this.state.notice &&
					<Notice text={ this.state.notice } status={ `is-${ this.state.noticeSeverity }` } showDismiss={ false } />
				}
				{ this.content() }
				{ queryObject && <QueryDomainsSuggestions { ...queryObject } /> }
			</div>
		);
	},

	handleClickExampleSuggestion: function() {
		this.focusSearchCard();

		this.setState( { clickedExampleSuggestion: true } );
	},

	content: function() {
		if ( Array.isArray( this.state.searchResults ) || this.state.loadingResults ) {
			return this.allSearchResults();
		}

		if ( this.props.showExampleSuggestions ) {
			return (
				<ExampleDomainSuggestions
					onClickExampleSuggestion={ this.handleClickExampleSuggestion }
					mapDomainUrl={ this.getMapDomainUrl() }
					path={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					products={ this.props.products } />
			);
		}

		return this.initialSuggestions();
	},

	save: function() {
		this.props.onSave( this.state );
	},

	onSearchChange: function( searchQuery ) {
		this.setState( {
			lastQuery: searchQuery,
			lastDomainSearched: null,
			loadingResults: Boolean( getFixedDomainSearch( searchQuery ) ),
			notice: null,
			searchResults: null
		} );
	},

	onSearch: function( searchQuery ) {
		const domain = getFixedDomainSearch( searchQuery );

		this.setState( { lastQuery: searchQuery, lastSurveyVertical: this.props.surveyVertical }, this.save );

		if ( ! domain || ! this.state.loadingResults ) {
			// the search was cleared or the domain contained only spaces
			return;
		}

		enqueueSearchStatReport( { query: searchQuery, section: this.props.analyticsSection } );

		this.setState( {
			lastDomainSearched: domain,
			searchResults: []
		} );

		async.parallel(
			[
				callback => {
					if ( ! domain.match( /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/i ) ) {
						return callback();
					}
					const timestamp = Date.now();
					if ( this.props.isSignupStep && domain.match( /\.wordpress\.com$/ ) ) {
						return callback();
					}

					checkDomainAvailability( domain, ( error, result ) => {
						const timeDiff = Date.now() - timestamp,
							status = result && result.status ? result.status : error,
							{ AVAILABLE, UNKNOWN } = domainAvailability,
							isDomainAvailable = includes( [ AVAILABLE, UNKNOWN ], status );

						this.setState( { lastDomainStatus: status } );
						if ( isDomainAvailable ) {
							this.setState( { notice: null } );
						} else {
							this.showValidationErrorMessage( domain, status );
						}

						this.recordEvent( 'domainAvailabilityReceive', domain, status, timeDiff, this.props.analyticsSection );

						this.props.onDomainsAvailabilityChange( true );
						callback( null, isDomainAvailable ? result : null );
					} );
				},
				callback => {
					const query = {
							query: domain,
							quantity: SUGGESTION_QUANTITY,
							include_wordpressdotcom: this.props.includeWordPressDotCom,
							include_dotblogsubdomain: this.props.includeDotBlogSubdomain,
							vendor: searchVendor,
							vertical: this.props.surveyVertical,
						},
						timestamp = Date.now();

					domains.suggestions( query ).then( domainSuggestions => {
						this.props.onDomainsAvailabilityChange( true );
						const timeDiff = Date.now() - timestamp,
							analyticsResults = domainSuggestions.map( suggestion => suggestion.domain_name );

						this.recordEvent( 'searchResultsReceive', domain, analyticsResults, timeDiff, domainSuggestions.length,
							this.props.analyticsSection );

						callback( null, domainSuggestions );
					} ).catch( error => {
						const timeDiff = Date.now() - timestamp;
						if ( error && error.statusCode === 503 ) {
							this.props.onDomainsAvailabilityChange( false );
						} else if ( error && error.error ) {
							error.code = error.error;
							this.showValidationErrorMessage( domain, error );
						}

						const analyticsResults = [ error.code || error.error || 'ERROR' + ( error.statusCode || '' ) ];
						this.recordEvent( 'searchResultsReceive', domain, analyticsResults, timeDiff, -1, this.props.analyticsSection );
						callback( error, null );
					} );
				}
			],
			( error, result ) => {
				if ( ! this.state.loadingResults || domain !== this.state.lastDomainSearched || ! this.isMounted() ) {
					// this callback is irrelevant now, a newer search has been made or the results were cleared OR
					// domain registration was not available and component is unmounted
					return;
				}

				const suggestions = uniqBy( flatten( compact( result ) ), function( suggestion ) {
					return suggestion.domain_name;
				} );

				const isFreeOrUnknown = ( suggestion ) => (
						suggestion.is_free === true ||
						suggestion.status === domainAvailability.UNKNOWN
					),
					strippedDomainBase = this.getStrippedDomainBase( domain ),
					exactMatchBeforeTld = ( suggestion ) => (
						startsWith( suggestion.domain_name, `${ strippedDomainBase }.` )
					),
					bestAlternative = ( suggestion ) => (
						! exactMatchBeforeTld( suggestion ) &&
						suggestion.isRecommended !== true
					),
					availableSuggestions = reject( suggestions, isFreeOrUnknown );

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

				this.setState( {
					searchResults: suggestions,
					loadingResults: false
				}, this.save );
			}
		);
	},

	getStrippedDomainBase( domain ) {
		let strippedDomainBase = domain;
		const lastIndexOfDot = strippedDomainBase.lastIndexOf( '.' );

		if ( lastIndexOfDot !== -1 ) {
			strippedDomainBase = strippedDomainBase.substring( 0, lastIndexOfDot );
		}
		return strippedDomainBase.replace( /[ .]/g, '' );
	},

	initialSuggestions: function() {
		let domainRegistrationSuggestions,
			domainMappingSuggestion,
			suggestions;

		if ( this.isLoadingSuggestions() ) {
			domainRegistrationSuggestions = times( INITIAL_SUGGESTION_QUANTITY + 1, function( n ) {
				return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
			} );
		} else {
			// only display two suggestions initially
			suggestions = ( this.props.defaultSuggestions || [] ).slice( 0, INITIAL_SUGGESTION_QUANTITY );

			domainRegistrationSuggestions = suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						onButtonClick={ this.props.onAddDomain.bind( null, suggestion ) } />
				);
			}, this );

			domainMappingSuggestion = (
				<DomainMappingSuggestion
					onButtonClick={ this.goToMapDomainStep }
					selectedSite={ this.props.selectedSite }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					cart={ this.props.cart }
					products={ this.props.products } />
				);
		}

		return (
			<div key="initial-suggestions" // Key is required for CSS transition of content.
					className="register-domain-step__domain-suggestions">
				{ domainRegistrationSuggestions }
				{ domainMappingSuggestion }
			</div>
		);
	},

	allSearchResults: function() {
		const { lastDomainSearched, lastDomainStatus } = this.state,
			matchesSearchedDomain = ( suggestion ) => ( suggestion.domain_name === lastDomainSearched ),
			availableDomain = lastDomainStatus === domainAvailability.AVAILABLE && find( this.state.searchResults, matchesSearchedDomain ),
			onAddMapping = ( domain ) => this.props.onAddMapping( domain, this.state );

		let suggestions = reject( this.state.searchResults, matchesSearchedDomain );

		if ( suggestions.length === 0 && ! this.state.loadingResults ) {
			// the search returned no results

			if ( this.props.showExampleSuggestions ) {
				return (
					<ExampleDomainSuggestions
						mapDomainUrl={ this.getMapDomainUrl() }
						path={ this.props.path }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						products={ this.props.products } />
				);
			}

			suggestions = this.props.defaultSuggestions;
		}

		return (
			<DomainSearchResults
				key="domain-search-results" // key is required for CSS transition of content/
				availableDomain={ availableDomain }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				lastDomainSearched={ lastDomainSearched }
				lastDomainStatus = { lastDomainStatus }
				onAddMapping={ onAddMapping }
				onClickResult={ this.props.onAddDomain }
				onClickMapping={ this.goToMapDomainStep }
				suggestions={ suggestions }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerMappingOption={ this.props.offerMappingOption }
				placeholderQuantity={ SUGGESTION_QUANTITY }
				cart={ this.props.cart } />
		);
	},

	getMapDomainUrl: function() {
		let mapDomainUrl;

		if ( this.props.mapDomainUrl ) {
			mapDomainUrl = this.props.mapDomainUrl;
		} else {
			const query = qs.stringify( { initialQuery: this.state.lastQuery.trim() } );
			mapDomainUrl = `${ this.props.basePath }/mapping`;
			if ( this.props.selectedSite ) {
				mapDomainUrl += `/${ this.props.selectedSite.slug }?${ query }`;
			}
		}

		return mapDomainUrl;
	},

	goToMapDomainStep: function( event ) {
		event.preventDefault();

		this.recordEvent( 'mapDomainButtonClick', this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	},

	showValidationErrorMessage: function( domain, error ) {
		const { message, severity } = getAvailabilityNotice( domain, error );
		this.setState( { notice: message, noticeSeverity: severity } );
	}
} );

module.exports = connect( ( state, props ) => {
	const queryObject = getQueryObject( props );
	return {
		currentUser: getCurrentUser( state ),
		defaultSuggestions: getDomainsSuggestions( state, queryObject ),
		defaultSuggestionsError: getDomainsSuggestionsError( state, queryObject )
	};
} )( localize( RegisterDomainStep ) );
