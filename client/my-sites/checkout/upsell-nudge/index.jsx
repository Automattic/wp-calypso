import { isMonthly, getPlanByPathSlug } from '@automattic/calypso-products';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CompactCard, Gridicon } from '@automattic/components';
import { withShoppingCart, createRequestCartProduct } from '@automattic/shopping-cart';
import { isURL } from '@wordpress/url';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import Main from 'calypso/components/main';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';
import {
	isContactValidationResponseValid,
	getTaxValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/lib/contact-validation';
import ProfessionalEmailUpsell from 'calypso/my-sites/checkout/upsell-nudge/professional-email-upsell';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	getProductsList,
	getProductDisplayCost,
	getProductCost,
	getProductBySlug,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import getUpgradePlanSlugFromPath from 'calypso/state/selectors/get-upgrade-plan-slug-from-path';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import {
	isRequestingSitePlans,
	getPlansBySiteId,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isFetchingStoredCards,
	getStoredCards,
	hasLoadedStoredCardsFromServer,
} from 'calypso/state/stored-cards/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { BusinessPlanUpgradeUpsell } from './business-plan-upgrade-upsell';
import { ConciergeQuickstartSession } from './concierge-quickstart-session';
import { ConciergeSupportSession } from './concierge-support-session';
import PurchaseModal from './purchase-modal';
import { extractStoredCardMetaValue } from './purchase-modal/util';

import './style.scss';

const debug = debugFactory( 'calypso:upsell-nudge' );
const noop = () => {};

/**
 * Upsell Types
 */
export const CONCIERGE_QUICKSTART_SESSION = 'concierge-quickstart-session';
export const CONCIERGE_SUPPORT_SESSION = 'concierge-support-session';
export const BUSINESS_PLAN_UPGRADE_UPSELL = 'business-plan-upgrade-upsell';
export const PROFESSIONAL_EMAIL_UPSELL = 'professional-email-upsell';

export class UpsellNudge extends Component {
	static propTypes = {
		receiptId: PropTypes.number,
		upsellType: PropTypes.string,
		upgradeItem: PropTypes.string,
		siteSlugParam: PropTypes.string,

		// Below are provided by HOCs
		currencyCode: PropTypes.string,
		isLoading: PropTypes.bool,
		hasProductsList: PropTypes.bool,
		hasSitePlans: PropTypes.bool,
		product: PropTypes.object,
		productCost: PropTypes.number,
		productDisplayCost: PropTypes.string,
		planRawPrice: PropTypes.string,
		planDiscountedRawPrice: PropTypes.string,
		isLoggedIn: PropTypes.bool,
		siteSlug: PropTypes.string,
		selectedSiteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		hasSevenDayRefundPeriod: PropTypes.bool,
		trackUpsellButtonClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		cards: PropTypes.arrayOf( PropTypes.object ),
		cart: PropTypes.object,
		isFetchingStoredCards: PropTypes.bool,
	};

	state = {
		cartItem: null,
		showPurchaseModal: false,
		isContactInfoValid: false,
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
		this.validateContactInfo();
	}

	componentDidUpdate() {
		this.validateContactInfo();
	}

	validateContactInfo = () => {
		if ( this.props.isLoading ) {
			return;
		}
		if ( ! this.haveCardsChanged() ) {
			debug( 'cancelling validating contact info; cards have not changed' );
			return;
		}
		if ( this.props.cards.length === 0 ) {
			debug( 'not validating contact info because there are no cards' );
			this.setState( { isContactInfoValid: false } );
			return;
		}
		debug( 'validating contact info' );

		const storedCard = this.props.cards[ 0 ];
		const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
		const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );

		const validateContactDetails = async () => {
			const contactInfo = {
				postalCode: {
					value: postalCode,
					isTouched: true,
					errors: [],
				},
				countryCode: {
					value: countryCode,
					isTouched: true,
					errors: [],
				},
			};
			const validationResult = await getTaxValidationResult( contactInfo );
			return isContactValidationResponseValid( validationResult );
		};

		validateContactDetails().then( ( isValid ) => {
			debug( 'validation of contact details result is', isValid );
			this.setState( {
				isContactInfoValid: isValid,
			} );
		} );
	};

	haveCardsChanged = () => {
		const cardIds = this.props.cards.map( ( card ) => card.stored_details_id );
		if ( ! this.lastCardIds ) {
			this.lastCardIds = cardIds;
			return true;
		}
		if ( this.lastCardIds.length !== cardIds.length ) {
			this.lastCardIds = cardIds;
			return true;
		}
		cardIds.forEach( ( id ) => {
			if ( ! this.lastCardIds.includes( id ) ) {
				this.lastCardIds = cardIds;
				return true;
			}
		} );
		this.lastCardIds = cardIds;
		return false;
	};

	render() {
		const { selectedSiteId, isLoading, hasProductsList, hasSitePlans, upsellType } = this.props;

		return (
			<Main className={ upsellType }>
				<QuerySites siteId={ selectedSiteId } />
				<QueryStoredCards />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ selectedSiteId } /> }
				{ isLoading ? this.renderPlaceholders() : this.renderContent() }
				{ this.state.showPurchaseModal && this.renderPurchaseModal() }
				{ this.preloadIconsForPurchaseModal() }
			</Main>
		);
	}

	renderPlaceholders() {
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
			productCost,
			productDisplayCost,
			planRawPrice,
			planDiscountedRawPrice,
			isLoggedIn,
			upsellType,
			upgradeItem,
			translate,
			siteSlug,
			hasSevenDayRefundPeriod,
		} = this.props;

		switch ( upsellType ) {
			case CONCIERGE_QUICKSTART_SESSION:
				return (
					<ConciergeQuickstartSession
						currencyCode={ currencyCode }
						productCost={ productCost }
						productDisplayCost={ productDisplayCost }
						isLoggedIn={ isLoggedIn }
						receiptId={ receiptId }
						translate={ translate }
						siteSlug={ siteSlug }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
					/>
				);

			case CONCIERGE_SUPPORT_SESSION:
				return (
					<ConciergeSupportSession
						currencyCode={ currencyCode }
						productCost={ productCost }
						productDisplayCost={ productDisplayCost }
						isLoggedIn={ isLoggedIn }
						receiptId={ receiptId }
						translate={ translate }
						siteSlug={ siteSlug }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
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
					/>
				);

			case PROFESSIONAL_EMAIL_UPSELL:
				return (
					<ProfessionalEmailUpsell
						currencyCode={ currencyCode }
						domainName={ upgradeItem }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
						productCost={ productCost }
						/* Use the callback form of setState() to ensure handleClickAccept()
						 is called after the state update */
						setCartItem={ ( newCartItem, callback = noop ) =>
							this.setState( { cartItem: newCartItem }, callback )
						}
					/>
				);
		}
	}

	handleClickDecline = ( shouldHideUpsellNudges = true ) => {
		const { trackUpsellButtonClick, upsellType } = this.props;

		trackUpsellButtonClick( `calypso_${ upsellType.replace( /-/g, '_' ) }_decline_button_click` );

		const getThankYouPageUrlArguments = {
			siteSlug: this.props.siteSlug,
			receiptId: this.props.receiptId || 'noPreviousPurchase',
			cart: this.props.cart,
			hideNudge: shouldHideUpsellNudges,
			isEligibleForSignupDestinationResult: this.props.isEligibleForSignupDestinationResult,
		};

		const url = getThankYouPageUrl( getThankYouPageUrlArguments );

		// Removes the destination cookie only if redirecting to the signup destination.
		// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
		const destinationFromCookie = retrieveSignupDestination();
		if ( url.includes( destinationFromCookie ) ) {
			clearSignupDestinationCookie();
		}

		// If url starts with http, use browser redirect.
		// If url is a route, use page router.
		if ( isURL( url ) ) {
			window.location.href = url;
		} else {
			page.redirect( url );
		}
	};

	handleClickAccept = ( buttonAction ) => {
		const { product, siteSlug, trackUpsellButtonClick, upgradeItem, upsellType } = this.props;

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);

		const productToAdd = PROFESSIONAL_EMAIL_UPSELL === upsellType ? this.state.cartItem : product;

		if ( this.isEligibleForOneClickUpsell( buttonAction ) ) {
			this.setState( {
				showPurchaseModal: true,
			} );
			const storedCard = this.props.cards[ 0 ];
			const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
			const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );
			this.props.shoppingCartManager.updateLocation( {
				countryCode,
				postalCode,
			} );
			this.props.shoppingCartManager.replaceProductsInCart( [ productToAdd ] );
			return;
		}

		// Professional Email needs to add the locally built cartItem to the cart,
		// as we need to handle validation failures before redirecting to checkout.
		if ( PROFESSIONAL_EMAIL_UPSELL === upsellType ) {
			this.props.shoppingCartManager.replaceProductsInCart( [ productToAdd ] ).then( () => {
				const { errors } = this.props?.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}
				page( '/checkout/' + siteSlug );
			} );
			return;
		}

		return siteSlug
			? page( `/checkout/${ upgradeItem }/${ siteSlug }` )
			: page( `/checkout/${ upgradeItem }` );
	};

	isEligibleForOneClickUpsell = ( buttonAction ) => {
		const { product, cards, siteSlug, upsellType } = this.props;
		const { cartItem } = this.state;

		if ( ! product || ( upsellType === PROFESSIONAL_EMAIL_UPSELL && ! cartItem ) ) {
			debug( 'not eligible for one-click upsell because no product exists' );
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

		// stored cards should exist
		if ( cards.length === 0 ) {
			debug( 'not eligible for one-click upsell because there are no cards' );
			return false;
		}

		if ( ! this.state.isContactInfoValid ) {
			debug( 'not eligible for one-click upsell because the contact info is not valid' );
			return false;
		}

		debug( 'eligible for one-click upsell' );
		return true;
	};

	renderPurchaseModal = () => {
		const isCartUpdating = this.props.shoppingCartManager.isPendingUpdate;

		const onCloseModal = () => {
			this.props.shoppingCartManager.replaceProductsInCart( [] );
			this.setState( { showPurchaseModal: false } );
		};

		return (
			<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration }>
				<PurchaseModal
					cart={ this.props.cart }
					cards={ this.props.cards }
					onClose={ onCloseModal }
					siteSlug={ this.props.siteSlug }
					isCartUpdating={ isCartUpdating }
				/>
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

const trackUpsellButtonClick = ( eventName ) => {
	// Track upsell get started / accept / decline events
	return recordTracksEvent( eventName, { section: 'checkout' } );
};

const resolveProductSlug = ( upsellType, productAlias ) => {
	switch ( upsellType ) {
		case BUSINESS_PLAN_UPGRADE_UPSELL:
			return getPlanByPathSlug( productAlias )?.getStoreSlug();
		case PROFESSIONAL_EMAIL_UPSELL:
			return TITAN_MAIL_MONTHLY_SLUG;
		case CONCIERGE_QUICKSTART_SESSION:
		case CONCIERGE_SUPPORT_SESSION:
		default:
			return 'concierge-session';
	}
};

export default connect(
	( state, props ) => {
		const { siteSlugParam, upgradeItem, upsellType } = props;
		const selectedSiteId = getSelectedSiteId( state );
		const productsList = getProductsList( state );
		const sitePlans = getPlansBySiteId( state ).data;
		const siteSlug = selectedSiteId ? getSiteSlug( state, selectedSiteId ) : siteSlugParam;
		const planSlug = getUpgradePlanSlugFromPath( state, selectedSiteId, props.upgradeItem );
		const annualDiscountPrice = getPlanDiscountedRawPrice( state, selectedSiteId, planSlug, {
			isMonthly: false,
		} );
		const annualPrice = getSitePlanRawPrice( state, selectedSiteId, planSlug, {
			isMonthly: false,
		} );

		// If the cards have not started fetching yet, isFetchingStoredCards will be false
		const isFetchingCards = isFetchingStoredCards( state );
		const hasLoadedCardsFromServer = hasLoadedStoredCardsFromServer( state );
		const areStoredCardsLoading = hasLoadedCardsFromServer ? isFetchingCards : true;
		const cards = getStoredCards( state );

		const productSlug = resolveProductSlug( upsellType, upgradeItem );
		const productProperties = pick( getProductBySlug( state, productSlug ), [
			'product_slug',
			'product_id',
		] );
		const product =
			productProperties.product_slug && productProperties.product_id
				? createRequestCartProduct( productProperties )
				: null;

		return {
			isFetchingStoredCards: areStoredCardsLoading,
			cards,
			currencyCode: getCurrentUserCurrencyCode( state ),
			isLoading:
				isFetchingCards ||
				isProductsListFetching( state ) ||
				isRequestingSitePlans( state, selectedSiteId ),
			hasProductsList: Object.keys( productsList ).length > 0,
			hasSitePlans: sitePlans && sitePlans.length > 0,
			product,
			productCost: getProductCost( state, productSlug ),
			productDisplayCost: getProductDisplayCost( state, productSlug ),
			planRawPrice: annualPrice,
			planDiscountedRawPrice: annualDiscountPrice,
			isLoggedIn: isUserLoggedIn( state ),
			siteSlug,
			selectedSiteId,
			hasSevenDayRefundPeriod: isMonthly( planSlug ),
			isEligibleForSignupDestinationResult: isEligibleForSignupDestination( props.cart ),
		};
	},
	{
		trackUpsellButtonClick,
	}
)( withCartKey( withShoppingCart( localize( UpsellNudge ) ) ) );
