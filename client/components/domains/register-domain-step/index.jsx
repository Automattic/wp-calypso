/**
 * External dependencies
 */
import React from 'react';
import async from 'async';
import extend from 'lodash/extend';
import flatten from 'lodash/flatten';
import reject from 'lodash/reject';
import find from 'lodash/find';
import uniqBy from 'lodash/uniqBy';
import times from 'lodash/times';
import compact from 'lodash/compact';
import noop from 'lodash/noop';
import startsWith from 'lodash/startsWith';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Notice from 'components/notice';
import { getFixedDomainSearch, canRegister } from 'lib/domains';
import SearchCard from 'components/search-card';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainSearchResults from 'components/domains/domain-search-results';
import ExampleDomainSuggestions from 'components/domains/example-domain-suggestions';
import analyticsMixin from 'lib/mixins/analytics';
import * as upgradesActions from 'lib/upgrades/actions';
import { isPlan } from 'lib/products-values';
import cartItems from 'lib/cart-values/cart-items';
import { abtest } from 'lib/abtest';

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const SUGGESTION_QUANTITY = 10,
	INITIAL_SUGGESTION_QUANTITY = 2;

const analytics = analyticsMixin( 'registerDomain' ),
	domainsWithPlansOnlyTestEnabled = abtest( 'domainsWithPlansOnly' ) === 'plansOnly';

let searchQueue = [],
	searchStackTimer = null;

function processSearchQueue() {
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
			reportSearch( queue[ i ] );
		}
}

function reportSearch( { query, section } ) {
	analytics.recordEvent( 'searchFormSubmit', query, section );
}

function enqueueSearch( search ) {
	searchQueue.push( search );
	if ( searchStackTimer ) {
		window.clearTimeout( searchStackTimer );
	}
	searchStackTimer = window.setTimeout( processSearchQueue, 10000 );
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
		withPlansOnly: React.PropTypes.bool
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

	componentWillUnmount() {
		// Don't wait for the timeout if the user is navigating away
		processSearchQueue();
	},

	focusSearchCard: function() {
		this.refs.searchCard.focus();
	},

	isLoadingSuggestions: function() {
		return this.state.defaultSuggestions === null;
	},

	fetchDefaultSuggestions: function() {
		if ( ! this.props.selectedSite || ! this.props.selectedSite.domain ) {
			return;
		}

		const initialQuery = this.props.selectedSite.domain.split( '.' )[ 0 ];
		const query = {
			query: initialQuery,
			quantity: SUGGESTION_QUANTITY,
			vendor: abtest( 'domainSuggestionVendor' )
		};

		domains.suggestions( query ).then( suggestions => {
			if ( ! this.isMounted() ) {
				return;
			}
			this.props.onDomainsAvailabilityChange( true );
			suggestions = suggestions.map( function( suggestion ) {
				return extend( suggestion, { isVisible: true } );
			} );
			this.setState( { defaultSuggestions: suggestions } );
		} ).catch( error => {
			if ( error && error.statusCode === 503 ) {
				return this.props.onDomainsAvailabilityChange( false );
			} else if ( error ) {
				throw error;
			}
		} );
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
			return (
				<ExampleDomainSuggestions
					onClickExampleSuggestion={ this.handleClickExampleSuggestion }
					mapDomainUrl={ this.getMapDomainUrl() }
					path={ this.props.path }
					products={ this.props.products } />
			);
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
					delayTimeout={ 1000 }
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

		enqueueSearch( { query: searchQuery, section: this.props.analyticsSection } );

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
						if ( error && error.code !== 'domain_registration_unavailable' ) {
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
					const query = {
						query: domain,
						quantity: SUGGESTION_QUANTITY,
						include_wordpressdotcom: this.props.includeWordPressDotCom,
						vendor: abtest( 'domainSuggestionVendor' )
					};

					domains.suggestions( query ).then( domainSuggestions => {
						this.props.onDomainsAvailabilityChange( true );
						callback( null, domainSuggestions );
					} ).catch( error => {
						if ( error && error.statusCode === 503 ) {
							return this.props.onDomainsAvailabilityChange( false );
						} else if ( error && error.error ) {
							error.code = error.error;
							this.showValidationErrorMessage( domain, error );
						}
						callback( error, null );
					} );
				}
			],
			( error, result ) => {
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
						buttonLabel={ this.props.buttonLabel }
						onButtonClick={ this.addRemoveDomainToCart.bind( null, suggestion ) } />
				);
			}, this );

			domainMappingSuggestion = (
				<DomainMappingSuggestion
					onButtonClick={ this.goToMapDomainStep }
					buttonLabel={ domainsWithPlansOnlyTestEnabled &&
						! ( this.props.selectedSite && isPlan( this.props.selectedSite.plan ) ) &&
						! cartItems.isNextDomainFree( this.props.cart ) && this.translate( 'Upgrade' ) }
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
			onAddMapping;

		if ( this.props.onAddMapping ) {
			onAddMapping = ( domain ) => {
				return this.props.onAddMapping( domain, this.state );
			};
		}

		if ( suggestions.length === 0 && ! this.state.loadingResults ) {
			// the search returned no results

			if ( this.props.showExampleSuggestions ) {
				return (
					<ExampleDomainSuggestions
						mapDomainUrl={ this.getMapDomainUrl() }
						path={ this.props.path }
						products={ this.props.products } />
				);
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
				mappingSuggestionLabel={ domainsWithPlansOnlyTestEnabled &&
						! ( this.props.selectedSite && isPlan( this.props.selectedSite.plan ) ) &&
						! cartItems.isNextDomainFree( this.props.cart ) && this.translate( 'Upgrade' ) }
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
			mapDomainUrl = `${this.props.basePath}/mapping`;
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

	addRemoveDomainToCart: function( suggestion, event ) {
		event.preventDefault();

		this.recordEvent( 'addDomainButtonClick', suggestion.domain_name, this.props.analyticsSection );

		if ( this.props.onAddDomain ) {
			return this.props.onAddDomain( suggestion, this.state );
		}

		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			upgradesActions.addItem( cartItems.domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug
			} ) );

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
