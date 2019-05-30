/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import page from 'page';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import QuerySites from 'components/data/query-sites';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import { addItem } from 'lib/upgrades/actions';
import { planItem as getCartItemForPlan } from 'lib/cart-values/cart-items';
import { siteQualifiesForPageBuilder } from 'lib/signup/page-builder';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	getProductsList,
	getProductDisplayCost,
	getProductCost,
	isProductsListFetching,
} from 'state/products-list/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { localize } from 'i18n-calypso';
import { isRequestingSitePlans, getPlansBySiteId } from 'state/sites/plans/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanUpgradeNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number,
		selectedSiteId: PropTypes.number.isRequired,
	};

	render() {
		const {
			selectedSiteId,
			isLoading,
			hasProductsList,
			hasSitePlans,
			translate,
			receiptId,
		} = this.props;
		const title = translate( 'Checkout ‹ Plan Upgrade', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<Main className="plan-upgrade-nudge">
				<PageViewTracker path="/checkout/:site/plan-upgrade-nudge/:receipt_id" title={ title } />
				<DocumentHead title={ title } />
				<QuerySites siteId={ selectedSiteId } />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ selectedSiteId } /> }

				{ isLoading ? (
					this.renderPlaceholders()
				) : (
					<>
						{ receiptId ? (
							<CompactCard className="plan-upgrade-nudge__card-header">
								{ this.header() }
							</CompactCard>
						) : (
							''
						) }
						<CompactCard className="plan-upgrade-nudge__card-body">{ this.body() }</CompactCard>
						<CompactCard className="plan-upgrade-nudge__card-footer">{ this.footer() }</CompactCard>
					</>
				) }
			</Main>
		);
	}

	renderPlaceholders() {
		const { receiptId } = this.props;
		return (
			<>
				{ receiptId ? (
					<CompactCard>
						<div className="plan-upgrade-nudge__header">
							<div className="plan-upgrade-nudge__placeholders">
								<div className="plan-upgrade-nudge__placeholder-row is-placeholder" />
							</div>
						</div>
					</CompactCard>
				) : (
					''
				) }
				<CompactCard>
					<div className="plan-upgrade-nudge__placeholders">
						<>
							<div className="plan-upgrade-nudge__placeholder-row is-placeholder" />
							<div className="plan-upgrade-nudge__placeholder-row is-placeholder" />
							<div className="plan-upgrade-nudge__placeholder-row is-placeholder" />
							<div className="plan-upgrade-nudge__placeholder-row is-placeholder" />
						</>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="plan-upgrade-nudge__footer">
						<div className="plan-upgrade-nudge__placeholders">
							<div className="plan-upgrade-nudge__placeholder-button-container">
								<div className="plan-upgrade-nudge__placeholder-button is-placeholder" />
								<div className="plan-upgrade-nudge__placeholder-button is-placeholder" />
							</div>
						</div>
					</div>
				</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;
		return (
			<header className="plan-upgrade-nudge__header">
				<h2 className="plan-upgrade-nudge__title">
					{ translate( 'Congratulations, we have an offer for you.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, productCost, productDisplayCost, currencyCode } = this.props;
		// Full cost should be 150% of base cost
		const fullCost = Math.round( productCost * 1.5 );
		const savings = fullCost - productCost;
		return (
			<Fragment>
				<div className="plan-upgrade-nudge__column-pane">
					<div className="plan-upgrade-nudge__column-content">
						<h4 className="plan-upgrade-nudge__sub-header">
							{ translate( 'Do you want to upgrade your site?' ) }
						</h4>

						<p>
							<b>{ translate( 'Upgrade your site to Premium.' ) }</b>
						</p>

						<p>{ translate( 'What you get out of the upgrade:' ) }</p>

						<ul className="plan-upgrade-nudge__checklist">
							<li className="plan-upgrade-nudge__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-nudge__checklist-item-icon" />
								<span className="plan-upgrade-nudge__checklist-item-text">
									{ translate( '{{b}}Feature:{{/b}} Feature description.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="plan-upgrade-nudge__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-nudge__checklist-item-icon" />
								<span className="plan-upgrade-nudge__checklist-item-text">
									{ translate( '{{b}}Feature:{{/b}} Feature description.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="plan-upgrade-nudge__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-nudge__checklist-item-icon" />
								<span className="plan-upgrade-nudge__checklist-item-text">
									{ translate( '{{b}}Feature:{{/b}} Feature description.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="plan-upgrade-nudge__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-nudge__checklist-item-icon" />
								<span className="plan-upgrade-nudge__checklist-item-text">
									{ translate( '{{b}}Feature:{{/b}} Feature description.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="plan-upgrade-nudge__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-nudge__checklist-item-icon" />
								<span className="plan-upgrade-nudge__checklist-item-text">
									{ translate( '{{b}}And more:{{/b}} Feature description.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
						</ul>

						<h4 className="plan-upgrade-nudge__sub-header">
							{ translate( 'Upgrade your plan, and save %(saveAmount)s if you sign up today.', {
								args: {
									saveAmount: formatCurrency( savings, currencyCode ),
								},
							} ) }
						</h4>

						<p>
							<b>
								{ translate( 'Upgrade your plan for just {{del}}%(oldPrice)s{{/del}} %(price)s.', {
									components: { del: <del /> },
									args: {
										oldPrice: formatCurrency( fullCost, currencyCode ),
										price: productDisplayCost,
									},
								} ) }
							</b>{' '}
							{ translate( 'Click the button below to confirm your purchase.' ) }
						</p>
					</div>
					<div className="plan-upgrade-nudge__column-doodle">
						<img
							className="plan-upgrade-nudge__doodle"
							alt=""
							src="/calypso/images/illustrations/support.svg"
						/>
					</div>
				</div>
			</Fragment>
		);
	}

	footer() {
		const { translate, productDisplayCost } = this.props;
		return (
			<footer className="plan-upgrade-nudge__footer">
				<Button
					className="plan-upgrade-nudge__decline-offer-button"
					onClick={ this.handleClickDecline }
				>
					{ translate( 'Skip' ) }
				</Button>
				<Button
					primary
					className="plan-upgrade-nudge__accept-offer-button"
					onClick={ this.handleClickAccept }
				>
					{ translate( 'Upgrade now for %(amount)s', {
						args: {
							amount: productDisplayCost,
						},
					} ) }
				</Button>
			</footer>
		);
	}

	handleClickDecline = () => {
		const { trackUpsellButtonClick } = this.props;

		trackUpsellButtonClick( 'decline' );
		this.props.handleClickDecline();
	};

	handleClickAccept = () => {
		const { siteSlug, trackUpsellButtonClick, planSlug } = this.props;

		const cartItem = getCartItemForPlan( planSlug );
		addItem( cartItem );

		trackUpsellButtonClick( 'accept' );

		page( `/checkout/${ siteSlug }` );
	};
}

const trackUpsellButtonClick = buttonAction => {
	// Track calypso_concierge_session_upsell_decline_button_click and calypso_concierge_session_upsell_accept_button_click events
	return recordTracksEvent( `calypso_concierge_session_upsell_${ buttonAction }_button_click`, {
		section: 'checkout',
	} );
};

export default connect(
	( state, props ) => {
		const { selectedSiteId } = props;
		const productsList = getProductsList( state );
		const sitePlans = getPlansBySiteId( state ).data;
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			isLoading: isProductsListFetching( state ) || isRequestingSitePlans( state, selectedSiteId ),
			hasProductsList: Object.keys( productsList ).length > 0,
			hasSitePlans: sitePlans && sitePlans.length > 0,
			siteSlug: getSiteSlug( state, selectedSiteId ),
			isEligibleForChecklist: isEligibleForDotcomChecklist( state, selectedSiteId ),
			redirectToPageBuilder: siteQualifiesForPageBuilder( state, selectedSiteId ),
			productCost: getProductCost( state, 'concierge-session' ),
			productDisplayCost: getProductDisplayCost( state, 'concierge-session' ),
			planSlug: getUpgradePlanSlugFromPath( state, selectedSiteId, props.product ),
		};
	},
	{
		trackUpsellButtonClick,
	}
)( localize( PlanUpgradeNudge ) );
