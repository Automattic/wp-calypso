import {
	isMonthly,
	findFirstSimilarPlanKey,
	getPlan as getPlanFromKey,
	getPlanByPathSlug,
	TERM_MONTHLY,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
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
import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from 'calypso/lib/titan/constants';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';
import {
	isContactValidationResponseValid,
	getTaxValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/lib/contact-validation';
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
	getProductCost,
	getProductBySlug,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
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
import { AnnualPlanUpgradeUpsell } from './annual-plan-upgrade-upsell';
import { BusinessPlanUpgradeUpsell } from './business-plan-upgrade-upsell';
import PurchaseModal from './purchase-modal';
import { extractStoredCardMetaValue } from './purchase-modal/util';
import { QuickstartSessionsRetirement } from './quickstart-sessions-retirement';

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
export const ANNUAL_PLAN_UPGRADE = 'annual-plan-upgrade-upsell';

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

	renderProfessionalEmailUpsellPlaceholder() {
		return (
			<>
				<div className="upsell-nudge__placeholders">
					<div>
						<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__hold-tight-placeholder" />
						<div className="upsell-nudge__placeholder-row is-placeholder" />
						<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__price-placeholder" />
					</div>
				</div>
				<div className="upsell-nudge__placeholders upsell-nudge__form-container-placeholder">
					<div className="upsell-nudge__placeholders upsell-nudge__form-placeholder">
						<div>
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<div className="upsell-nudge__placeholder-row is-placeholder" />
							<div className="upsell-nudge__placeholder-button-container">
								<div className="upsell-nudge__placeholder-button is-placeholder" />
								<div className="upsell-nudge__placeholder-button is-placeholder" />
							</div>
						</div>
					</div>
					<div className="upsell-nudge__placeholders upsell-nudge__benefits-placeholder">
						<div>
							<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__feature-placeholder" />
							<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__feature-placeholder" />
							<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__feature-placeholder" />
							<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__feature-placeholder" />
							<div className="upsell-nudge__placeholder-row is-placeholder upsell-nudge__feature-placeholder" />
						</div>
					</div>
				</div>
			</>
		);
	}

	renderPlaceholders() {
		const { upsellType } = this.props;

		if ( upsellType === 'professional-email-upsell' ) {
			return this.renderProfessionalEmailUpsellPlaceholder();
		}
		return this.renderGenericPlaceholder();
	}

	renderContent() {
		const {
			receiptId,
			currencyCode,
			currentPlanTerm,
			productCost,
			planRawPrice,
			planDiscountedRawPrice,
			isLoggedIn,
			upsellType,
			upgradeItem,
			translate,
			siteSlug,
			hasSevenDayRefundPeriod,
			pricePerMonthForMonthlyPlan,
			pricePerMonthForAnnualPlan,
			annualPlanSlug,
		} = this.props;

		switch ( upsellType ) {
			case CONCIERGE_QUICKSTART_SESSION:
			case CONCIERGE_SUPPORT_SESSION:
				return (
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
					/>
				);

			case PROFESSIONAL_EMAIL_UPSELL:
				return (
					<ProfessionalEmailUpsell
						currencyCode={ currencyCode }
						domainName={ upgradeItem }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
						intervalLength={
							currentPlanTerm === TERM_MONTHLY ? IntervalLength.MONTHLY : IntervalLength.ANNUALLY
						}
						productCost={ productCost }
						/* Use the callback form of setState() to ensure handleClickAccept()
						 is called after the state update */
						setCartItem={ ( newCartItem, callback = noop ) =>
							this.setState( { cartItem: newCartItem }, callback )
						}
					/>
				);

			case ANNUAL_PLAN_UPGRADE:
				return (
					<AnnualPlanUpgradeUpsell
						currencyCode={ currencyCode }
						pricePerMonthForMonthlyPlan={ pricePerMonthForMonthlyPlan }
						pricePerMonthForAnnualPlan={ pricePerMonthForAnnualPlan }
						annualPlanSlug={ annualPlanSlug }
						receiptId={ receiptId }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
						upgradeItem={ upgradeItem }
					/>
				);
		}
	}

	getThankYouPageUrlForIncomingCart = ( shouldHideUpsellNudges = true ) => {
		const getThankYouPageUrlArguments = {
			siteSlug: this.props.siteSlug,
			receiptId: this.props.receiptId || 'noPreviousPurchase',
			cart: this.props.cart,
			hideNudge: shouldHideUpsellNudges,
			isEligibleForSignupDestinationResult: this.props.isEligibleForSignupDestinationResult,
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
			// If we don't have an existing destination, calculate the thank you destination for
			// the original cart contents, and only store it if the cart update succeeds.
			const destinationFromCookie = retrieveSignupDestination();
			const destinationToPersist = destinationFromCookie
				? null
				: this.getThankYouPageUrlForIncomingCart( true );

			this.props.shoppingCartManager.replaceProductsInCart( [ productToAdd ] ).then( () => {
				if ( this.props?.cart?.messages ) {
					const { errors } = this.props.cart.messages;
					if ( errors && errors.length ) {
						// Stay on the page to show the relevant error(s)
						return;
					}
				}

				if ( destinationToPersist ) {
					persistSignupDestination( destinationToPersist );
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
			ANNUAL_PLAN_UPGRADE,
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
		const { pricePerMonthForMonthlyPlan, pricePerMonthForAnnualPlan, upsellType } = this.props;
		const isCartUpdating = this.props.shoppingCartManager.isPendingUpdate;

		const onCloseModal = () => {
			this.props.shoppingCartManager.replaceProductsInCart( [] );
			this.setState( { showPurchaseModal: false } );
		};

		let discountRateCopy;
		if ( ANNUAL_PLAN_UPGRADE === upsellType ) {
			const discountRate = Math.ceil(
				100 *
					( ( pricePerMonthForMonthlyPlan - pricePerMonthForAnnualPlan ) /
						pricePerMonthForMonthlyPlan )
			);
			discountRateCopy = `You're saving ${ discountRate }% by paying annually`;
		}

		return (
			<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration }>
				<PurchaseModal
					cart={ this.props.cart }
					cards={ this.props.cards }
					onClose={ onCloseModal }
					siteSlug={ this.props.siteSlug }
					isCartUpdating={ isCartUpdating }
					discountRateCopy={ discountRateCopy }
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

const getProductSlug = ( upsellType, productAlias, planTerm ) => {
	switch ( upsellType ) {
		case BUSINESS_PLAN_UPGRADE_UPSELL:
			return getPlanByPathSlug( productAlias )?.getStoreSlug();

		case ANNUAL_PLAN_UPGRADE:
			return productAlias;

		case PROFESSIONAL_EMAIL_UPSELL:
			return planTerm === TERM_MONTHLY ? TITAN_MAIL_MONTHLY_SLUG : TITAN_MAIL_YEARLY_SLUG;

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

		const currentPlanTerm = getCurrentPlanTerm( state, selectedSiteId ) ?? TERM_MONTHLY;
		const productSlug = getProductSlug( upsellType, upgradeItem, currentPlanTerm );
		const productProperties = pick( getProductBySlug( state, productSlug ), [
			'product_slug',
			'product_id',
		] );
		const product =
			productProperties.product_slug && productProperties.product_id
				? createRequestCartProduct( productProperties )
				: null;

		let pricePerMonthForMonthlyPlan;
		let pricePerMonthForAnnualPlan;
		let annualPlanSlug;
		if ( ANNUAL_PLAN_UPGRADE === upsellType ) {
			const monthlyPlanKey = findFirstSimilarPlanKey( upgradeItem, { term: TERM_MONTHLY } );
			const annualPlanKey = findFirstSimilarPlanKey( upgradeItem, { term: TERM_ANNUALLY } );
			pricePerMonthForMonthlyPlan = getSitePlanRawPrice( state, selectedSiteId, monthlyPlanKey, {
				isMonthly: true,
			} );
			pricePerMonthForAnnualPlan = getSitePlanRawPrice( state, selectedSiteId, annualPlanKey, {
				isMonthly: true,
			} );
			annualPlanSlug = getPlanFromKey( annualPlanKey ).getPathSlug();
		}

		return {
			isFetchingStoredCards: areStoredCardsLoading,
			cards,
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentPlanTerm,
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
			pricePerMonthForMonthlyPlan,
			pricePerMonthForAnnualPlan,
			productSlug,
			annualPlanSlug,
		};
	},
	{
		trackUpsellButtonClick,
	}
)( withCartKey( withShoppingCart( localize( UpsellNudge ) ) ) );
