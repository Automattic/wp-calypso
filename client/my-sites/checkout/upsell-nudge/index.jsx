/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QuerySites from 'components/data/query-sites';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import CompactCard from 'components/card/compact';
import { getCurrentUserCurrencyCode, isUserLoggedIn } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getProductsList,
	getProductDisplayCost,
	getProductCost,
	isProductsListFetching,
} from 'state/products-list/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import { isRequestingSitePlans, getPlansBySiteId } from 'state/sites/plans/selectors';
import { ConciergeQuickstartSession } from './concierge-quickstart-session';
import { ConciergeSupportSession } from './concierge-support-session';

/**
 * Style dependencies
 */
import './style.scss';

export class UpsellNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number,
		handleCheckoutCompleteRedirect: PropTypes.func.isRequired,
	};

	render() {
		const { selectedSiteId, isLoading, hasProductsList, hasSitePlans, upsellType } = this.props;

		return (
			<Main className={ upsellType }>
				<QuerySites siteId={ selectedSiteId } />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ selectedSiteId } /> }
				{ isLoading ? this.renderPlaceholders() : this.renderContent() }
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
			isLoggedIn,
			upsellType,
			translate,
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
						handleClickAccept={ this.handleClickAccept }
						handleClickDecline={ this.handleClickDecline }
					/>
				);
		}
	}

	handleClickDecline = () => {
		const { trackUpsellButtonClick, upsellType, handleCheckoutCompleteRedirect } = this.props;

		trackUpsellButtonClick( `calypso_${ upsellType.replace( /-/g, '_' ) }_decline_button_click` );
		handleCheckoutCompleteRedirect();
	};

	handleClickAccept = buttonAction => {
		const { trackUpsellButtonClick, upsellType, siteSlug } = this.props;

		trackUpsellButtonClick(
			`calypso_${ upsellType.replace( /-/g, '_' ) }_${ buttonAction }_button_click`
		);
		page( `/checkout/${ siteSlug }/concierge-session` );
	};
}

const trackUpsellButtonClick = eventName => {
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
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			isLoading: isProductsListFetching( state ) || isRequestingSitePlans( state, selectedSiteId ),
			hasProductsList: Object.keys( productsList ).length > 0,
			hasSitePlans: sitePlans && sitePlans.length > 0,
			productCost: getProductCost( state, 'concierge-session' ),
			productDisplayCost: getProductDisplayCost( state, 'concierge-session' ),
			isLoggedIn: isUserLoggedIn( state ),
			siteSlug,
			selectedSiteId,
		};
	},
	{
		trackUpsellButtonClick,
	}
)( localize( UpsellNudge ) );
