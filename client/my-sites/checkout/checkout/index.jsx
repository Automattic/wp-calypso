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

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import {
	cartItems,
	getEnabledPaymentMethods,
	hasPendingPayment,
	shouldShowTax,
} from 'lib/cart-values';
import PendingPaymentBlocker from './pending-payment-blocker';
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
import { managePurchase } from 'me/purchases/paths';
import SubscriptionLengthPicker from 'blocks/subscription-length-picker';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryStoredCards from 'components/data/query-stored-cards';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryPlans from 'components/data/query-plans';
import SecurePaymentForm from './secure-payment-form';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder';
import { AUTO_RENEWAL } from 'lib/url/support';
import {
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import {
	addItem,
	replaceCartWithItems,
	replaceItem,
	applyCoupon,
	resetTransaction,
	setDomainDetails,
} from 'lib/upgrades/actions';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isEligibleForCheckoutToChecklist from 'state/selectors/is-eligible-for-checkout-to-checklist';
import { getStoredCards } from 'state/stored-cards/selectors';
import { isValidFeatureKey } from 'lib/plans/features-list';
import { getPlan, findPlansKeys } from 'lib/plans';
import { GROUP_WPCOM } from 'lib/plans/constants';
import { recordViewCheckout } from 'lib/analytics/ad-tracking';
import { recordApplePayStatus } from 'lib/apple-pay';
import { requestSite } from 'state/sites/actions';
import { isJetpackSite, isNewSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { canDomainAddGSuite } from 'lib/gsuite';
import { getDomainNameFromReceiptOrCart } from 'lib/domains/utils';
import { fetchSitesAndUser } from 'lib/signup/step-actions';
import { siteQualifiesForPageBuilder, getEditHomeUrl } from 'lib/signup/page-builder';
import { getProductsList, isProductsListFetching } from 'state/products-list/selectors';
import QueryProducts from 'components/data/query-products-list';
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { isRequestingPlans } from 'state/plans/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import config from 'config';
import { abtest } from 'lib/abtest';

/**
 * Style dependencies
 */
import './style.scss';

export class Checkout extends React.Component {
	static propTypes = {
		cards: PropTypes.array.isRequired,
		couponCode: PropTypes.string,
		isJetpackNotAtomic: PropTypes.bool,
		selectedFeature: PropTypes.string,
	};

	state = {
		previousCart: null,
		cartSettled: false,
	};

	// TODO: update this component to not use deprecated life cycle methods
	/* eslint-disable-next-line react/no-deprecated */
	componentWillMount() {
		resetTransaction();
		this.props.recordApplePayStatus();
	}

	componentDidMount() {
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
	}

	// TODO: update this component to not use deprecated life cycle methods
	/* eslint-disable-next-line react/no-deprecated */
	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.cart.hasLoadedFromServer && nextProps.cart.hasLoadedFromServer ) {
			if ( this.props.product ) {
				this.addProductToCart();
			}

			this.trackPageView( nextProps );
		}

		if ( ! this.state.cartSettled && ! nextProps.cart.hasPendingServerUpdates ) {
			this.setState( {
				cartSettled: true,
			} );
		}
	}

	componentDidUpdate() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return false;
		}

		const previousCart = this.state.previousCart;
		const nextCart = this.props.cart;

		if ( ! isEqual( previousCart, nextCart ) ) {
			this.redirectIfEmptyCart();
			// TODO: rewrite state management so we don't have to call setState here
			/* eslint-disable-next-line react/no-did-update-set-state */
			this.setState( { previousCart: nextCart } );
		}

		if (
			this.props.isNewlyCreatedSite &&
			this.props.contactDetails &&
			cartItems.hasGoogleApps( this.props.cart ) &&
			this.needsDomainDetails()
		) {
			this.setDomainDetailsForGSuiteCart();
		}
	}

	setDomainDetailsForGSuiteCart() {
		const { contactDetails, cart } = this.props;
		const domainReceiptId = get(
			cartItems.getGoogleApps( cart ),
			'[0].extra.receipt_for_domain',
			0
		);

		if ( domainReceiptId ) {
			setDomainDetails( contactDetails );
		}
	}

	trackPageView( props ) {
		props = props || this.props;

		analytics.tracks.recordEvent( 'calypso_checkout_page_view', {
			saved_cards: props.cards.length,
			is_renewal: cartItems.hasRenewalItem( props.cart ),
		} );

		recordViewCheckout( props.cart );
	}

	getPlanProducts() {
		return this.props.cart.products.filter( ( { product_slug } ) => getPlan( product_slug ) );
	}

	getProductSlugFromSynonym( slug ) {
		if ( 'no-ads' === slug ) {
			return 'no-adverts/no-adverts.php';
		}
		return slug;
	}

	addProductToCart() {
		if ( this.props.purchaseId ) {
			this.addRenewItemsToCart();
		} else {
			this.addNewItemToCart();
		}
		if ( this.props.couponCode ) {
			applyCoupon( this.props.couponCode );
		}
	}

	addRenewItemsToCart() {
		const { product, purchaseId, selectedSiteSlug } = this.props;
		// products can sometimes contain multiple items separated by commas
		const products = product.split( ',' );

		if ( ! purchaseId ) {
			return;
		}

		// purchaseId can sometimes contain multiple items separated by commas
		const purchaseIds = purchaseId.split( ',' );

		const itemsToAdd = purchaseIds
			.map( ( subscriptionId, currentIndex ) => {
				const productSlug = products[ currentIndex ];
				if ( ! productSlug ) {
					return null;
				}
				return this.getRenewalItemForProductAndSubscription(
					productSlug,
					subscriptionId,
					selectedSiteSlug
				);
			} )
			.filter( item => item );
		replaceCartWithItems( itemsToAdd );
	}

	getRenewalItemForProductAndSubscription( product, purchaseId, selectedSiteSlug ) {
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

		return cartItem;
	}

	addNewItemToCart() {
		const { planSlug } = this.props;

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
			addItem( cartItem );
		}
	}

	redirectIfEmptyCart() {
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
	}

	/**
	 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
	 * so we need to flatten them to get a list of purchases
	 *
	 * @param {Object} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
	 * @returns {Array} of product objects [ { productId: ... }, ... ]
	 */
	flattenPurchases( purchases ) {
		return flatten( Object.values( purchases ) );
	}

	getEligibleDomainFromCart() {
		const domainRegistrations = cartItems.getDomainRegistrations( this.props.cart );
		const domainsInSignupContext = filter( domainRegistrations, { extra: { context: 'signup' } } );
		const domainsForGSuite = filter( domainsInSignupContext, ( { meta } ) =>
			canDomainAddGSuite( meta )
		);

		return domainsForGSuite;
	}

	getCheckoutCompleteRedirectPath = () => {
		// TODO: Cleanup and simplify this function.
		// I wouldn't be surprised if it doesn't work as intended in some scenarios.
		// Especially around the G Suite / Concierge / Checklist logic.

		let renewalItem;
		const {
			cart,
			selectedSite,
			selectedSiteSlug,
			transaction: {
				step: { data: receipt },
			},
		} = this.props;
		const domainReceiptId = get(
			cartItems.getGoogleApps( cart ),
			'[0].extra.receipt_for_domain',
			0
		);

		// Note: this function is called early on for redirect-type payment methods, when the receipt isn't set yet.
		// The `:receiptId` string is filled in by our callback page after the PayPal checkout
		const receiptId = receipt ? receipt.receipt_id : ':receiptId';

		if ( cartItems.hasRenewalItem( cart ) ) {
			renewalItem = cartItems.getRenewalItems( cart )[ 0 ];

			return managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
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

		if ( this.props.isNewlyCreatedSite && receipt && isEmpty( receipt.failed_purchases ) ) {
			const siteDesignType = get( selectedSite, 'options.design_type' );
			const hasGoogleAppsInCart = cartItems.hasGoogleApps( cart );

			// Handle the redirect path after a purchase of GSuite
			// The onboarding checklist currently supports the blog type only.
			if ( hasGoogleAppsInCart && domainReceiptId && 'store' !== siteDesignType ) {
				analytics.tracks.recordEvent( 'calypso_checklist_assign', {
					site: selectedSiteSlug,
					plan: 'paid',
				} );

				const destination = abtest( 'improvedOnboarding' ) === 'onboarding' ? 'view' : 'checklist';

				return `/${ destination }/${ selectedSiteSlug }?d=gsuite`;
			}

			// Maybe show either the G Suite or Concierge Session upsell pages
			if (
				! hasGoogleAppsInCart &&
				! cartItems.hasConciergeSession( cart ) &&
				cartItems.hasDomainRegistration( cart )
			) {
				const domainsForGSuite = this.getEligibleDomainFromCart();
				if ( domainsForGSuite.length ) {
					if ( config.isEnabled( 'upsell/concierge-session' ) ) {
						if (
							! cartItems.hasJetpackPlan( cart ) &&
							( cartItems.hasBloggerPlan( cart ) ||
								cartItems.hasPersonalPlan( cart ) ||
								cartItems.hasPremiumPlan( cart ) )
						) {
							// Assign a test group as late as possible
							if ( 'show' === abtest( 'showConciergeSessionUpsell' ) ) {
								// A user just purchased one of the qualifying plans and is in the "show" ab test variation
								// Show them the concierge session upsell page
								return `/checkout/${ selectedSiteSlug }/add-support-session/${ receiptId }`;
							}
						}
					}

					return `/checkout/${ selectedSiteSlug }/with-gsuite/${
						domainsForGSuite[ 0 ].meta
					}/${ receiptId }`;
				}
			}
		}

		// Test showing the concierge session upsell page after the user purchases a qualifying plan
		// This tests the flow that was not eligible for G Suite
		// There's an additional test above that tests directly aginst the G Suite upsell
		if (
			config.isEnabled( 'upsell/concierge-session' ) &&
			! cartItems.hasConciergeSession( cart ) &&
			! cartItems.hasJetpackPlan( cart ) &&
			( cartItems.hasBloggerPlan( cart ) ||
				cartItems.hasPersonalPlan( cart ) ||
				cartItems.hasPremiumPlan( cart ) )
		) {
			// A user just purchased one of the qualifying plans
			// Show them the concierge session upsell page
			if ( 'variantQuickstartSession' === abtest( 'conciergeQuickstartSession' ) ) {
				return `/checkout/${ selectedSiteSlug }/add-quickstart-session/${ receiptId }`;
			}

			return `/checkout/${ selectedSiteSlug }/add-support-session/${ receiptId }`;
		}

		if ( this.props.isEligibleForCheckoutToChecklist && receipt ) {
			if ( this.props.redirectToPageBuilder ) {
				return getEditHomeUrl( selectedSiteSlug );
			}
			const destination = abtest( 'improvedOnboarding' ) === 'main' ? 'checklist' : 'view';

			return `/${ destination }/${ selectedSiteSlug }`;
		}

		if ( this.props.isJetpackNotAtomic && config.isEnabled( 'jetpack/checklist' ) ) {
			return `/plans/my-plan/${ selectedSiteSlug }?thank-you`;
		}

		return this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/thank-you/features/${
					this.props.selectedFeature
			  }/${ selectedSiteSlug }/${ receiptId }`
			: `/checkout/thank-you/${ selectedSiteSlug }/${ receiptId }`;
	};

	handleCheckoutExternalRedirect( redirectUrl ) {
		window.location.href = redirectUrl;
	}

	handleCheckoutCompleteRedirect = () => {
		let product, purchasedProducts, renewalItem;

		const {
			cart,
			isDomainOnly,
			reduxStore,
			selectedSiteId,
			transaction: {
				step: { data: receipt },
			},
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
	};

	content() {
		const { selectedSite } = this.props;

		if ( this.isLoading() ) {
			return <SecurePaymentFormPlaceholder />;
		}

		if ( config.isEnabled( 'async-payments' ) && hasPendingPayment( this.props.cart ) ) {
			return <PendingPaymentBlocker />;
		}

		if ( this.needsDomainDetails() ) {
			return (
				<DomainDetailsForm
					cart={ this.props.cart }
					productsList={ this.props.productsList }
					userCountryCode={ this.props.userCountryCode }
				/>
			);
		}

		return (
			<SecurePaymentForm
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				cards={ this.props.cards }
				paymentMethods={ this.paymentMethodsAbTestFilter() }
				products={ this.props.productsList }
				selectedSite={ selectedSite }
				redirectTo={ this.getCheckoutCompleteRedirectPath }
				handleCheckoutCompleteRedirect={ this.handleCheckoutCompleteRedirect }
				handleCheckoutExternalRedirect={ this.handleCheckoutExternalRedirect }
			>
				{ this.renderSubscriptionLengthPicker() }
			</SecurePaymentForm>
		);
	}

	renderSubscriptionLengthPicker() {
		const planInCart = this.getPlanProducts()[ 0 ];
		if ( ! planInCart ) {
			return false;
		}

		const currentPlanSlug = this.props.selectedSite.plan.product_slug;
		const chosenPlan = getPlan( planInCart.product_slug );

		// Only render this for WP.com plans
		if ( chosenPlan.group !== GROUP_WPCOM ) {
			return false;
		}

		// Don't render when we're renewing a plan. Stick with the current period.
		if ( planInCart.product_slug === currentPlanSlug ) {
			return false;
		}

		const availableTerms = findPlansKeys( {
			group: chosenPlan.group,
			type: chosenPlan.type,
		} ).filter( planSlug => getPlan( planSlug ).availableFor( currentPlanSlug ) );

		if ( availableTerms.length < 2 ) {
			return false;
		}

		return (
			<React.Fragment>
				<SubscriptionLengthPicker
					cart={ this.props.cart }
					plans={ availableTerms }
					initialValue={ planInCart.product_slug }
					onChange={ this.handleTermChange }
					shouldShowTax={ shouldShowTax( this.props.cart ) }
					key="picker"
				/>
				<hr className="checkout__subscription-length-picker-separator" key="separator" />
			</React.Fragment>
		);
	}

	handleTermChange = ( { value: planSlug } ) => {
		const product = this.getPlanProducts()[ 0 ];
		const cartItem = getCartItemForPlan( planSlug, {
			domainToBundle: get( product, 'extra.domain_to_bundle', '' ),
		} );
		analytics.tracks.recordEvent( 'calypso_signup_plan_select', {
			product_slug: cartItem.product_slug,
			free_trial: cartItem.free_trial,
			from_section: 'checkout',
		} );
		replaceItem( product, cartItem );
	};

	paymentMethodsAbTestFilter() {
		// This methods can be used to filter payment methods
		// For example, for the purpose of AB tests.
		return getEnabledPaymentMethods( this.props.cart );
	}

	isLoading() {
		const isLoadingCart = ! this.props.cart.hasLoadedFromServer;
		const isLoadingProducts = this.props.isProductsListFetching;
		const isLoadingPlans = this.props.isPlansListFetching;
		const isLoadingSitePlans = this.props.isSitePlansListFetching;
		const isCartSettled = this.state.cartSettled;

		return (
			isLoadingCart || isLoadingProducts || isLoadingPlans || isLoadingSitePlans || ! isCartSettled
		);
	}

	needsDomainDetails() {
		const cart = this.props.cart;
		const transaction = this.props.transaction;

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
	}

	render() {
		const { plan, product, purchaseId, selectedFeature, selectedSiteSlug } = this.props;
		let analyticsPath = '';
		let analyticsProps = {};
		if ( purchaseId && product ) {
			analyticsPath = '/checkout/:product/renew/:purchase_id/:site';
			analyticsProps = { product, purchase_id: purchaseId, site: selectedSiteSlug };
		} else if ( selectedFeature && plan ) {
			analyticsPath = '/checkout/features/:feature/:site/:plan';
			analyticsProps = { feature: selectedFeature, plan, site: selectedSiteSlug };
		} else if ( selectedFeature && ! plan ) {
			analyticsPath = '/checkout/features/:feature/:site';
			analyticsProps = { feature: selectedFeature, site: selectedSiteSlug };
		} else if ( product && ! purchaseId ) {
			analyticsPath = '/checkout/:site/:product';
			analyticsProps = { product, site: selectedSiteSlug };
		} else if ( selectedSiteSlug ) {
			analyticsPath = '/checkout/:site';
			analyticsProps = { site: selectedSiteSlug };
		} else {
			analyticsPath = '/checkout/no-site';
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="main main-column" role="main">
				<div className="checkout">
					<QuerySitePlans siteId={ this.props.selectedSiteId } />
					<QueryPlans />
					<QueryProducts />
					<QueryContactDetailsCache />
					<QueryStoredCards />

					<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />

					{ this.content() }
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect(
	( state, props ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			cards: getStoredCards( state ),
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
			redirectToPageBuilder: siteQualifiesForPageBuilder( state, selectedSiteId ),
			productsList: getProductsList( state ),
			isProductsListFetching: isProductsListFetching( state ),
			isPlansListFetching: isRequestingPlans( state ),
			isSitePlansListFetching: isRequestingSitePlans( state, selectedSiteId ),
			planSlug: getUpgradePlanSlugFromPath( state, selectedSiteId, props.product ),
			isJetpackNotAtomic:
				isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		recordApplePayStatus,
		requestSite,
	}
)( localize( Checkout ) );
