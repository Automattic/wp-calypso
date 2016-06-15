/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	page = require( 'page' ),
	React = require( 'react' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	EmptyContent = require( 'components/empty-content' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	FreeTrialNotice = require( './free-trial-notice' ),
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite,
	{ currentUserHasFlag } = require( 'state/current-user/selectors' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	RegisterDomainStep = require( 'components/domains/register-domain-step' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	Main = require( 'components/main' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	cartItems = require( 'lib/cart-values/cart-items' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans;

var DomainSearch = React.createClass( {
	mixins: [ observe( 'productsList', 'sites' ), analyticsMixin( 'registerDomain' ) ],

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		basePath: React.PropTypes.string.isRequired,
		context: React.PropTypes.object.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return { domainRegistrationAvailable: true };
	},

	componentWillMount: function() {
		this.checkSiteIsUpgradeable();
	},

	componentDidMount: function() {
		this.props.sites.on( 'change', this.checkSiteIsUpgradeable );
		this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );

		this.previousSelectedSite = this.props.sites.getSelectedSite();
	},

	componentWillReceiveProps: function() {
		var selectedSite = this.props.sites.getSelectedSite();
		if ( this.previousSelectedSite !== selectedSite ) {
			this.props.fetchSitePlans( this.props.sitePlans, selectedSite );
			this.previousSelectedSite = selectedSite;
		}
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this.checkSiteIsUpgradeable );
	},

	checkSiteIsUpgradeable: function() {
		var selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite && ! selectedSite.isUpgradeable() ) {
			page.redirect( '/domains/add' );
		}
	},

	handleDomainsAvailabilityChange: function( isAvailable ) {
		this.setState( { domainRegistrationAvailable: isAvailable } );
	},

	handleAddDomain: function( suggestion ) {
		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.recordEvent( 'addDomainButtonClick', suggestion.domain_name, 'domains' );

			if ( cartItems.shouldBundleDomainWithPlan( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) ) {
				const domain = cartItems.domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug
				} );
				const items = cartItems.bundleItemWithPlan( domain );
				upgradesActions.addItems( items );
			} else {
				upgradesActions.addDomainToCart( suggestion );
			}
			upgradesActions.goToDomainCheckout( suggestion );
		} else {
			this.recordEvent( 'removeDomainButtonClick', suggestion.domain_name );
			upgradesActions.removeDomainFromCart( suggestion );
		}
	},

	render: function() {
		var selectedSite = this.props.sites.getSelectedSite(),
			classes = classnames( 'main-column', {
				'domain-search-page-wrapper': this.state.domainRegistrationAvailable
			} ),
			content;

		if ( ! this.state.domainRegistrationAvailable ) {
			content = (
				<EmptyContent
					illustration="/calypso/images/drake/drake-500.svg"
					title={ this.translate( 'Domain registration is unavailable' ) }
					line={ this.translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ this.translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSite.slug } />
			);
		} else {
			content = (
				<span>
					<FreeTrialNotice
						cart={ this.props.cart }
						sitePlans={ this.props.sitePlans }
						selectedSite={ selectedSite } />

					<div className="domain-search__content">
						<UpgradesNavigation
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite }
							sitePlans={ this.props.sitePlans } />

						<RegisterDomainStep
							path={ this.props.context.path }
							suggestion={ this.props.context.params.suggestion }
							domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
							onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
							onAddDomain={ this.handleAddDomain }
							cart={ this.props.cart }
							selectedSite={ selectedSite }
							offerMappingOption
							basePath={ this.props.basePath }
							products={ this.props.productsList.get() } />
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
} );

module.exports = connect(
	function( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() ),
			domainsWithPlansOnly: currentUserHasFlag( state, 'calypso_domains_with_plans_only' )
		};
	},
	function( dispatch ) {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( DomainSearch );
