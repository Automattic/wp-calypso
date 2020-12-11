/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';
import { pick } from 'lodash';
import { withShoppingCart, createRequestCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import QuerySites from 'calypso/components/data/query-sites';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { CompactCard } from '@automattic/components';
import { getCurrentUserCurrencyCode, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getProductsList,
	getProductDisplayCost,
	getProductCost,
	getProductBySlug,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { localize } from 'i18n-calypso';
import {
	isRequestingSitePlans,
	getPlansBySiteId,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { ConciergeQuickstartSession } from './concierge-quickstart-session';
import { ConciergeSupportSession } from './concierge-support-session';
import { BusinessPlanUpgradeUpsell } from './business-plan-upgrade-upsell';
import { PremiumPlanUpgradeUpsell } from './premium-plan-upgrade-upsell';
import getUpgradePlanSlugFromPath from 'calypso/state/selectors/get-upgrade-plan-slug-from-path';
import PurchaseModal from './purchase-modal';
import Gridicon from 'calypso/components/gridicon';
import { isMonthly } from 'calypso/lib/plans/constants';
import { getPlanByPathSlug } from 'calypso/lib/plans';
import { isFetchingStoredCards, getStoredCards } from 'calypso/state/stored-cards/selectors';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';
import { extractStoredCardMetaValue } from './purchase-modal/util';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Upsell Types
 */
export const CONCIERGE_QUICKSTART_SESSION = 'concierge-quickstart-session';
export const CONCIERGE_SUPPORT_SESSION = 'concierge-support-session';
export const PREMIUM_PLAN_UPGRADE_UPSELL = 'premium-plan-upgrade-upsell';
export const BUSINESS_PLAN_UPGRADE_UPSELL = 'business-plan-upgrade-upsell';

export class UpsellNudge extends React.Component {
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
		showPurchaseModal: false,
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

			case PREMIUM_PLAN_UPGRADE_UPSELL:
				return (
					<PremiumPlanUpgradeUpsell
						currencyCode={ currencyCode }
						planRawPrice={ planRawPrice }
						planDiscountedRawPrice={ planDiscountedRawPrice }
						receiptId={ receiptId }
						translate={ translate }
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
					/>
				);
		}
	}

	handleClickDecline = ( shouldHideUpsellNudges = true ) => {
		const { trackUpsellButtonClick, upsellType } = this.props;

		trackUpsellButtonClick( `calypso_${ upsellType.replace( /-/g, '_' ) }_decline_button_click` );
		const getThankYouPageUrlArguments = {
			siteSlug: this.props.siteSlug,
			cart: this.props.cart,
			hideNudge: shouldHideUpsellNudges,
		};
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		page.redirect( url );
	};

	handleClickAccept = ( buttonAction ) => {
		const { trackUpsellButtonClick, upsellType, siteSlug, upgradeItem } = this.props;

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);

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
				subdivisionCode: null,
			} );
			this.props.shoppingCartManager.replaceProductsInCart( [ this.props.product ] );
			return;
		}

		return siteSlug
			? page( `/checkout/${ upgradeItem }/${ siteSlug }` )
			: page( `/checkout/${ upgradeItem }` );
	};

	isEligibleForOneClickUpsell = ( buttonAction ) => {
		const { product, cards, siteSlug, upsellType } = this.props;
		
		if ( ! product ) {
			return false;
		}

		const supportedUpsellTypes = [
			CONCIERGE_QUICKSTART_SESSION,
			PREMIUM_PLAN_UPGRADE_UPSELL,
			BUSINESS_PLAN_UPGRADE_UPSELL,
		];
		if ( 'accept' !== buttonAction || ! supportedUpsellTypes.includes( upsellType ) ) {
			return false;
		}

		if ( ! siteSlug ) {
			return false;
		}

		// stored cards should exist
		if ( cards.length === 0 ) {
			return false;
		}

		return true;
	};

	renderPurchaseModal = () => {
		const isCartUpdating = this.props.shoppingCartManager.isPendingUpdate;

		return (
			<PurchaseModal
				cart={ this.props.cart }
				cards={ this.props.cards }
				onClose={ () => this.setState( { showPurchaseModal: false } ) }
				siteId={ this.props.selectedSiteId }
				siteSlug={ this.props.siteSlug }
				isCartUpdating={ isCartUpdating }
			/>
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
		case PREMIUM_PLAN_UPGRADE_UPSELL:
		case BUSINESS_PLAN_UPGRADE_UPSELL:
			return getPlanByPathSlug( productAlias )?.getStoreSlug();
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
		const isFetchingCards = isFetchingStoredCards( state );
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
			isFetchingStoredCards: isFetchingCards,
			cards: getStoredCards( state ),
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
		};
	},
	{
		trackUpsellButtonClick,
	}
)( withShoppingCart( localize( UpsellNudge ) ) );
