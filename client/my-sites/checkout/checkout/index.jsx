/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, get, isEmpty, reduce } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { format as formatUrl, parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	hasRenewalItem,
	getAllCartItems,
	getRenewalItems,
	hasFreeTrial,
	hasConciergeSession,
	hasJetpackPlan,
	hasBloggerPlan,
	hasPersonalPlan,
	hasPremiumPlan,
	hasEcommercePlan,
	hasPlan,
} from 'calypso/lib/cart-values/cart-items';
import {
	isJetpackProductSlug,
	isJetpackScanSlug,
	isJetpackBackupSlug,
	isJetpackCloudProductSlug,
	isJetpackAntiSpamSlug,
} from 'calypso/lib/products-values';
import { clearSitePlans } from 'calypso/state/sites/plans/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import notices from 'calypso/notices';
import { managePurchase } from 'calypso/me/purchases/paths';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import { AUTO_RENEWAL } from 'calypso/lib/url/support';
import getUpgradePlanSlugFromPath from 'calypso/state/selectors/get-upgrade-plan-slug-from-path';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import { getStoredCards, isFetchingStoredCards } from 'calypso/state/stored-cards/selectors';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { recordViewCheckout } from 'calypso/lib/analytics/ad-tracking';
import { requestSite } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { getDomainNameFromReceiptOrCart } from 'calypso/lib/domains/cart-utils';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { isApplePayAvailable } from 'calypso/lib/web-payment';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import config from 'calypso/config';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import {
	persistSignupDestination,
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { isExternal, addQueryArgs } from 'calypso/lib/url';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { abtest } from 'calypso/lib/abtest';
import { isE2ETest } from 'calypso/lib/e2e';

/**
 * Style dependencies
 */
import './style.scss';

export class Checkout extends React.Component {
	static propTypes = {
		cards: PropTypes.array.isRequired,
		couponCode: PropTypes.string,
		isJetpackNotAtomic: PropTypes.bool,
		returnToBlockEditor: PropTypes.bool,
		returnToHome: PropTypes.bool,
		selectedFeature: PropTypes.string,
		loadTrackingTool: PropTypes.func.isRequired,
	};

	state = {
		cartSettled: false,
	};

	componentDidMount() {
		if ( this.props.cart.hasLoadedFromServer ) {
			this.trackPageView();
		}

		this.props.loadTrackingTool( 'HotJar' );
		window.scrollTo( 0, 0 );
	}

	trackPageView( props ) {
		props = props || this.props;

		recordTracksEvent( 'calypso_checkout_page_view', {
			saved_cards: props.cards.length,
			is_renewal: hasRenewalItem( props.cart ),
			apple_pay_available: isApplePayAvailable(),
			product_slug: props.product,
		} );

		recordViewCheckout( props.cart );
	}

	getUrlWithQueryParam( url, queryParams ) {
		const { protocol, hostname, port, pathname, query } = parseUrl( url, true );

		return formatUrl( {
			protocol,
			hostname,
			port,
			pathname,
			query: {
				...query,
				...queryParams,
			},
		} );
	}

	getFallbackDestination( pendingOrReceiptId ) {
		const { selectedSiteSlug, selectedFeature, cart, isJetpackNotAtomic, product } = this.props;

		const isCartEmpty = isEmpty( getAllCartItems( cart ) );
		const isReceiptEmpty = ':receiptId' === pendingOrReceiptId;
		// We will show the Thank You page if there's a site slug and either one of the following is true:
		// - has a receipt number
		// - does not have a receipt number but has an item in cart(as in the case of paying with a redirect payment type)
		if ( selectedSiteSlug && ( ! isReceiptEmpty || ! isCartEmpty ) ) {
			const isJetpackProduct = product && isJetpackProductSlug( product );
			const isJetpackAntiSpam = product && isJetpackAntiSpamSlug( product );

			let installQuery = '&install=all';

			if ( isJetpackAntiSpam ) {
				installQuery = '&install=akismet';
			}

			// If we just purchased a Jetpack product, redirect to the my plans page.
			if ( isJetpackNotAtomic && isJetpackProduct ) {
				return `/plans/my-plan/${ selectedSiteSlug }?thank-you&product=${ product }${ installQuery }`;
			}
			// If we just purchased a Jetpack plan (not a Jetpack product), redirect to the Jetpack onboarding plugin install flow.
			if ( isJetpackNotAtomic ) {
				return `/plans/my-plan/${ selectedSiteSlug }?thank-you${ installQuery }`;
			}

			return selectedFeature && isValidFeatureKey( selectedFeature )
				? `/checkout/thank-you/features/${ selectedFeature }/${ selectedSiteSlug }/${ pendingOrReceiptId }`
				: `/checkout/thank-you/${ selectedSiteSlug }/${ pendingOrReceiptId }`;
		}

		return '/';
	}

	/**
	 * If there is an ecommerce plan in cart, then irrespective of the signup flow destination, the final destination
	 * will always be "Thank You" page for the eCommerce plan. This is because the ecommerce store setup happens in this page.
	 * If the user purchases additional products via upsell nudges, the original saved receipt ID will be used to
	 * display the Thank You page for the eCommerce plan purchase.
	 *
	 * @param {string} pendingOrReceiptId The receipt id for the transaction
	 */
	setDestinationIfEcommPlan( pendingOrReceiptId ) {
		const { cart, selectedSiteSlug } = this.props;

		if ( hasEcommercePlan( cart ) ) {
			persistSignupDestination( this.getFallbackDestination( pendingOrReceiptId ) );
		} else {
			const signupDestination = retrieveSignupDestination();

			if ( ! signupDestination ) {
				return;
			}

			// If atomic site, then replace wordpress.com with wpcomstaging.com
			if ( selectedSiteSlug && selectedSiteSlug.includes( '.wpcomstaging.com' ) ) {
				const wpcomStagingDestination = signupDestination.replace(
					/\b.wordpress.com/,
					'.wpcomstaging.com'
				);
				persistSignupDestination( wpcomStagingDestination );
			}
		}
	}

	maybeShowPlanBumpOffer( receiptId, stepResult ) {
		const { cart, selectedSiteSlug } = this.props;

		if ( hasPremiumPlan( cart ) && stepResult && isEmpty( stepResult.failed_purchases ) ) {
			return `/checkout/${ selectedSiteSlug }/offer-plan-upgrade/business/${ receiptId }`;
		}

		return;
	}

	maybeRedirectToConciergeNudge( pendingOrReceiptId, stepResult, shouldHideUpsellNudges ) {
		// Using hideNudge prop will disable any redirect to Nudge
		if ( this.props.hideNudge || shouldHideUpsellNudges || isE2ETest() ) {
			return;
		}

		const { cart, selectedSiteSlug } = this.props;

		// If the user has upgraded a plan from seeing our upsell (we find this by checking the previous route is /offer-plan-upgrade),
		// then skip this section so that we do not show further upsells.
		if (
			! /pending/.test( pendingOrReceiptId ) &&
			config.isEnabled( 'upsell/concierge-session' ) &&
			! hasConciergeSession( cart ) &&
			! hasJetpackPlan( cart ) &&
			( hasBloggerPlan( cart ) || hasPersonalPlan( cart ) || hasPremiumPlan( cart ) )
		) {
			// A user just purchased one of the qualifying plans
			// Show them the concierge session upsell page

			const upgradePath = this.maybeShowPlanBumpOffer( pendingOrReceiptId, stepResult );
			if ( upgradePath ) {
				return upgradePath;
			}

			// The conciergeUpsellDial test is used when we need to quickly dial back the volume of concierge sessions
			// being offered and so sold, to be inline with HE availability.
			// To dial back, uncomment the condition below and modify the test config.
			if ( 'offer' === abtest( 'conciergeUpsellDial' ) ) {
				return `/checkout/offer-quickstart-session/${ pendingOrReceiptId }/${ selectedSiteSlug }`;
			}
		}
	}

	getCheckoutCompleteRedirectPath = ( shouldHideUpsellNudges = false ) => {
		// TODO: Cleanup and simplify this function.
		// I wouldn't be surprised if it doesn't work as intended in some scenarios.
		// Especially around the Concierge / Checklist logic.

		let renewalItem;
		let signupDestination;
		let displayModeParam = {};
		const {
			cart,
			product,
			redirectTo,
			selectedSite,
			selectedSiteSlug,
			transaction: { step: { data: stepResult = null } = {} } = {},
			isJetpackNotAtomic,
		} = this.props;

		const adminUrl = get( selectedSite, [ 'options', 'admin_url' ] );

		// If we're given an explicit `redirectTo` query arg, make sure it's either internal
		// (i.e. on WordPress.com), or a Jetpack or WP.com site's block editor (in wp-admin).
		// This is required for Jetpack's (and WP.com's) paid blocks Upgrade Nudge.
		if ( redirectTo ) {
			if ( ! isExternal( redirectTo ) ) {
				return redirectTo;
			}

			const { protocol, hostname, port, pathname, query } = parseUrl( redirectTo, true, true );

			// We cannot simply compare `hostname` to `selectedSiteSlug`, since the latter
			// might contain a path in the case of Jetpack subdirectory installs.
			if ( adminUrl && redirectTo.startsWith( `${ adminUrl }post.php?` ) ) {
				const sanitizedRedirectTo = formatUrl( {
					protocol,
					hostname,
					port,
					pathname,
					query: {
						post: parseInt( query.post, 10 ),
						action: 'edit',
						plan_upgraded: 1,
					},
				} );
				return sanitizedRedirectTo;
			}
		}

		// Note: this function is called early on for redirect-type payment methods, when the receipt isn't set yet.
		// The `:receiptId` string is filled in by our callback page after the PayPal checkout
		let pendingOrReceiptId;

		if ( get( stepResult, 'receipt_id', false ) ) {
			pendingOrReceiptId = stepResult.receipt_id;
		} else if ( get( stepResult, 'orderId', false ) ) {
			pendingOrReceiptId = 'pending/' + stepResult.orderId;
		} else {
			pendingOrReceiptId = this.props.purchaseId ? this.props.purchaseId : ':receiptId';
		}

		this.setDestinationIfEcommPlan( pendingOrReceiptId );

		// If it is a Jetpack Cloud products, use the redirection lib.
		// For other Jetpack products, use the fallback logic to send to Calypso.
		if ( isJetpackCloudProductSlug( product ) && isJetpackNotAtomic ) {
			let source = '';
			if ( isJetpackBackupSlug( product ) ) {
				source = 'calypso-backups';
			} else if ( isJetpackScanSlug( product ) ) {
				source = 'calypso-scanner';
			}
			if ( source ) {
				return addQueryArgs(
					{
						source,
						site: selectedSiteSlug,
					},
					'https://jetpack.com/redirect'
				);
			}
		} else if ( isJetpackProductSlug( product ) ) {
			signupDestination = this.getFallbackDestination( pendingOrReceiptId );
		} else {
			signupDestination =
				retrieveSignupDestination() || this.getFallbackDestination( pendingOrReceiptId );
		}

		if ( hasRenewalItem( cart ) ) {
			renewalItem = getRenewalItems( cart )[ 0 ];

			return managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
		}

		if ( hasFreeTrial( cart ) ) {
			return selectedSiteSlug
				? `/plans/${ selectedSiteSlug }/thank-you`
				: '/checkout/thank-you/plans';
		}

		// If cart is empty, then send the user to a generic page (not post-purchase related).
		// For example, this case arises when a Skip button is clicked on a concierge upsell
		// nudge opened by a direct link to /offer-support-session.
		if ( ':receiptId' === pendingOrReceiptId && isEmpty( getAllCartItems( cart ) ) ) {
			return signupDestination;
		}

		// Domain only flow
		if ( cart.create_new_blog ) {
			return `${ signupDestination }/${ pendingOrReceiptId }`;
		}

		const redirectPathForConciergeUpsell = this.maybeRedirectToConciergeNudge(
			pendingOrReceiptId,
			stepResult,
			shouldHideUpsellNudges
		);
		if ( redirectPathForConciergeUpsell ) {
			return redirectPathForConciergeUpsell;
		}

		// Display mode is used to show purchase specific messaging, for e.g. the Schedule Session button
		// when purchasing a concierge session.
		if ( hasConciergeSession( cart ) ) {
			displayModeParam = { d: 'concierge' };
		}

		if ( this.props.isEligibleForSignupDestination ) {
			return this.getUrlWithQueryParam( signupDestination, displayModeParam );
		}

		return this.getUrlWithQueryParam(
			this.getFallbackDestination( pendingOrReceiptId ),
			displayModeParam
		);
	};

	handleCheckoutExternalRedirect( redirectUrl ) {
		window.location.href = redirectUrl;
	}

	handleCheckoutCompleteRedirect = ( shouldHideUpsellNudges = false ) => {
		let product;
		let purchasedProducts;
		let renewalItem;

		const {
			cart,
			isDomainOnly,
			reduxStore,
			selectedSiteId,
			transaction: { step: { data: receipt = null } = {} } = {},
			translate,
		} = this.props;

		const redirectPath = this.getCheckoutCompleteRedirectPath( shouldHideUpsellNudges );
		const destinationFromCookie = retrieveSignupDestination();

		this.props.clearPurchases();

		// If the redirect is an external URL, send them out early.
		if ( isExternal( redirectPath ) ) {
			return this.handleCheckoutExternalRedirect( redirectPath );
		}

		// Removes the destination cookie only if redirecting to the signup destination.
		// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
		if ( redirectPath.includes( destinationFromCookie ) ) {
			clearSignupDestinationCookie();
		}

		if ( hasRenewalItem( cart ) ) {
			// checkouts for renewals redirect back to `/purchases` with a notice

			renewalItem = getRenewalItems( cart )[ 0 ];
			// group all purchases into an array
			purchasedProducts = reduce(
				( receipt && receipt.purchases ) || {},
				function ( result, value ) {
					return result.concat( value );
				},
				[]
			);
			// and take the first product which matches the product id of the renewalItem
			product = find( purchasedProducts, function ( item ) {
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
								duration: this.props.moment
									.duration( { days: renewalItem.bill_period } )
									.humanize(),
								date: this.props.moment( product.expiry ).format( 'LL' ),
								email: product.user_email,
							},
						}
					),
					{ persistent: true }
				);
			}
		} else if ( hasFreeTrial( cart ) ) {
			this.props.clearSitePlans( selectedSiteId );
		}

		if ( receipt && receipt.receipt_id ) {
			const receiptId = receipt.receipt_id;

			this.props.fetchReceiptCompleted( receiptId, {
				...receipt,
				purchases: this.props.transaction.step.data.purchases,
				failed_purchases: this.props.transaction.step.data.failed_purchases,
			} );
		}

		if ( selectedSiteId ) {
			this.props.requestSite( selectedSiteId );
		}

		this.props.setHeaderText( '' );

		if (
			( cart.create_new_blog && receipt && isEmpty( receipt.failed_purchases ) ) ||
			( isDomainOnly && hasPlan( cart ) && ! selectedSiteId )
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

	render() {
		this.props.setHeaderText( '' );
		const children = React.Children.map( this.props.children, ( child ) => {
			return React.cloneElement( child, {
				cart: this.props.cart,
				cards: this.props.cards,
				isFetchingStoredCards: this.props.isFetchingStoredCards,
				handleCheckoutCompleteRedirect: this.handleCheckoutCompleteRedirect,
			} );
		} );

		return (
			<>
				<QueryStoredCards />
				{ children }
			</>
		);
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
			isEligibleForSignupDestination: isEligibleForSignupDestination( props.cart ),
			isFetchingStoredCards: isFetchingStoredCards( state ),
			planSlug: getUpgradePlanSlugFromPath( state, selectedSiteId, props.product ),
			isJetpackNotAtomic:
				isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
		};
	},
	{
		clearPurchases,
		clearSitePlans,
		fetchReceiptCompleted,
		requestSite,
		loadTrackingTool,
	}
)( localize( withLocalizedMoment( Checkout ) ) );
