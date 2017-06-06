/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { flatten, find, isEmpty, isEqual, reduce } from 'lodash';
import i18n, { localize } from 'i18n-calypso';
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
	noAdsItem = require( 'lib/cart-values/cart-items' ).noAdsItem,
	fetchReceiptCompleted = require( 'state/receipts/actions' ).fetchReceiptCompleted,
	getExitCheckoutUrl = require( 'lib/checkout' ).getExitCheckoutUrl,
	hasDomainDetails = require( 'lib/store-transactions' ).hasDomainDetails,
	notices = require( 'notices' ),
	observe = require( 'lib/mixins/data-observe' ),
	purchasePaths = require( 'me/purchases/paths' ),
	QueryStoredCards = require( 'components/data/query-stored-cards' ),
	QueryGeo = require( 'components/data/query-geo' ),
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
import { requestSite } from 'state/sites/actions';
import {
	isDomainOnlySite,
	getCurrentUserPaymentMethods
} from 'state/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'state/ui/selectors';
import { getDomainNameFromReceiptOrCart } from 'lib/domains/utils';
import { fetchSitesAndUser } from 'lib/signup/step-actions';
import { loadTrackingTool } from 'state/analytics/actions';

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

		if ( this.props.cart.hasLoadedFromServer ) {
			this.trackPageView();
		}

		if ( this.props.cart.hasLoadedFromServer && this.props.product ) {
			this.addProductToCart();
		}

		window.scrollTo( 0, 0 );
		this.props.loadTrackingTool( 'HotJar' );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.cart.hasLoadedFromServer && nextProps.cart.hasLoadedFromServer && this.props.product ) {
			this.addProductToCart();
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
		const { product, productsList, purchaseId, selectedSiteSlug } = this.props;
		const meta = product.split( ':' )[ 1 ];
		const productSlug = getUpgradePlanSlugFromPath( product ) || product.split( ':' )[ 0 ];

		let cartItem = getCartItemForPlan( productSlug );

		if ( 'theme' === productSlug ) {
			cartItem = themeItem( meta );
		} else if ( 'domain-mapping' === productSlug ) {
			cartItem = domainMapping( { domain: meta } );
		} else if ( 'no-ads' === productSlug ) {
			cartItem = noAdsItem();
		} else if ( meta ) {
			cartItem = Object.assign( { meta }, productsList.data[ productSlug ] );
		}

		if ( cartItem && purchaseId ) {
			cartItem = cartItems.getRenewalItemFromCartItem( cartItem, {
				id: purchaseId,
				domain: selectedSiteSlug
			} );
		}

		if ( cartItem ) {
			upgradesActions.addItem( cartItem );
		}
	},

	redirectIfEmptyCart: function() {
		const { selectedSiteSlug, transaction } = this.props;
		let redirectTo = '/plans/';

		if ( ! this.state.previousCart && this.props.product ) {
			// the plan hasn't been added to the cart yet
			return false;
		}

		if ( ! this.props.cart.hasLoadedFromServer || ! isEmpty( cartItems.getAll( this.props.cart ) ) ) {
			return false;
		}

		if ( transactionStepTypes.SUBMITTING_WPCOM_REQUEST === transaction.step.name ) {
			return false;
		}

		if ( transactionStepTypes.RECEIVED_WPCOM_RESPONSE === transaction.step.name && isEmpty( transaction.errors ) ) {
			// If the cart is emptied by the server after the transaction is
			// complete without errors, do not redirect as we're waiting for
			// some post-transaction requests to complete.
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
		let renewalItem;
		const {
			cart,
			selectedSiteSlug,
			transaction: {
				step: {
					data: receipt
				}
			}
		} = this.props;

		// The `:receiptId` string is filled in by our callback page after the PayPal checkout
		const receiptId = receipt ? receipt.receipt_id : ':receiptId';

		if ( cartItems.hasRenewalItem( cart ) ) {
			renewalItem = cartItems.getRenewalItems( cart )[ 0 ];

			return purchasePaths.managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
		} else if ( cartItems.hasFreeTrial( cart ) ) {
			return selectedSiteSlug
				? `/plans/${ selectedSiteSlug }/thank-you`
				: '/checkout/thank-you/plans';
		} else if ( cart.create_new_blog ) {
			return `/checkout/thank-you/no-site/${ receiptId }`;
		}

		if ( ! selectedSiteSlug ) {
			return '/checkout/thank-you/features';
		}

		return this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/thank-you/features/${ this.props.selectedFeature }/${ selectedSiteSlug }/${ receiptId }`
			: `/checkout/thank-you/${ selectedSiteSlug }/${ receiptId }`;
	},

	handleCheckoutCompleteRedirect: function() {
		let product,
			purchasedProducts,
			renewalItem;

		const {
			cart,
			isDomainOnly,
			reduxStore,
			selectedSiteId,
			transaction: {
				step: {
					data: receipt
				}
			},
			translate
		} = this.props;
		const redirectPath = this.getCheckoutCompleteRedirectPath();

		this.props.clearPurchases();

		if ( cartItems.hasRenewalItem( cart ) ) {
			// checkouts for renewals redirect back to `/purchases` with a notice

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
					translate( '%(productName)s has been renewed and will now auto renew in the future. ' +
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
					translate( 'Success! You renewed %(productName)s for %(duration)s, until %(date)s. ' +
						'We sent your receipt to %(email)s.', {
							args: {
								productName: renewalItem.product_name,
								duration: i18n.moment.duration( { days: renewalItem.bill_period } ).humanize(),
								date: i18n.moment( product.expiry ).format( 'MMM DD, YYYY' ),
								email: product.user_email
							}
						}
					),
					{ persistent: true }
				);
			}
		} else if ( cartItems.hasFreeTrial( cart ) ) {
			this.props.clearSitePlans( selectedSiteId );
		}

		if ( receipt && receipt.receipt_id ) {
			const receiptId = receipt.receipt_id;

			this.props.fetchReceiptCompleted( receiptId, {
				...receipt,
				purchases: this.flattenPurchases( this.props.transaction.step.data.purchases ),
				failedPurchases: this.flattenPurchases( this.props.transaction.step.data.failed_purchases )
			} );
		}

		if ( selectedSiteId ) {
			this.props.requestSite( selectedSiteId );
		}

		if (
			( cart.create_new_blog && receipt && isEmpty( receipt.failed_purchases ) ) ||
			( isDomainOnly && cartItems.hasPlan( cart ) && ! selectedSiteId )
		) {
			notices.info(
				translate( 'Almost done…' )
			);

			const domainName = getDomainNameFromReceiptOrCart( receipt, cart );

			if ( domainName ) {
				fetchSitesAndUser(
					domainName,
					() => {
						page( redirectPath );
					},
					reduxStore
				);

				return;
			}
		}

		page( redirectPath );
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
				paymentMethods={ this.props.paymentMethods }
				products={ this.props.productsList.get() }
				selectedSite={ selectedSite }
				redirectTo={ this.getCheckoutCompleteRedirectPath }
				handleCheckoutCompleteRedirect={ this.handleCheckoutCompleteRedirect }
			/>
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

		return cart &&
			! hasDomainDetails( transaction ) &&
			( cartItems.hasDomainRegistration( cart ) || cartItems.hasGoogleApps( cart ) );
	},

	render: function() {
		return (
			<div className="main main-column" role="main">
				<div className="checkout">
					<QueryStoredCards />
					<QueryGeo />

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
			paymentMethods: getCurrentUserPaymentMethods( state ),
			isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		recordApplePayStatus,
		requestSite,
		loadTrackingTool
	}
)( localize( Checkout ) );
