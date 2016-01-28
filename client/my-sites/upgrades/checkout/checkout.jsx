/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	Dispatcher = require( 'dispatcher' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	clearPurchases = require( 'lib/upgrades/actions/purchases' ).clearPurchases,
	DomainDetailsForm = require( './domain-details-form' ),
	hasDomainDetails = require( 'lib/store-transactions' ).hasDomainDetails,
	observe = require( 'lib/mixins/data-observe' ),
	clearSitePlans = require( 'state/sites/plans/actions' ).clearSitePlans,
	purchasePaths = require( 'me/purchases/paths' ),
	SecurePaymentForm = require( './secure-payment-form' ),
	getExitCheckoutUrl = require( 'lib/checkout' ).getExitCheckoutUrl,
	upgradesActions = require( 'lib/upgrades/actions' );

const Checkout = React.createClass( {
	mixins: [ observe( 'sites', 'cards', 'productsList' ) ],

	getInitialState: function() {
		return { previousCart: null };
	},

	componentWillMount: function() {
		upgradesActions.resetTransaction();
	},

	componentDidMount: function() {
		if ( this.redirectIfEmptyCart() ) {
			return;
		}

		if ( this.props.cart.hasLoadedFromServer ) {
			this.trackPageView();

			if ( this.props.planName ) {
				this.addPlanToCart();
			}
		}

		window.scrollTo( 0, 0 );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.cart.hasLoadedFromServer && nextProps.cart.hasLoadedFromServer ) {
			// if the cart hadn't loaded when this mounted, record the page view when it loads
			this.trackPageView( nextProps );

			if ( this.props.planName ) {
				this.addPlanToCart();
			}
		}
	},

	componentDidUpdate: function() {
		var previousCart, nextCart;
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return false;
		}

		previousCart = this.state.previousCart;
		nextCart = this.props.cart;

		if ( ! isEqual( previousCart, nextCart ) ) {
			this.redirectIfEmptyCart();
			this.setState( { previousCart: nextCart } );
		}
	},

	trackPageView: function( props ) {
		props = props || this.props;

		analytics.tracks.recordEvent( 'calypso_checkout_page_view', {
			saved_cards: props.cards.get().length,
			is_renewal: cartItems.hasRenewalItem( props.cart )
		} );
	},

	addPlanToCart: function() {
		var planSlug = this.props.plans.getSlugFromPath( this.props.planName ),
			planItem = cartItems.getItemForPlan( { product_slug: planSlug }, { isFreeTrial: false } );

		upgradesActions.addItem( planItem );
	},

	redirectIfEmptyCart: function() {
		var redirectTo = '/plans/',
			renewalItem;

		if ( ! this.state.previousCart && this.props.planName ) {
			// the plan hasn't been added to the cart yet
			return false;
		}

		if ( ! this.props.cart.hasLoadedFromServer || ! isEmpty( cartItems.getAll( this.props.cart ) ) ) {
			return false;
		}

		if ( this.props.transaction.step.name === 'submitting-wpcom-request' ) {
			return false;
		}

		if ( this.state.previousCart ) {
			redirectTo = getExitCheckoutUrl( this.state.previousCart, this.props.sites.getSelectedSite().slug );
		}

		page.redirect( redirectTo );

		return true;
	},

	getCheckoutCompleteRedirectPath: function() {
		var renewalItem;

		if ( cartItems.hasRenewalItem( this.props.cart ) ) {
			clearPurchases();

			renewalItem = cartItems.getRenewalItems( this.props.cart )[ 0 ];

			return purchasePaths.managePurchaseDestination( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId, 'thank-you' );
		} else if ( cartItems.hasFreeTrial( this.props.cart ) ) {
			this.props.clearSitePlans( this.props.sites.getSelectedSite().ID );

			Dispatcher.handleViewAction( {
				type: 'FETCH_SITES'
			} );

			return `/plans/${ this.props.sites.getSelectedSite().slug }/thank-you`;
		} else if ( cartItems.hasOnlyJetpackPlans( this.props.cart ) ) {
			return '/plugins/setup/' + this.props.sites.getSelectedSite().slug;
		}

		return '/checkout/thank-you';
	},

	content: function() {
		var selectedSite = this.props.sites.getSelectedSite();

		if ( ! this.isLoading() && this.needsDomainDetails() ) {
			return (
				<DomainDetailsForm
					cart={ this.props.cart }
					productsList={ this.props.productsList } />
			);
		} else if ( this.isLoading() || this.props.cart.hasPendingServerUpdates ) {
			// hasPendingServerUpdates is an important check here as the content we display is dependent on the content of the cart

			return (
				<SecurePaymentForm.Placeholder />
			);
		}

		return (
			<SecurePaymentForm
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				cards={ this.props.cards }
				products={ this.props.productsList.get() }
				selectedSite={ selectedSite }
				redirectTo={ this.getCheckoutCompleteRedirectPath } />
		);
	},

	isLoading: function() {
		var isLoadingCart = ! this.props.cart.hasLoadedFromServer,
			isLoadingProducts = ! this.props.productsList.hasLoadedFromServer();

		return isLoadingCart || isLoadingProducts;
	},

	needsDomainDetails: function() {
		var cart = this.props.cart,
			transaction = this.props.transaction;

		if ( cart && cartItems.hasOnlyRenewalItems( cart ) ) {
			return false;
		}

		return cart && cartItems.hasDomainRegistration( cart ) && ! hasDomainDetails( transaction );
	},

	render: function() {
		return (
			<div className="main main-column" role="main">
				<div className="checkout">
					{ this.content() }
				</div>
			</div>
		);
	}
} );

module.exports = connect(
	undefined,
	function( dispatch ) {
		return {
			clearSitePlans: function( siteId ) {
				dispatch( clearSitePlans( siteId ) );
			}
		};
	}
)( Checkout );
