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
import { siteQualifiesForPageBuilder } from 'lib/signup/page-builder';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
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

/**
 * Style dependencies
 */
import './style.scss';

export class ConciergeSessionNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number,
		handleCheckoutCompleteRedirect: PropTypes.func.isRequired,
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
		const title = translate( 'Checkout ‹ Support Session', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<Main className="concierge-session-nudge">
				<PageViewTracker path="/checkout/:site/add-support-session/:receipt_id" title={ title } />
				<DocumentHead title={ title } />
				<QuerySites siteId={ selectedSiteId } />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ selectedSiteId } /> }

				{ isLoading ? (
					this.renderPlaceholders()
				) : (
					<>
						{ receiptId ? (
							<CompactCard className="concierge-session-nudge__card-header">
								{ this.header() }
							</CompactCard>
						) : (
							''
						) }
						<CompactCard className="concierge-session-nudge__card-body">
							{ this.body() }
						</CompactCard>
						<CompactCard className="concierge-session-nudge__card-footer">
							{ this.footer() }
						</CompactCard>
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
						<div className="concierge-session-nudge__header">
							<div className="concierge-session-nudge__placeholders">
								<div className="concierge-session-nudge__placeholder-row is-placeholder" />
							</div>
						</div>
					</CompactCard>
				) : (
					''
				) }
				<CompactCard>
					<div className="concierge-session-nudge__placeholders">
						<>
							<div className="concierge-session-nudge__placeholder-row is-placeholder" />
							<div className="concierge-session-nudge__placeholder-row is-placeholder" />
							<div className="concierge-session-nudge__placeholder-row is-placeholder" />
							<div className="concierge-session-nudge__placeholder-row is-placeholder" />
						</>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="concierge-session-nudge__footer">
						<div className="concierge-session-nudge__placeholders">
							<div className="concierge-session-nudge__placeholder-button-container">
								<div className="concierge-session-nudge__placeholder-button is-placeholder" />
								<div className="concierge-session-nudge__placeholder-button is-placeholder" />
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
			<header className="concierge-session-nudge__header">
				<h2 className="concierge-session-nudge__title">
					{ translate( 'Congratulations, your site is being upgraded.' ) }
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
				<div className="concierge-session-nudge__column-pane">
					<div className="concierge-session-nudge__column-content">
						<h4 className="concierge-session-nudge__sub-header">
							{ translate( 'Do you need some help building your site?' ) }
						</h4>

						<p>
							<b>
								{ translate(
									'Reserve a 45-minute one-on-one call with a website expert to help you get started on the right foot.'
								) }
							</b>
						</p>

						<p>{ translate( 'What our team of experts can help you with:' ) }</p>

						<ul className="concierge-session-nudge__checklist">
							<li className="concierge-session-nudge__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-session-nudge__checklist-item-icon"
								/>
								<span className="concierge-session-nudge__checklist-item-text">
									{ translate( '{{b}}Design:{{/b}} Which template to choose.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="concierge-session-nudge__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-session-nudge__checklist-item-icon"
								/>
								<span className="concierge-session-nudge__checklist-item-text">
									{ translate(
										'{{b}}Traffic:{{/b}} How to make your site search-engine friendly.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-session-nudge__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-session-nudge__checklist-item-icon"
								/>
								<span className="concierge-session-nudge__checklist-item-text">
									{ translate(
										"{{b}}Site building tools:{{/b}} Learn how to create a site you're proud to share.",
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-session-nudge__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-session-nudge__checklist-item-icon"
								/>
								<span className="concierge-session-nudge__checklist-item-text">
									{ translate(
										'{{b}}Content:{{/b}} What information to include and where it should go.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-session-nudge__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-session-nudge__checklist-item-icon"
								/>
								<span className="concierge-session-nudge__checklist-item-text">
									{ translate( "{{b}}And more:{{/b}} Tell our experts what you'd like to cover.", {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
						</ul>

						<h4 className="concierge-session-nudge__sub-header">
							{ translate(
								'Reserve a 45-minute "Quick Start" appointment, and save %(saveAmount)s if you sign up today.',
								{
									args: {
										saveAmount: formatCurrency( savings, currencyCode ),
									},
								}
							) }
						</h4>

						<p>
							<b>
								{ translate(
									'Book your call today for just {{del}}%(oldPrice)s{{/del}} %(price)s.',
									{
										components: { del: <del /> },
										args: {
											oldPrice: formatCurrency( fullCost, currencyCode ),
											price: productDisplayCost,
										},
									}
								) }
							</b>{' '}
							{ translate(
								'Click the button below to confirm your purchase (sessions are currently limited to English language support).'
							) }
						</p>
					</div>
					<div className="concierge-session-nudge__column-doodle">
						<img
							className="concierge-session-nudge__doodle"
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
			<footer className="concierge-session-nudge__footer">
				<Button
					className="concierge-session-nudge__decline-offer-button"
					onClick={ this.handleClickDecline }
				>
					{ translate( 'Skip' ) }
				</Button>
				<Button
					primary
					className="concierge-session-nudge__accept-offer-button"
					onClick={ () => this.handleClickAccept( 'accept' ) }
				>
					{ translate( 'Reserve a call for %(amount)s', {
						args: {
							amount: productDisplayCost,
						},
					} ) }
				</Button>
			</footer>
		);
	}

	handleClickDecline = () => {
		const { trackUpsellButtonClick, handleCheckoutCompleteRedirect } = this.props;

		trackUpsellButtonClick( 'decline' );
		handleCheckoutCompleteRedirect();
	};

	handleClickAccept = buttonAction => {
		const { trackUpsellButtonClick, siteSlug } = this.props;

		trackUpsellButtonClick( `calypso_concierge_session_upsell_${ buttonAction }_button_click` );
		page( `/checkout/${ siteSlug }/concierge-session` );
	};
}

const trackUpsellButtonClick = eventName => {
	// Track concierge session get started / accept / decline events
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
			isEligibleForChecklist: isEligibleForDotcomChecklist( state, selectedSiteId ),
			redirectToPageBuilder: siteQualifiesForPageBuilder( state, selectedSiteId ),
			productCost: getProductCost( state, 'concierge-session' ),
			productDisplayCost: getProductDisplayCost( state, 'concierge-session' ),
			siteSlug,
			selectedSiteId,
		};
	},
	{
		trackUpsellButtonClick,
	}
)( localize( ConciergeSessionNudge ) );
