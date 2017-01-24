/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { flatten, find, isEmpty, isEqual, reduce, startsWith } from 'lodash';
import i18n from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
const analytics = require( 'lib/analytics' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	clearSitePlans = require( 'state/sites/plans/actions' ).clearSitePlans,
	clearPurchases = require( 'state/purchases/actions' ).clearPurchases,
	DomainDetailsForm = require( './domain-details-form' ),
	domainMapping = require( 'lib/cart-values/cart-items' ).domainMapping,
	fetchReceiptCompleted = require( 'state/receipts/actions' ).fetchReceiptCompleted,
	getExitCheckoutUrl = require( 'lib/checkout' ).getExitCheckoutUrl,
	hasDomainDetails = require( 'lib/store-transactions' ).hasDomainDetails,
	notices = require( 'notices' ),
	observe = require( 'lib/mixins/data-observe' ),
	purchasePaths = require( 'me/purchases/paths' ),
	QueryStoredCards = require( 'components/data/query-stored-cards' ),
	SecurePaymentForm = require( './secure-payment-form' ),
	SecurePaymentFormPlaceholder = require( './secure-payment-form-placeholder' ),
	supportPaths = require( 'lib/url/support' ),
	themeItem = require( 'lib/cart-values/cart-items' ).themeItem,
	transactionStepTypes = require( 'lib/store-transactions/step-types' ),
	upgradesActions = require( 'lib/upgrades/actions' );
import { getStoredCards } from 'state/stored-cards/selectors';

import {
	isValidFeatureKey,
	getUpgradePlanSlugFromPath
} from 'lib/plans';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import { recordViewCheckout } from 'lib/analytics/ad-tracking';
import { recordApplePayStatus } from 'lib/apple-pay';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'state/ui/selectors';
import {
	getSiteOption
} from 'state/sites/selectors';
import { domainManagementList } from 'my-sites/upgrades/paths';

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

		this.props.recordApplePayStatus();
	},

	componentDidMount: function() {
		if ( this.redirectIfEmptyCart() ) {
			return;
		}

		if ( this.props.cart.hasLoadedFromServer && this.props.product ) {
			this.addProductToCart();
		}

		window.scrollTo( 0, 0 );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.cart.hasLoadedFromServer && nextProps.cart.hasLoadedFromServer && this.props.product ) {
			this.addProductToCart();
		}

		// Note that `hasPendingServerUpdates` will go from `null` to `false` on NUX checkout
		// and from `true` to `false` on post-NUX checkout
		if ( this.props.cart.hasPendingServerUpdates !== false && nextProps.cart.hasPendingServerUpdates === false ) {
			this.trackPageView( nextProps );
		}
	},

	componentDidUpdate: function() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return false;
		}

		const previousCart = this.state.previousCart,
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

		recordViewCheckout( props.cart );
	},

	addProductToCart: function() {
		const planSlug = getUpgradePlanSlugFromPath( this.props.product );

		let cartItem,
			cartMeta;

		if ( planSlug ) {
			cartItem = getCartItemForPlan( planSlug );
		}

		if ( startsWith( this.props.product, 'theme' ) ) {
			cartMeta = this.props.product.split( ':' )[ 1 ];
			cartItem = themeItem( cartMeta );
		}

		if ( startsWith( this.props.product, 'domain-mapping' ) ) {
			cartMeta = this.props.product.split( ':' )[ 1 ];
			cartItem = domainMapping( { domain: cartMeta } );
		}

		if ( cartItem ) {
			upgradesActions.addItem( cartItem );
		}
	},

	redirectIfEmptyCart: function() {
		const { selectedSiteSlug } = this.props;
		let redirectTo = '/plans/';

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
			redirectTo = getExitCheckoutUrl( this.state.previousCart, selectedSiteSlug );
		}

		page.redirect( redirectTo );

		return true;
	},

	/**
	 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
	 * so we need to flatten them to get a list of purchases
	 *
	 * @param {Object} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
	 * @returns {Array} of product objects [ { productId: ... }, ... ]
	 */
	flattenPurchases: function( purchases ) {
		return flatten( Object.values( purchases ) );
	},

	getCheckoutCompleteRedirectPath: function() {
		let product,
			purchasedProducts,
			renewalItem,
			receiptId = ':receiptId';

		const {
			cart,
			isDomainOnly,
			selectedSite,
			selectedSiteId,
			selectedSiteSlug
		} = this.props;
		const receipt = this.props.transaction.step.data;

		this.props.clearPurchases();

		if ( cartItems.hasRenewalItem( cart ) ) {
			renewalItem = cartItems.getRenewalItems( cart )[ 0 ];
			// group all purchases into an array
			purchasedProducts = reduce( receipt && receipt.purchases || {}, function( result, value ) {
				return result.concat( value );
			}, [] );
			// and take the first product which matches the product id of the renewalItem
			product = find( purchasedProducts, function( item ) {
				return item.product_id === renewalItem.product_id;
			} );

			if ( product && product.will_auto_renew ) {
				notices.success(
					this.translate( '%(productName)s has been renewed and will now auto renew in the future. ' +
						'{{a}}Learn more{{/a}}', {
							args: {
								productName: renewalItem.product_name
							},
							components: {
								a: <a href={ supportPaths.AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
							}
						}
					),
					{ persistent: true }
				);
			} else if ( product ) {
				notices.success(
					this.translate( 'Success! You renewed %(productName)s for %(duration)s, until %(date)s. ' +
						'We sent your receipt to %(email)s.', {
							args: {
								productName: renewalItem.product_name,
								duration: i18n.moment.duration( renewalItem.bill_period, 'days' ).humanize(),
								date: i18n.moment( product.expiry ).format( 'MMM DD, YYYY' ),
								email: product.user_email
							}
						}
					),
					{ persistent: true }
				);
			}

			return purchasePaths.managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
		} else if ( cartItems.hasFreeTrial( cart ) ) {
			this.props.clearSitePlans( selectedSiteId );

			return selectedSiteSlug
				? `/plans/${ selectedSiteSlug }/thank-you`
				: '/checkout/thank-you/plans';
		} else if ( isDomainOnly && cartItems.hasDomainRegistration( cart ) && ! cartItems.hasPlan( cart ) ) {
			// TODO: Use purchased domain name once it is possible to set it as a primary domain when site is created.
			return domainManagementList( selectedSite.slug );
		}

		if ( receipt && receipt.receipt_id ) {
			receiptId = receipt.receipt_id;

			this.props.fetchReceiptCompleted( receiptId, {
				receiptId: receiptId,
				purchases: this.flattenPurchases( this.props.transaction.step.data.purchases ),
				failedPurchases: this.flattenPurchases( this.props.transaction.step.data.failed_purchases ),
			} );
		}

		if ( ! selectedSiteSlug ) {
			return '/checkout/thank-you/features';
		}

		return this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/thank-you/features/${ this.props.selectedFeature }/${ selectedSiteSlug }/${ receiptId }`
			: `/checkout/thank-you/${ selectedSiteSlug }/${ receiptId }`;
	},

	content: function() {
		const { selectedSite } = this.props;

		if ( ! this.isLoading() && this.needsDomainDetails() ) {
			return (
				<DomainDetailsForm
					cart={ this.props.cart }
					productsList={ this.props.productsList } />
			);
		} else if ( this.isLoading() || this.props.cart.hasPendingServerUpdates ) {
			// hasPendingServerUpdates is an important check here as the content we display is dependent on the content of the cart

			return (
				<SecurePaymentFormPlaceholder />
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
		const isLoadingCart = ! this.props.cart.hasLoadedFromServer,
			isLoadingProducts = ! this.props.productsList.hasLoadedFromServer();

		return isLoadingCart || isLoadingProducts;
	},

	needsDomainDetails: function() {
		const cart = this.props.cart,
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
	state => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			cards: getStoredCards( state ),
			isDomainOnly: getSiteOption( state, selectedSiteId, 'is_domain_only' ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		recordApplePayStatus
	}
)( Checkout );
