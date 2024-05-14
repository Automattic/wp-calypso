import {
	isMonthly,
	getPlanByPathSlug,
	TERM_MONTHLY,
	Product,
	isPlan,
} from '@automattic/calypso-products';
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import page from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CompactCard, Gridicon } from '@automattic/components';
import { withShoppingCart, createRequestCartProduct } from '@automattic/shopping-cart';
import { isURL } from '@wordpress/url';
import classnames from 'classnames';
import debugFactory from 'debug';
import { localize, useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import Main from 'calypso/components/main';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from 'calypso/lib/titan/constants';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import ProfessionalEmailUpsell from 'calypso/my-sites/checkout/upsell-nudge/professional-email-upsell';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
	persistSignupDestination,
} from 'calypso/signup/storageUtils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	getProductsList,
	getProductDisplayCost,
	getProductBySlug,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import getUpgradePlanSlugFromPath from 'calypso/state/selectors/get-upgrade-plan-slug-from-path';
import {
	isRequestingSitePlans,
	getPlansBySiteId,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getSitePlan, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PurchaseModal from '../purchase-modal';
import {
	type WithIsEligibleForOneClickCheckoutProps,
	withIsEligibleForOneClickCheckout,
} from '../purchase-modal/with-is-eligible-for-one-click-checkout';
import { BusinessPlanUpgradeUpsell } from './business-plan-upgrade-upsell';
import { QuickstartSessionsRetirement } from './quickstart-sessions-retirement';
import type { WithShoppingCartProps, MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

const debug = debugFactory( 'calypso:upsell-nudge' );
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * Upsell Types
 */
export const CONCIERGE_QUICKSTART_SESSION = 'concierge-quickstart-session';
export const CONCIERGE_SUPPORT_SESSION = 'concierge-support-session';
export const BUSINESS_PLAN_UPGRADE_UPSELL = 'business-plan-upgrade-upsell';
export const PROFESSIONAL_EMAIL_UPSELL = 'professional-email-upsell';

export interface UpsellNudgeManualProps {
	receiptId?: number;
	upsellType: string;
	upgradeItem?: string;
	siteSlugParam?: string;
}

// Below are provided by HOCs
export interface UpsellNudgeAutomaticProps extends WithShoppingCartProps {
	currencyCode: string | null;
	isLoading?: boolean;
	hasProductsList?: boolean;
	hasSitePlans?: boolean;
	product: MinimalRequestCartProduct | undefined;
	productDisplayCost?: string | null;
	planRawPrice?: number | null;
	planDiscountedRawPrice?: number | null;
	isLoggedIn?: boolean;
	siteSlug?: string | null;
	currentProduct?: Product | Record< string, never >;
	selectedSiteId: string | number | undefined | null;
	hasSevenDayRefundPeriod?: boolean;
	trackUpsellButtonClick: ( key: string ) => void;
	translate: ReturnType< typeof useTranslate >;
	currentPlanTerm: string;
}

export type UpsellNudgeProps = UpsellNudgeManualProps &
	UpsellNudgeAutomaticProps &
	WithIsEligibleForOneClickCheckoutProps;

interface UpsellNudgeState {
	cartItem: MinimalRequestCartProduct | null;
	showPurchaseModal: boolean;
}

export class UpsellNudge extends Component< UpsellNudgeProps, UpsellNudgeState > {
	state: UpsellNudgeState = {
		cartItem: null,
		showPurchaseModal: false,
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { selectedSiteId, hasProductsList, hasSitePlans, upsellType, upgradeItem } = this.props;
		const styleClass =
			BUSINESS_PLAN_UPGRADE_UPSELL === upsellType
				? 'business-plan-upgrade-upsell-new-design'
				: upsellType;

		// There is no `siteId` if we're purchasing a domain-only site, so we pass the site slug to the query component instead.
		const siteId =
			upsellType === PROFESSIONAL_EMAIL_UPSELL
				? upgradeItem
				: parseInt( String( selectedSiteId ), 10 );
		return (
			<Main
				className={ classnames( styleClass, {
					'is-wide-layout': BUSINESS_PLAN_UPGRADE_UPSELL === upsellType,
				} ) }
			>
				<QuerySites siteId={ siteId } />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && typeof siteId === 'number' && ! isNaN( siteId ) && (
					<QuerySitePlans siteId={ siteId } />
				) }
				{ this.renderContent() }
				{ this.state.showPurchaseModal && this.renderPurchaseModal() }
				{ this.preloadIconsForPurchaseModal() }
			</Main>
		);
	}

	renderGenericPlaceholder() {
		const { receiptId } = this.props;
		return (
			<>
				{ receiptId ? (
					<CompactCard>
						<div className="upsell-nudge__header">
							<div className="upsell-nudge__placeholders">
								<div className="upsell-nudge__placeholder-row is-placeholder" />
							</div>
						</div>
					</CompactCard>
				) : (
					''
				) }
				<CompactCard>
					<div className="upsell-nudge__placeholders">
						<div>
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<br />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<br />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<br />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<br />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<br />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="upsell-nudge__footer">
						<div className="upsell-nudge__placeholders">
							<div className="upsell-nudge__placeholder-button-container">
								<div className="upsell-nudge__placeholder-button is-placeholder" />
								<div className="upsell-nudge__placeholder-button is-placeholder" />
							</div>
						</div>
					</div>
				</CompactCard>
			</>
		);
	}

	renderContent() {
		const {
			receiptId,
			currencyCode,
			currentPlanTerm,
			planRawPrice,
			planDiscountedRawPrice,
			isLoggedIn,
			upsellType,
			upgradeItem,
			translate,
			siteSlug,
			hasSevenDayRefundPeriod,
			isLoading: isFetchingData,
		} = this.props;

		const isLoading = isFetchingData || this.props.isEligibleForOneClickCheckout.isLoading;

		switch ( upsellType ) {
			case CONCIERGE_QUICKSTART_SESSION:
			case CONCIERGE_SUPPORT_SESSION:
				return isLoading ? (
					this.renderGenericPlaceholder()
				) : (
					<QuickstartSessionsRetirement
						handleClickDecline={ this.handleClickDecline }
						isLoggedIn={ isLoggedIn }
						receiptId={ receiptId }
						siteSlug={ siteSlug }
						upsellType={ upsellType }
					/>
				);

			case BUSINESS_PLAN_UPGRADE_UPSELL:
				return (
					<BusinessPlanUpgradeUpsell
						currencyCode={ currencyCode }
						planRawPrice={ planRawPrice }
						planDiscountedRawPrice={ planDiscountedRawPrice }
						receiptId={ receiptId }
						translate={ translate }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
						hasSevenDayRefundPeriod={ hasSevenDayRefundPeriod }
						isLoading={ isLoading }
					/>
				);
			case PROFESSIONAL_EMAIL_UPSELL:
				return (
					<ProfessionalEmailUpsell
						domainName={ upgradeItem ?? '' }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
						intervalLength={
							currentPlanTerm === TERM_MONTHLY ? IntervalLength.MONTHLY : IntervalLength.ANNUALLY
						}
						/* Use the callback form of setState() to ensure handleClickAccept()
						 is called after the state update */
						setCartItem={ ( newCartItem, callback = noop ) =>
							this.setState( { cartItem: newCartItem }, callback )
						}
						isLoading={ isLoading }
					/>
				);
		}
	}

	getThankYouPageUrlForIncomingCart = ( shouldHideUpsellNudges = true ) => {
		const getThankYouPageUrlArguments = {
			siteSlug: this.props.siteSlug ?? undefined,
			receiptId: this.props.receiptId,
			noPurchaseMade: ! this.props.receiptId,
			cart: this.props.cart,
			hideNudge: shouldHideUpsellNudges,
		};

		return getThankYouPageUrl( getThankYouPageUrlArguments );
	};

	handleClickDecline = ( shouldHideUpsellNudges = true ) => {
		const { trackUpsellButtonClick, upsellType } = this.props;

		trackUpsellButtonClick( `calypso_${ upsellType.replace( /-/g, '_' ) }_decline_button_click` );

		const url = this.getThankYouPageUrlForIncomingCart( shouldHideUpsellNudges );

		// Removes the destination cookie only if redirecting to the signup destination.
		// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
		const destinationFromCookie = retrieveSignupDestination();
		if ( url.includes( destinationFromCookie ) ) {
			clearSignupDestinationCookie();
		}

		// The section "/setup" is not defined as a page.js routing path, so page.redirect won't work.
		// See: https://github.com/Automattic/wp-calypso/blob/trunk/client/sections.js
		if ( isURL( url ) || url.startsWith( '/setup' ) ) {
			window.location.href = url;
		} else {
			page.redirect( url );
		}
	};

	getProductToAdd = () => {
		let productToAdd = this.props.product;
		if ( PROFESSIONAL_EMAIL_UPSELL === this.props.upsellType && this.state.cartItem ) {
			productToAdd = this.state.cartItem;
		}
		return productToAdd;
	};

	handleClickAccept = async ( buttonAction: string ) => {
		const { siteSlug, trackUpsellButtonClick, upgradeItem, upsellType } = this.props;
		debug( 'accept upsell clicked' );

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);

		const productToAdd = this.getProductToAdd();

		if ( this.isEligibleForOneClickUpsell( buttonAction ) && productToAdd ) {
			debug( 'accept upsell allows one-click, has a product, and a stored card' );
			this.setState( {
				showPurchaseModal: true,
			} );
			return;
		}
		debug(
			'accept upsell either does does not allow one-click, does not have a product, or does not have a stored card'
		);

		// Professional Email needs to add the locally built cartItem to the cart,
		// as we need to handle validation failures before redirecting to checkout.
		if ( PROFESSIONAL_EMAIL_UPSELL === upsellType && productToAdd ) {
			debug( 'accept upsell preparing for email upsell' );
			// If we don't have an existing destination, calculate the thank you destination for
			// the original cart contents, and only store it if the cart update succeeds.
			const destinationFromCookie = retrieveSignupDestination();
			const destinationToPersist = destinationFromCookie
				? null
				: this.getThankYouPageUrlForIncomingCart( true );

			this.props.shoppingCartManager
				.replaceProductsInCart( [ productToAdd ] )
				.then( ( newCart ) => {
					if ( newCart.messages?.errors ) {
						if ( newCart.messages.errors.length > 0 ) {
							debug( 'email upsell failed with a cart error in the cart response' );
							// Stay on the page to let CartMessages show the relevant error.
							return;
						}
					}

					if ( destinationToPersist ) {
						persistSignupDestination( destinationToPersist );
					}

					debug( 'redirecting because we have professional email' );
					page( '/checkout/' + siteSlug );
				} )
				.catch( ( error ) => {
					// Nothing needs to be done here. CartMessages will display the error to the user.
					debug( 'email upsell failed with a cart error', error );
				} );
			return;
		}

		debug( 'redirecting because we are not eligible for one-click upsell' );
		return siteSlug
			? page( `/checkout/${ upgradeItem }/${ siteSlug }` )
			: page( `/checkout/${ upgradeItem }` );
	};

	isEligibleForOneClickUpsell = ( buttonAction: string ) => {
		const { product, siteSlug, upsellType } = this.props;
		const { cartItem } = this.state;

		if ( ! product && upsellType !== PROFESSIONAL_EMAIL_UPSELL ) {
			debug( 'not eligible for one-click upsell because no product exists' );
			return false;
		}

		if ( upsellType === PROFESSIONAL_EMAIL_UPSELL && ! cartItem ) {
			debug( 'not eligible for one-click upsell because no email product exists' );
			return false;
		}

		const supportedUpsellTypes = [
			BUSINESS_PLAN_UPGRADE_UPSELL,
			CONCIERGE_QUICKSTART_SESSION,
			PROFESSIONAL_EMAIL_UPSELL,
		];
		if ( 'accept' !== buttonAction || ! supportedUpsellTypes.includes( upsellType ) ) {
			debug(
				`not eligible for one-click upsell because the upsellType (${ upsellType }) is not supported`
			);
			return false;
		}

		if ( ! siteSlug ) {
			debug( 'not eligible for one-click upsell because there is no siteSlug' );
			return false;
		}

		if ( ! this.props.isEligibleForOneClickCheckout.result ) {
			debug( 'not eligible for one-click upsell because not eligible for one-click checkout' );
			return false;
		}

		debug( 'eligible for one-click upsell' );
		return true;
	};

	renderPurchaseModal = () => {
		const onCloseModal = () => {
			this.setState( { showPurchaseModal: false } );
		};

		const productToAdd = this.getProductToAdd();

		if ( ! this.props.siteSlug || ! productToAdd ) {
			return null;
		}

		return (
			<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration }>
				<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
					<PurchaseModal
						productToAdd={ productToAdd }
						onClose={ onCloseModal }
						siteSlug={ this.props.siteSlug }
						showFeatureList={
							!! (
								this.props.product && isPlan( { productSlug: this.props.product?.product_slug } )
							)
						}
					/>
				</RazorpayHookProvider>
			</StripeHookProvider>
		);
	};

	preloadIconsForPurchaseModal = () => {
		return (
			<div className="upsell-nudge__hidden">
				<Gridicon icon="cross-small" />
			</div>
		);
	};
}

const trackUpsellButtonClick = ( eventName: string ) => {
	// Track upsell get started / accept / decline events
	return recordTracksEvent( eventName, { section: 'checkout' } );
};

const getProductSlug = ( upsellType: string, productAlias: string, planTerm: string ) => {
	switch ( upsellType ) {
		case BUSINESS_PLAN_UPGRADE_UPSELL:
			return getPlanByPathSlug( productAlias )?.getStoreSlug();

		case PROFESSIONAL_EMAIL_UPSELL:
			return planTerm === TERM_MONTHLY ? TITAN_MAIL_MONTHLY_SLUG : TITAN_MAIL_YEARLY_SLUG;

		case CONCIERGE_QUICKSTART_SESSION:
		case CONCIERGE_SUPPORT_SESSION:
		default:
			return 'concierge-session';
	}
};

export default connect(
	( state: IAppState, props: UpsellNudgeManualProps ) => {
		const { siteSlugParam, upgradeItem, upsellType } = props;
		const selectedSiteId = getSelectedSiteId( state );
		const productsList = getProductsList( state );
		const sitePlans = getPlansBySiteId( state, undefined ).data;
		const siteSlug = selectedSiteId ? getSiteSlug( state, selectedSiteId ) : siteSlugParam;
		const planSlug = getUpgradePlanSlugFromPath(
			state,
			selectedSiteId ?? 0,
			props.upgradeItem ?? ''
		);
		const annualDiscountPrice = getPlanDiscountedRawPrice( state, selectedSiteId ?? 0, planSlug, {
			returnMonthly: false,
		} );
		const annualPrice = getSitePlanRawPrice( state, selectedSiteId ?? 0, planSlug, {
			returnMonthly: false,
		} );

		const currentPlanTerm = getCurrentPlanTerm( state, selectedSiteId ?? 0 ) ?? TERM_MONTHLY;
		const currentSitePlan = getSitePlan( state, selectedSiteId ?? 0 );
		const currentProduct = getProductBySlug( state, currentSitePlan?.product_slug ?? '' ) || {};
		const productSlug = getProductSlug( upsellType, upgradeItem ?? '', currentPlanTerm );
		const productProperties = pick( getProductBySlug( state, productSlug ?? '' ), [
			'product_slug',
			'product_id',
		] );
		const product =
			productProperties.product_slug && productProperties.product_id
				? createRequestCartProduct( {
						product_slug: productProperties.product_slug,
						product_id: productProperties.product_id,
				  } )
				: undefined;

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentPlanTerm,
			currentProduct,
			isLoading: isProductsListFetching( state ) || isRequestingSitePlans( state, selectedSiteId ),
			hasProductsList: Object.keys( productsList ).length > 0,
			hasSitePlans: sitePlans ? sitePlans.length > 0 : undefined,
			product,
			productDisplayCost: getProductDisplayCost( state, productSlug ?? '' ),
			planRawPrice: annualPrice,
			planDiscountedRawPrice: annualDiscountPrice,
			isLoggedIn: isUserLoggedIn( state ),
			siteSlug,
			selectedSiteId,
			hasSevenDayRefundPeriod: isMonthly( planSlug ),
			productSlug,
		};
	},
	{
		trackUpsellButtonClick,
	}
)(
	withIsEligibleForOneClickCheckout( withCartKey( withShoppingCart( localize( UpsellNudge ) ) ) )
);
