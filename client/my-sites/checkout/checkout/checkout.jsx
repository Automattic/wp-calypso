/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { flatten, filter, find, get, isEmpty, isEqual, reduce, startsWith } from 'lodash';
import i18n, { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import { clearSitePlans } from 'state/sites/plans/actions';
import { clearPurchases } from 'state/purchases/actions';
import DomainDetailsForm from './domain-details-form';
import {
	domainMapping,
	planItem as getCartItemForPlan,
	themeItem,
} from 'lib/cart-values/cart-items';
import { fetchReceiptCompleted } from 'state/receipts/actions';
import { getExitCheckoutUrl } from 'lib/checkout';
import { hasDomainDetails } from 'lib/store-transactions';
import notices from 'notices';
/* eslint-disable no-restricted-imports */
import observe from 'lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import purchasePaths from 'me/purchases/paths';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryGeo from 'components/data/query-geo';
import SecurePaymentForm from './secure-payment-form';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder';
import { AUTO_RENEWAL } from 'lib/url/support';
import {
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import upgradesActions from 'lib/upgrades/actions';
import {
	getContactDetailsCache,
	getCurrentUserPaymentMethods,
	isDomainOnlySite,
	isEligibleForCheckoutToChecklist,
} from 'state/selectors';
import { getStoredCards } from 'state/stored-cards/selectors';
import { isValidFeatureKey, getUpgradePlanSlugFromPath } from 'lib/plans';
import { recordViewCheckout } from 'lib/analytics/ad-tracking';
import { recordApplePayStatus } from 'lib/apple-pay';
import { requestSite } from 'state/sites/actions';
import { isNewSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { canAddGoogleApps } from 'lib/domains';
import { getDomainNameFromReceiptOrCart } from 'lib/domains/utils';
import { fetchSitesAndUser } from 'lib/signup/step-actions';
import { loadTrackingTool } from 'state/analytics/actions';

const Checkout = createReactClass( {
	displayName: 'Checkout',
	mixins: [ observe( 'sites', 'productsList' ) ],

	propTypes: {
		cards: PropTypes.array.isRequired,
		couponCode: PropTypes.string,
		selectedFeature: PropTypes.string,
	},

	getInitialState: function() {
		return {
			previousCart: null,
		};
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
		if (
			! this.props.cart.hasLoadedFromServer &&
			nextProps.cart.hasLoadedFromServer &&
			this.props.product
		) {
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

		// Although this is a part of the gsuiteUpsellTake2 A/B test,
		// the `abtest()` is not called here to make the data more accurate.
		if (
			this.props.isNewlyCreatedSite &&
			this.props.contactDetails &&
			cartItems.hasGoogleApps( this.props.cart ) &&
			this.needsDomainDetails()
		) {
			this.setDomainDetailsForGsuiteCart();
		}
	},

	setDomainDetailsForGsuiteCart() {
		const { contactDetails, cart } = this.props;
		const domainReceiptId = get(
			cartItems.getGoogleApps( cart ),
			'[0].extra.receipt_for_domain',
			0
		);

		if ( domainReceiptId ) {
			upgradesActions.setDomainDetails( contactDetails );
		}
	},

	trackPageView: function( props ) {
		props = props || this.props;

		analytics.tracks.recordEvent( 'calypso_checkout_page_view', {
			saved_cards: props.cards.length,
			is_renewal: cartItems.hasRenewalItem( props.cart ),
		} );

		recordViewCheckout( props.cart );
	},

	getProductSlugFromSynonym( slug ) {
		if ( 'no-ads' === slug ) {
			return 'no-adverts/no-adverts.php';
		}
		return slug;
	},

	addProductToCart() {
		if ( this.props.purchaseId ) {
			this.addRenewItemToCart();
		} else {
			this.addNewItemToCart();
		}
		if ( this.props.couponCode ) {
			upgradesActions.applyCoupon( this.props.couponCode );
		}
	},

	addRenewItemToCart() {
		const { product, purchaseId, selectedSiteSlug } = this.props;
		const [ slug, meta ] = product.split( ':' );
		const productSlug = this.getProductSlugFromSynonym( slug );

		if ( ! purchaseId ) {
			return;
		}

		const cartItem = cartItems.getRenewalItemFromCartItem(
			{
				meta,
				product_slug: productSlug,
			},
			{
				id: purchaseId,
				domain: selectedSiteSlug,
			}
		);

		upgradesActions.addItem( cartItem );
	},

	addNewItemToCart() {
		const planSlug = getUpgradePlanSlugFromPath( this.props.product, this.props.selectedSite );

		let cartItem, cartMeta;

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
		const { selectedSiteSlug, transaction } = this.props;
		let redirectTo = '/plans/';

		if ( ! this.state.previousCart && this.props.product ) {
			// the plan hasn't been added to the cart yet
			return false;
		}

		if (
			! this.props.cart.hasLoadedFromServer ||
			! isEmpty( cartItems.getAll( this.props.cart ) )
		) {
			return false;
		}

		if ( SUBMITTING_WPCOM_REQUEST === transaction.step.name ) {
			return false;
		}

		if ( RECEIVED_WPCOM_RESPONSE === transaction.step.name && isEmpty( transaction.errors ) ) {
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

	getCheckoutCompleteRedirectPath() {
		let renewalItem;
		const { cart, selectedSiteSlug, transaction: { step: { data: receipt } } } = this.props;
		const domainReceiptId = get(
			cartItems.getGoogleApps( cart ),
			'[0].extra.receipt_for_domain',
			0
		);

		// The `:receiptId` string is filled in by our callback page after the PayPal checkout
		const receiptId = receipt ? receipt.receipt_id : ':receiptId';

		if ( cartItems.hasRenewalItem( cart ) ) {
			renewalItem = cartItems.getRenewalItems( cart )[ 0 ];

			return purchasePaths.managePurchase(
				renewalItem.extra.purchaseDomain,
				renewalItem.extra.purchaseId
			);
		}

		if ( cartItems.hasFreeTrial( cart ) ) {
			return selectedSiteSlug
				? `/plans/${ selectedSiteSlug }/thank-you`
				: '/checkout/thank-you/plans';
		}

		if ( cart.create_new_blog ) {
			return `/checkout/thank-you/no-site/${ receiptId }`;
		}

		if ( ! selectedSiteSlug ) {
			return '/checkout/thank-you/features';
		}

		if (
			this.props.isEligibleForCheckoutToChecklist &&
			'show' === abtest( 'checklistThankYouForPaidUser' )
		) {
			return `/checklist/${ selectedSiteSlug }/paid`;
		}

		if ( domainReceiptId && receiptId && abtest( 'gsuiteUpsellV2' ) === 'modified' ) {
			return `/checkout/thank-you/${ selectedSiteSlug }/${ domainReceiptId }/with-gsuite/${ receiptId }`;
		}

		if (
			this.props.isNewlyCreatedSite &&
			! cartItems.hasGoogleApps( cart ) &&
			cartItems.hasDomainRegistration( cart ) &&
			isEmpty( receipt.failed_purchases )
		) {
			const domainsForGsuite = filter( cartItems.getDomainRegistrations( cart ), ( { meta } ) =>
				canAddGoogleApps( meta )
			);

			if ( domainsForGsuite.length && abtest( 'gsuiteUpsellV2' ) === 'modified' ) {
				return `/checkout/${ selectedSiteSlug }/with-gsuite/${
					domainsForGsuite[ 0 ].meta
				}/${ receiptId }`;
			}
		}

		return this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/thank-you/features/${
					this.props.selectedFeature
				}/${ selectedSiteSlug }/${ receiptId }`
			: `/checkout/thank-you/${ selectedSiteSlug }/${ receiptId }`;
	},

	handleCheckoutCompleteRedirect: function() {
		let product, purchasedProducts, renewalItem;

		const {
			cart,
			isDomainOnly,
			reduxStore,
			selectedSiteId,
			transaction: { step: { data: receipt } },
			translate,
		} = this.props;
		const redirectPath = this.getCheckoutCompleteRedirectPath();

		this.props.clearPurchases();

		if ( cartItems.hasRenewalItem( cart ) ) {
			// checkouts for renewals redirect back to `/purchases` with a notice

			renewalItem = cartItems.getRenewalItems( cart )[ 0 ];
			// group all purchases into an array
			purchasedProducts = reduce(
				( receipt && receipt.purchases ) || {},
				function( result, value ) {
					return result.concat( value );
				},
				[]
			);
			// and take the first product which matches the product id of the renewalItem
			product = find( purchasedProducts, function( item ) {
				return item.product_id === renewalItem.product_id;
			} );

			if ( product && product.will_auto_renew ) {
				notices.success(
					translate(
						'%(productName)s has been renewed and will now auto renew in the future. ' +
							'{{a}}Learn more{{/a}}',
						{
							args: {
								productName: renewalItem.product_name,
							},
							components: {
								a: <a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />,
							},
						}
					),
					{ persistent: true }
				);
			} else if ( product ) {
				notices.success(
					translate(
						'Success! You renewed %(productName)s for %(duration)s, until %(date)s. ' +
							'We sent your receipt to %(email)s.',
						{
							args: {
								productName: renewalItem.product_name,
								duration: i18n.moment.duration( { days: renewalItem.bill_period } ).humanize(),
								date: i18n.moment( product.expiry ).format( 'LL' ),
								email: product.user_email,
							},
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
				failedPurchases: this.flattenPurchases( this.props.transaction.step.data.failed_purchases ),
			} );
		}

		if ( selectedSiteId ) {
			this.props.requestSite( selectedSiteId );
		}

		if (
			( cart.create_new_blog && receipt && isEmpty( receipt.failed_purchases ) ) ||
			( isDomainOnly && cartItems.hasPlan( cart ) && ! selectedSiteId )
		) {
			notices.info( translate( 'Almost done…' ) );

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
				<DomainDetailsForm cart={ this.props.cart } productsList={ this.props.productsList } />
			);
		} else if ( this.isLoading() || this.props.cart.hasPendingServerUpdates ) {
			// hasPendingServerUpdates is an important check here as the content we display is dependent on the content of the cart

			return <SecurePaymentFormPlaceholder />;
		}

		return (
			<SecurePaymentForm
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				cards={ this.props.cards }
				paymentMethods={ this.paymentMethodsAbTestFilter() }
				products={ this.props.productsList.get() }
				selectedSite={ selectedSite }
				redirectTo={ this.getCheckoutCompleteRedirectPath }
				handleCheckoutCompleteRedirect={ this.handleCheckoutCompleteRedirect }
			/>
		);
	},

	paymentMethodsAbTestFilter: function() {
		// This methods can be used to filter payment methods
		// For example, for the purpose of AB tests.

		return this.props.paymentMethods;
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

		return (
			cart &&
			! hasDomainDetails( transaction ) &&
			( cartItems.hasDomainRegistration( cart ) ||
				cartItems.hasGoogleApps( cart ) ||
				cartItems.hasTransferProduct( cart ) )
		);
	},

	render: function() {
		return (
			<div className="main main-column" role="main">
				<div className="checkout">
					<QueryContactDetailsCache />
					<QueryStoredCards />
					<QueryGeo />

					{ this.content() }
				</div>
			</div>
		);
	},
} );

export default connect(
	( state, props ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			cards: getStoredCards( state ),
			paymentMethods: getCurrentUserPaymentMethods( state ),
			isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			isNewlyCreatedSite: isNewSite( state, selectedSiteId ),
			contactDetails: getContactDetailsCache( state ),
			userCountryCode: getCurrentUserCountryCode( state ),
			isEligibleForCheckoutToChecklist: isEligibleForCheckoutToChecklist(
				state,
				selectedSiteId,
				props.cart
			),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		recordApplePayStatus,
		requestSite,
		loadTrackingTool,
	}
)( localize( Checkout ) );
