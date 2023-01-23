import { isMonthly, getPlanByPathSlug, TERM_MONTHLY } from '@automattic/calypso-products';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CompactCard, Gridicon } from '@automattic/components';
import { withShoppingCart, createRequestCartProduct } from '@automattic/shopping-cart';
import { isURL } from '@wordpress/url';
import debugFactory from 'debug';
import { localize, useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import Main from 'calypso/components/main';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from 'calypso/lib/titan/constants';
import {
	isContactValidationResponseValid,
	getTaxValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/lib/contact-validation';
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
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isFetchingStoredCards,
	getStoredCards,
	hasLoadedStoredCardsFromServer,
} from 'calypso/state/stored-cards/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { BusinessPlanUpgradeUpsell } from './business-plan-upgrade-upsell';
import PurchaseModal from './purchase-modal';
import { extractStoredCardMetaValue } from './purchase-modal/util';
import { QuickstartSessionsRetirement } from './quickstart-sessions-retirement';
import type { WithShoppingCartProps, MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PaymentMethod } from 'calypso/lib/checkout/payment-methods';

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
	planRawPrice?: number;
	planDiscountedRawPrice?: number;
	isLoggedIn?: boolean;
	siteSlug?: string | null;
	selectedSiteId: string | number | undefined | null;
	hasSevenDayRefundPeriod?: boolean;
	trackUpsellButtonClick: ( key: string ) => void;
	translate: ReturnType< typeof useTranslate >;
	cards: PaymentMethod[];
	currentPlanTerm: string;
}

export type UpsellNudgeProps = UpsellNudgeManualProps & UpsellNudgeAutomaticProps;

interface UpsellNudgeState {
	cartItem: MinimalRequestCartProduct | null;
	showPurchaseModal: boolean;
	isContactInfoValid: boolean;
}

export class UpsellNudge extends Component< UpsellNudgeProps, UpsellNudgeState > {
	lastCardIds: string[] | undefined = undefined;

	state: UpsellNudgeState = {
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
		const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' ) ?? '';
		const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' ) ?? '';

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
			if ( ! this.lastCardIds?.includes( id ) ) {
				this.lastCardIds = cardIds;
				return true;
			}
		} );
		this.lastCardIds = cardIds;
		return false;
	};

	render() {
		const { selectedSiteId, hasProductsList, hasSitePlans, upsellType } = this.props;
		const styleClass =
			BUSINESS_PLAN_UPGRADE_UPSELL === upsellType
				? 'business-plan-upgrade-upsell-new-design is-wide-layout'
				: upsellType;
		return (
			<Main className={ styleClass }>
				<QuerySites siteId={ selectedSiteId } />
				<QueryStoredCards />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ parseInt( String( selectedSiteId ), 10 ) } /> }
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
			isLoading,
		} = this.props;

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
				return isLoading ? (
					this.renderGenericPlaceholder()
				) : (
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
						currencyCode={ currencyCode ?? 'USD' }
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

	handleClickAccept = ( buttonAction: string ) => {
		const { product, siteSlug, trackUpsellButtonClick, upgradeItem, upsellType } = this.props;

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);

		let productToAdd = product;
		if ( PROFESSIONAL_EMAIL_UPSELL === upsellType && this.state.cartItem ) {
			productToAdd = this.state.cartItem;
		}

		if ( this.isEligibleForOneClickUpsell( buttonAction ) && productToAdd ) {
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
			this.props.shoppingCartManager.replaceProductsInCart( [ productToAdd ] ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
			return;
		}

		// Professional Email needs to add the locally built cartItem to the cart,
		// as we need to handle validation failures before redirecting to checkout.
		if ( PROFESSIONAL_EMAIL_UPSELL === upsellType && productToAdd ) {
			// If we don't have an existing destination, calculate the thank you destination for
			// the original cart contents, and only store it if the cart update succeeds.
			const destinationFromCookie = retrieveSignupDestination();
			const destinationToPersist = destinationFromCookie
				? null
				: this.getThankYouPageUrlForIncomingCart( true );

			this.props.shoppingCartManager
				.replaceProductsInCart( [ productToAdd ] )
				.then( () => {
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
				} )
				.catch( () => {
					// Nothing needs to be done here. CartMessages will display the error to the user.
				} );
			return;
		}

		return siteSlug
			? page( `/checkout/${ upgradeItem }/${ siteSlug }` )
			: page( `/checkout/${ upgradeItem }` );
	};

	isEligibleForOneClickUpsell = ( buttonAction: string ) => {
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

		if ( ! this.props.siteSlug ) {
			return null;
		}

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
	( state: UpsellNudgeState, props: UpsellNudgeManualProps ) => {
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
			isMonthly: false,
		} );
		const annualPrice = getSitePlanRawPrice( state, selectedSiteId ?? 0, planSlug, {
			isMonthly: false,
		} );

		// If the cards have not started fetching yet, isFetchingStoredCards will be false
		const isFetchingCards = isFetchingStoredCards( state );
		const hasLoadedCardsFromServer = hasLoadedStoredCardsFromServer( state );
		const areStoredCardsLoading = hasLoadedCardsFromServer ? isFetchingCards : true;
		const cards = getStoredCards( state );

		const currentPlanTerm = getCurrentPlanTerm( state, selectedSiteId ?? 0 ) ?? TERM_MONTHLY;
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
			cards,
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentPlanTerm,
			isLoading:
				areStoredCardsLoading ||
				isProductsListFetching( state ) ||
				isRequestingSitePlans( state, selectedSiteId ),
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
)( withCartKey( withShoppingCart( localize( UpsellNudge ) ) ) );
