/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	forEach = require( 'lodash/forEach' ),
	isEmpty = require( 'lodash/isEmpty' ),
	isEqual = require( 'lodash/isEqual' ),
	page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	clearSitePlans = require( 'state/sites/plans/actions' ).clearSitePlans,
	clearPurchases = require( 'state/purchases/actions' ).clearPurchases,
	DomainDetailsForm = require( './domain-details-form' ),
	fetchReceiptCompleted = require( 'state/receipts/actions' ).fetchReceiptCompleted,
	getExitCheckoutUrl = require( 'lib/checkout' ).getExitCheckoutUrl,
	getStoredCards = require( 'state/stored-cards/selectors' ).getStoredCards,
	hasDomainDetails = require( 'lib/store-transactions' ).hasDomainDetails,
	notices = require( 'notices' ),
	observe = require( 'lib/mixins/data-observe' ),
	purchasePaths = require( 'me/purchases/paths' ),
	QueryStoredCards = require( 'components/data/query-stored-cards' ),
	SecurePaymentForm = require( './secure-payment-form' ),
	supportPaths = require( 'lib/url/support' ),
	themeItem = require( 'lib/cart-values/cart-items' ).themeItem,
	transactionStepTypes = require( 'lib/store-transactions/step-types' ),
	upgradesActions = require( 'lib/upgrades/actions' );

import {
	isValidFeatureKey,
	getUpgradePlanSlugFromPath
} from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';

const Checkout = React.createClass( {
	mixins: [ observe( 'sites', 'productsList' ) ],

	propTypes: {
		cards: React.PropTypes.array.isRequired,
		selectedFeature: React.PropTypes.string
	},

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

			if ( this.props.product ) {
				this.addProductToCart();
			}
		}

		window.scrollTo( 0, 0 );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.cart.hasLoadedFromServer && nextProps.cart.hasLoadedFromServer ) {
			// if the cart hadn't loaded when this mounted, record the page view when it loads
			this.trackPageView( nextProps );

			if ( this.props.product ) {
				this.addProductToCart();
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
			saved_cards: props.cards.length,
			is_renewal: cartItems.hasRenewalItem( props.cart )
		} );
	},

	addProductToCart: function() {
		var planSlug = getUpgradePlanSlugFromPath( this.props.product ),
			cartItem,
			cartMeta;

		if ( planSlug ) {
			cartItem = getCartItemForPlan( planSlug );
		}

		if ( this.props.product.indexOf( 'theme' ) === 0 ) {
			cartMeta = this.props.product.split( ':' )[1];
			cartItem = themeItem( cartMeta );
		}

		if ( cartItem ) {
			upgradesActions.addItem( cartItem );
		}
	},

	redirectIfEmptyCart: function() {
		var redirectTo = '/plans/';

		if ( ! this.state.previousCart && this.props.product ) {
			// the plan hasn't been added to the cart yet
			return false;
		}

		if ( ! this.props.cart.hasLoadedFromServer || ! isEmpty( cartItems.getAll( this.props.cart ) ) ) {
			return false;
		}

		if ( this.props.transaction.step.name === transactionStepTypes.SUBMITTING_WPCOM_REQUEST ) {
			return false;
		}

		if ( this.state.previousCart ) {
			redirectTo = getExitCheckoutUrl( this.state.previousCart, this.props.sites.getSelectedSite().slug );
		}

		page.redirect( redirectTo );

		return true;
	},

	getPurchasesFromReceipt: function() {
		var purchases = this.props.transaction.step.data.purchases,
			flatPurchases = [];

		// purchases are of the format { [siteId]: [ { product_id: ... } ] },
		// so we need to flatten them to get a list of purchases
		forEach( purchases, sitePurchases => {
			flatPurchases = flatPurchases.concat( sitePurchases );
		} );

		return flatPurchases;
	},

	getCheckoutCompleteRedirectPath: function() {
		var renewalItem,
			receiptId = ':receiptId';

		this.props.clearPurchases();

		if ( cartItems.hasRenewalItem( this.props.cart ) ) {
			renewalItem = cartItems.getRenewalItems( this.props.cart )[ 0 ];

			notices.success(
				this.translate( '%(productName)s has been renewed and will now auto renew in the future. {{a}}Learn more{{/a}}', {
					args: {
						productName: renewalItem.product_name
					},
					components: {
						a: <a href={ supportPaths.AUTO_RENEWAL } target="_blank" />
					}
				} ),
				{ persistent: true }
			);

			return purchasePaths.managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
		} else if ( cartItems.hasFreeTrial( this.props.cart ) ) {
			this.props.clearSitePlans( this.props.sites.getSelectedSite().ID );

			return `/plans/${ this.props.sites.getSelectedSite().slug }/thank-you`;
		}

		if ( this.props.transaction.step.data && this.props.transaction.step.data.receipt_id ) {
			receiptId = this.props.transaction.step.data.receipt_id;

			this.props.fetchReceiptCompleted( receiptId, {
				receiptId: receiptId,
				purchases: this.getPurchasesFromReceipt()
			} );
		}

		return this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/thank-you/features/${this.props.selectedFeature}/${ this.props.sites.getSelectedSite().slug }/${ receiptId }`
			: `/checkout/thank-you/${ this.props.sites.getSelectedSite().slug }/${ receiptId }`;
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
					<QueryStoredCards />

					{ this.content() }
				</div>
			</div>
		);
	}
} );

module.exports = connect(
	function( state ) {
		return {
			cards: getStoredCards( state )
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted
	}
)( Checkout );
