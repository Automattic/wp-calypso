/**
 * External dependencies
 */
var React = require( 'react' ),
	extend = require( 'lodash/extend' ),
	async = require( 'async' ),
	flatten = require( 'lodash/flatten' ),
	reject = require( 'lodash/reject' ),
	find = require( 'lodash/find' ),
	uniqBy = require( 'lodash/uniqBy' ),
	times = require( 'lodash/times' ),
	compact = require( 'lodash/compact' ),
	noop = require( 'lodash/noop' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented(),
	Notice = require( 'components/notice' ),
	{ getFixedDomainSearch, canRegister } = require( 'lib/domains' ),
	SearchCard = require( 'components/search-card' ),
	DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainMappingSuggestion = require( 'components/domains/domain-mapping-suggestion' ),
	DomainSearchResults = require( 'components/domains/domain-search-results' ),
	ExampleDomainSuggestions = require( 'components/domains/example-domain-suggestions' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	cartItems = require( 'lib/cart-values/cart-items' ),
	abtest = require( 'lib/abtest' ).abtest;

// max amount of domain suggestions we should fetch/display
var SUGGESTION_QUANTITY = 4,
	INITIAL_SUGGESTION_QUANTITY = 2;

var RegisterDomainStep = React.createClass( {
	mixins: [ analyticsMixin( 'registerDomain' ) ],

	propTypes: {
		cart: React.PropTypes.object,
		onDomainsAvailabilityChange: React.PropTypes.func,
		products: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] ),
		basePath: React.PropTypes.string.isRequired,
		suggestion: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			onDomainsAvailabilityChange: noop,
			analyticsSection: 'domains'
		};
	},

	getInitialState: function() {
		const suggestion = this.props.suggestion ? getFixedDomainSearch( this.props.suggestion ) : '';

		return {
			clickedExampleSuggestion: false,
			lastQuery: suggestion,
			searchResults: null,
			defaultSuggestions: null,
			lastDomainSearched: null,
			lastDomainError: null,
			loadingResults: Boolean( suggestion ),
			notice: null
		};
	},

	componentWillMount: function() {
		if ( this.props.selectedSite ) {
			this.fetchDefaultSuggestions();
		}

		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	},

	componentDidMount: function() {
		if ( this.state.lastQuery ) {
			this.onSearch( this.state.lastQuery );
		}
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.selectedSite && this.props.selectedSite.domain !== prevProps.selectedSite.domain ) {
			this.setState( this.getInitialState() );
			this.focusSearchCard();
			this.fetchDefaultSuggestions();
		}
	},

	focusSearchCard: function() {
		this.refs.searchCard.focus();
	},

	isLoadingSuggestions: function() {
		return this.state.defaultSuggestions === null;
	},

	fetchDefaultSuggestions: function() {
		var initialQuery;

		if ( ! this.props.selectedSite || ! this.props.selectedSite.domain ) {
			return;
		}

		initialQuery = this.props.selectedSite.domain.split( '.' )[ 0 ];

		wpcom.fetchDomainSuggestions( initialQuery, { quantity: SUGGESTION_QUANTITY }, function( error, suggestions ) {
			if ( ! this.isMounted() ) {
				return;
			}
			if ( error && error.statusCode === 503 ) {
				return this.props.onDomainsAvailabilityChange( false );
			} else if ( error ) {
				throw error;
			}

			this.props.onDomainsAvailabilityChange( true );

			suggestions = suggestions.map( function( suggestion ) {
				return extend( suggestion, { isVisible: true } );
			} );

			this.setState( { defaultSuggestions: suggestions } );
		}.bind( this ) );
	},

	render: function() {
		return (
			<div className="register-domain-step">
				{ this.searchForm() }
				{ this.notices() }
				{ this.content() }
			</div>
		);
	},

	notices: function() {
		if ( this.state.notice ) {
			return <Notice text={ this.state.notice } status={ 'is-error' } showDismiss={ false } />;
		}
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
			return <ExampleDomainSuggestions
				onClickExampleSuggestion={ this.handleClickExampleSuggestion }
				path={ this.props.path }
				products={ this.props.products } />;
		}

		return this.initialSuggestions();
	},

	searchForm: function() {
		return (
			<div className="register-domain-step__search">
				<SearchCard
					ref="searchCard"
					additionalClasses={ this.state.clickedExampleSuggestion ? 'is-refocused' : undefined }
					initialValue={ this.state.lastQuery }
					onSearch={ this.onSearch }
					onSearchChange={ this.onSearchChange }
					onBlur={ this.save }
					placeholder={ this.translate( 'Enter a domain or keyword', { textOnly: true } ) }
					autoFocus={ true }
					delaySearch={ true }
					delayTimeout={ 2000 }
				/>
			</div>
		);
	},

	save: function() {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
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
		var suggestions = [],
			domain = getFixedDomainSearch( searchQuery );

		this.setState( { lastQuery: searchQuery }, this.save );

		if ( ! domain || ! this.state.loadingResults ) {
			// the search was cleared or the domain contained only spaces
			return;
		}

		this.recordEvent( 'searchFormSubmit', searchQuery, this.props.analyticsSection );

		this.setState( {
			lastDomainSearched: domain,
			searchResults: [],
			lastDomainError: null
		} );

		async.parallel(
			[
				callback => {
					if ( ! domain.match( /.{3,}\..{2,}/ ) || domain.match( /\.wordpress\.com/i ) ) {
						return callback();
					}

					canRegister( domain, ( error, result ) => {
						if ( error && error.code === 'domain_registration_unavailable' ) {
							return this.props.onDomainsAvailabilityChange( false );
						} else if ( error ) {
							this.showValidationErrorMessage( domain, error );
							this.setState( { lastDomainError: error } );
						} else if ( result ) {
							result.domain_name = domain;
						}

						if ( ( error && ( error.code === 'not_available' || error.code === 'not_available_but_mappable' ) ) ||
							! error ) {
							this.setState( { notice: null } );
						}

						this.props.onDomainsAvailabilityChange( true );

						callback( null, result );
					} );
				},
				callback => {
					if ( abtest( 'domainSearchResultsCount' ) === 'moreResults' ) {
						SUGGESTION_QUANTITY = 10;
					}

					const params = {
						quantity: SUGGESTION_QUANTITY,
						includeWordPressDotCom: this.props.includeWordPressDotCom
					};

					wpcom.fetchDomainSuggestions( domain, params, ( error, domainSuggestions ) => {
						if ( error && error.statusCode === 503 ) {
							return this.props.onDomainsAvailabilityChange( false );
						} else if ( error && error.error ) {
							error.code = error.error;
							this.showValidationErrorMessage( domain, error );
						}

						this.props.onDomainsAvailabilityChange( true );

						callback( error, domainSuggestions );
					} );
				}
			], ( error, result ) => {
				if ( ! this.state.loadingResults || domain !== this.state.lastDomainSearched ) {
					// this callback is irrelevant now, a newer search has been made or the results were cleared
					return;
				}

				suggestions = uniqBy( flatten( compact( result ) ), function( suggestion ) {
					return suggestion.domain_name;
				} );

				this.setState( {
					searchResults: suggestions,
					loadingResults: false
				}, this.save );
			}
		);
	},

	initialSuggestions: function() {
		var domainRegistrationSuggestions,
			domainMappingSuggestion,
			suggestions;

		if ( this.isLoadingSuggestions() ) {
			domainRegistrationSuggestions = times( INITIAL_SUGGESTION_QUANTITY + 1, function( n ) {
				return <DomainRegistrationSuggestion key={ 'suggestion-' + n } />;
			} );
		} else {
			// only display two suggestions initially
			suggestions = this.state.defaultSuggestions.slice( 0, INITIAL_SUGGESTION_QUANTITY );

			domainRegistrationSuggestions = suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						onButtonClick={ this.addRemoveDomainToCart.bind( null, suggestion ) } />
				);
			}, this );

			domainMappingSuggestion = (
				<DomainMappingSuggestion
					onButtonClick={ this.goToMapDomainStep }
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
		var lastDomainSearched = this.state.lastDomainSearched,
			isSearchedDomain = function( suggestion ) {
				return suggestion.domain_name === lastDomainSearched;
			},
			suggestions = reject( this.state.searchResults, isSearchedDomain ),
			availableDomain = find( this.state.searchResults, isSearchedDomain ),
			onAddMapping = this.props.onAddMapping ?
				domain => {
					return this.props.onAddMapping( domain, this.state );
				} :
				undefined;

		if ( suggestions.length === 0 && ! this.state.loadingResults ) {
			// the search returned no results

			if ( this.props.showExampleSuggestions ) {
				return <ExampleDomainSuggestions path={ this.props.path } products={ this.props.products } />;
			}

			suggestions = this.state.defaultSuggestions;
		}

		return (
			<DomainSearchResults
				key="domain-search-results" // key is required for CSS transition of content/
				availableDomain={ availableDomain }
				buttonLabel={ this.props.buttonLabel }
				lastDomainSearched={ lastDomainSearched }
				lastDomainError = { this.state.lastDomainError }
				onAddMapping={ onAddMapping }
				onClickResult={ this.addRemoveDomainToCart }
				onClickMapping={ this.goToMapDomainStep }
				suggestions={ suggestions }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				offerMappingOption={ this.props.offerMappingOption }
				placeholderQuantity={ SUGGESTION_QUANTITY }
				cart={ this.props.cart } />
		);
	},

	goToMapDomainStep: function( event ) {
		event.preventDefault();

		this.recordEvent( 'mapDomainButtonClick', this.props.analyticsSection );

		let mapDomainPath = this.props.selectedSite ?
			this.props.basePath + '/mapping/' + this.props.selectedSite.slug :
			this.props.basePath + '/mapping';

		page( mapDomainPath );
	},

	addRemoveDomainToCart: function( suggestion, event ) {
		event.preventDefault();

		this.recordEvent( 'addDomainButtonClick', suggestion.domain_name, this.props.analyticsSection );

		if ( this.props.onAddDomain ) {
			return this.props.onAddDomain( suggestion, this.state );
		}

		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			upgradesActions.addDomainToCart( suggestion );

			if ( abtest( 'multiDomainRegistrationV1' ) === 'popupCart' ) {
				upgradesActions.openCartPopup( { showKeepSearching: true } );
			} else { // keep searching in gapps or singlePurchaseFlow
				upgradesActions.goToDomainCheckout( suggestion );
			}
		} else {
			this.recordEvent( 'removeDomainButtonClick', suggestion.domain_name );
			upgradesActions.removeDomainFromCart( suggestion );
		}
	},

	showValidationErrorMessage: function( domain, error ) {
		var message;

		switch ( error.code ) {
			case 'not_registrable':
				if ( domain.indexOf( '.' ) ) {
					message = this.translate( 'Sorry but %(domain)s cannot be registered on WordPress.com.', {
						args: { domain: domain }
					} );
				}
				break;
			case 'not_available':
			case 'not_available_but_mappable':
				// unavailable domains are displayed in the search results, not as a notice
				break;

			case 'empty_query':
				message = this.translate( 'Please enter a domain name or keyword.' );
				break;

			case 'empty_results':
				message = this.translate( "We couldn't find any available domains for: %(domain)s", {
					args: { domain }
				} );
				break;

			case 'invalid_query':
				message = this.translate( 'Sorry but %(domain)s does not appear to be a valid domain name.', {
					args: { domain: domain }
				} );
				break;

			case 'server_error':
				message = this.translate( 'Sorry but there was a problem processing your request. Please try again in a few minutes.' );
				break;

			default:
				throw new Error( 'Unrecognized error code: ' + error.code );
		}

		if ( message ) {
			this.setState( { notice: message } );
		}
	}
} );

module.exports = RegisterDomainStep;
