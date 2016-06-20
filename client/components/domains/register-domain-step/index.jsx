/**
 * External dependencies
 */
import React from 'react';
import async from 'async';
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
import endsWith from 'lodash/endsWith';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Notice from 'components/notice';
import { getFixedDomainSearch, canRegister } from 'lib/domains';
import SearchCard from 'components/search-card';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSearchResults from 'components/domains/domain-search-results';
import ExampleDomainSuggestions from 'components/domains/example-domain-suggestions';
import analyticsMixin from 'lib/mixins/analytics';
import * as upgradesActions from 'lib/upgrades/actions';
import cartItems from 'lib/cart-values/cart-items';
import { getCurrentUser } from 'state/current-user/selectors';
import { abtest } from 'lib/abtest';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import {
	getDomainsSuggestions,
	getDomainsSuggestionsError
} from 'state/domains/suggestions/selectors';
import support from 'lib/url/support';

const domains = wpcom.domains();

// max amount of domain suggestions we should fetch/display
const SUGGESTION_QUANTITY = 10;
const INITIAL_SUGGESTION_QUANTITY = 2;

const analytics = analyticsMixin( 'registerDomain' ),
	domainsWithPlansOnlyTestEnabled = abtest( 'domainsWithPlansOnly' ) === 'plansOnly',
	searchVendor = abtest( 'domainSuggestionVendor' );

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
		includeSubdomain: props.includeWordPressDotCom
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
		withPlansOnly: React.PropTypes.bool,
		isSignupStep: React.PropTypes.bool
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
			lastDomainSearched: null,
			lastDomainError: null,
			loadingResults: Boolean( suggestion ),
			notice: null
		};
	},

	componentWillReceiveProps( nextProps ) {
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
			this.setState( this.props.initialState );
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
			this.setState( this.getInitialState() );
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
		return (
			<div className="register-domain-step">
				{ this.searchForm() }
				{ this.notices() }
				{ this.content() }
				{ this.queryDomainsSuggestions() }
			</div>
		);
	},

	queryDomainsSuggestions() {
		const queryObject = getQueryObject( this.props );
		if ( ! queryObject ) {
			return null;
		}
		const { query, quantity, vendor, includeSubdomain } = queryObject;
		return (
			<QueryDomainsSuggestions
				query={ query }
				quantity={ quantity }
				vendor={ vendor }
				includeSubdomain={ includeSubdomain }
			/>
		);
	},

	notices: function() {
		if ( this.state.notice ) {
			return <Notice text={ this.state.notice } status={ `is-${ this.state.noticeSeverity }` } showDismiss={ false } />;
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
					dir="ltr"
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
		const domain = getFixedDomainSearch( searchQuery );

		this.setState( { lastQuery: searchQuery }, this.save );

		if ( ! domain || ! this.state.loadingResults ) {
			// the search was cleared or the domain contained only spaces
			return;
		}

		enqueueSearchStatReport( { query: searchQuery, section: this.props.analyticsSection } );

		this.setState( {
			lastDomainSearched: domain,
			searchResults: [],
			lastDomainError: null
		} );

		async.parallel(
			[
				callback => {
					if ( endsWith( domain, '.blog' ) ) {
						let error = { code: 'dotblog_domain' };
						this.showValidationErrorMessage( domain, error );
						return callback();
					}
					if ( ! domain.match( /.{3,}\..{2,}/ ) ) {
						return callback();
					}
					const timestamp = Date.now();
					if ( this.props.isSignupStep && domain.match( /\.wordpress\.com$/ ) ) {
						return callback();
					}

					canRegister( domain, ( error, result ) => {
						const timeDiff = Date.now() - timestamp;
						if ( error ) {
							this.showValidationErrorMessage( domain, error );
							this.setState( { lastDomainError: error } );
						} else {
							this.setState( { notice: null } );
							if ( result ) {
								result.domain_name = domain;
							}
						}

						const analyticsResult = ( error && error.code ) || 'available';
						this.recordEvent( 'domainAvailabilityReceive', domain, analyticsResult, timeDiff, this.props.analyticsSection );

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
				return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
			} );
		} else {
			// only display two suggestions initially
			suggestions = this.props.defaultSuggestions ? this.props.defaultSuggestions.slice( 0, INITIAL_SUGGESTION_QUANTITY ) : [];

			domainRegistrationSuggestions = suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						selectedSite={ this.props.selectedSite }
						withPlansOnly={ domainsWithPlansOnlyTestEnabled }
						onButtonClick={ this.addRemoveDomainToCart.bind( null, suggestion ) } />
				);
			}, this );

			domainMappingSuggestion = (
				<DomainMappingSuggestion
					onButtonClick={ this.goToMapDomainStep }
					selectedSite={ this.props.selectedSite }
					withPlansOnly={ domainsWithPlansOnlyTestEnabled }
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

			suggestions = this.props.defaultSuggestions;
		}

		return (
			<DomainSearchResults
				key="domain-search-results" // key is required for CSS transition of content/
				availableDomain={ availableDomain }
				withPlansOnly={ domainsWithPlansOnlyTestEnabled }
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
		var message,
			severity = 'error';

		switch ( error.code ) {
			case 'dotblog_domain':
				message = this.translate(
					'.blog domains are not available yet. {{a}}Sign up{{/a}} to get updates on the launch.', {
						components: {
							a: <a
								target="_blank"
								href={ `https://dotblog.wordpress.com/
									?email=${ this.props.currentUser && encodeURIComponent( this.props.currentUser.email ) || '' }
									&domain=${ domain }`
									}/>
						}
					}
				);
				severity = 'info';
				break;
			case 'not_registrable':
				if ( domain.indexOf( '.' ) ) {
					message = this.translate( 'Sorry but %(domain)s cannot be registered on WordPress.com.', {
						args: { domain: domain }
					} );
				}
				break;
			case 'not_available':
			case 'not_available_but_mappable':
			case 'domain_registration_unavailable':
				// unavailable domains are displayed in the search results, not as a notice OR
				// domain registrations are closed, in which case it is handled in parent
				message = null;
				break;

			case 'mappable_but_blacklisted_domain':
				if ( domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
					message = this.translate(
						'Due to {{a1}}trademark policy{{/a1}}, we are not able to allow domains containing {{strong}}WordPress{{/strong}} to be registered or mapped here. Please {{a2}}contact support{{/a2}} if you have any questions.',
						{
							components: {
								strong: <strong />,
								a1: <a target="_blank" href="http://wordpressfoundation.org/trademark-policy/"/>,
								a2: <a href={ support.CALYPSO_CONTACT }/>
							}
						}
					);
				} else {
					message = this.translate( 'Domain cannot be mapped to a WordPress.com blog because of blacklisted term.' );
				}
				break;

			case 'mappable_but_forbidden_subdomain':
				message = this.translate( 'Subdomains starting with \'www.\' cannot be mapped to a WordPress.com blog' );
				break;

			case 'mappable_but_mapped_domain':
				message = this.translate( 'This domain is already mapped to a WordPress.com site.' );
				break;

			case 'mappable_but_restricted_domain':
				message = this.translate( 'You cannot map another WordPress.com subdomain - try creating a new site or one of the custom domains below.' );
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
			this.setState( { notice: message, noticeSeverity: severity } );
		}
	}
} );

module.exports = connect( ( state, props ) => {
	const queryObject = getQueryObject( props );
	return {
		currentUser: getCurrentUser( state ),
		defaultSuggestions: getDomainsSuggestions( state, queryObject ),
		defaultSuggestionsError: getDomainsSuggestionsError( state, queryObject )
	};
} )( RegisterDomainStep );
