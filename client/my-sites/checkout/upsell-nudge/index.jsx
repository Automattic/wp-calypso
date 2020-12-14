/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import QuerySites from 'calypso/components/data/query-sites';
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
import { PurchaseModal } from './purchase-modal';
import { replaceCartWithItems } from 'calypso/lib/cart/actions';
import Gridicon from 'calypso/components/gridicon';
import { isMonthly } from 'calypso/lib/plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

export class UpsellNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number,
		handleCheckoutCompleteRedirect: PropTypes.func.isRequired,
	};

	state = {
		showPurchaseModal: false,
	};

	render() {
		const { selectedSiteId, isLoading, hasProductsList, hasSitePlans, upsellType } = this.props;

		return (
			<Main className={ upsellType }>
				<QuerySites siteId={ selectedSiteId } />
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
			case 'concierge-quickstart-session':
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

			case 'concierge-support-session':
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

			case 'business-plan-upgrade-upsell':
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

			case 'premium-plan-upgrade-upsell':
				return (
					<PremiumPlanUpgradeUpsell
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
		}
	}

	handleClickDecline = ( shouldHideUpsellNudges = true ) => {
		const { trackUpsellButtonClick, upsellType, handleCheckoutCompleteRedirect } = this.props;

		trackUpsellButtonClick( `calypso_${ upsellType.replace( /-/g, '_' ) }_decline_button_click` );
		handleCheckoutCompleteRedirect( shouldHideUpsellNudges );
	};

	handleClickAccept = ( buttonAction ) => {
		const { trackUpsellButtonClick, upsellType, siteSlug, upgradeItem } = this.props;

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);

		if ( this.isEligibleForOneClickUpsell( buttonAction ) ) {
			this.setState( {
				showPurchaseModal: true,
				cartLastServerResponseDate: this.getCartUpdatedTime(),
			} );
			replaceCartWithItems( [ this.props.product ] );
			return;
		}

		return siteSlug
			? page( `/checkout/${ upgradeItem }/${ siteSlug }` )
			: page( `/checkout/${ upgradeItem }` );
	};

	isEligibleForOneClickUpsell = ( buttonAction ) => {
		const { cards, siteSlug, upsellType } = this.props;

		if ( 'accept' !== buttonAction || 'concierge-quickstart-session' !== upsellType ) {
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

	handleOneClickUpsellComplete = () => {
		this.props.handleCheckoutCompleteRedirect( true );
	};

	renderPurchaseModal = () => {
		const isCartUpdating = this.state.cartLastServerResponseDate === this.getCartUpdatedTime();

		return (
			<PurchaseModal
				cart={ this.props.cart }
				cards={ this.props.cards }
				onComplete={ this.handleOneClickUpsellComplete }
				onClose={ () => this.setState( { showPurchaseModal: false } ) }
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

	getCartUpdatedTime = () => {
		return this.props.cart?.client_metadata?.last_server_response_date;
	};
}

const trackUpsellButtonClick = ( eventName ) => {
	// Track upsell get started / accept / decline events
	return recordTracksEvent( eventName, { section: 'checkout' } );
};

export default connect(
	( state, props ) => {
		const { siteSlugParam } = props;
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

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			isLoading:
				props.isFetchingStoredCards ||
				isProductsListFetching( state ) ||
				isRequestingSitePlans( state, selectedSiteId ),
			hasProductsList: Object.keys( productsList ).length > 0,
			hasSitePlans: sitePlans && sitePlans.length > 0,
			product: omit( getProductBySlug( state, 'concierge-session' ), 'prices' ),
			productCost: getProductCost( state, 'concierge-session' ),
			productDisplayCost: getProductDisplayCost( state, 'concierge-session' ),
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
)( localize( UpsellNudge ) );
