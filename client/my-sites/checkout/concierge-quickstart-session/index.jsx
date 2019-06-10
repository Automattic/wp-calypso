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
import { conciergeSessionItem } from 'lib/cart-values/cart-items';
import { siteQualifiesForPageBuilder, getEditHomeUrl } from 'lib/signup/page-builder';
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
import { localize } from 'i18n-calypso';
import { isRequestingSitePlans, getPlansBySiteId } from 'state/sites/plans/selectors';
import analytics from 'lib/analytics';

/**
 * Style dependencies
 */
import './style.scss';

export class ConciergeQuickstartSession extends React.Component {
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
		const title = translate( 'Checkout ‹ Support Session', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<Main className="concierge-quickstart-session">
				<PageViewTracker
					path="/checkout/:site/add-quickstart-session/:receipt_id"
					title={ title }
				/>
				<DocumentHead title={ title } />
				<QuerySites siteId={ selectedSiteId } />
				{ ! hasProductsList && <QueryProductsList /> }
				{ ! hasSitePlans && <QuerySitePlans siteId={ selectedSiteId } /> }

				{ isLoading ? (
					this.renderPlaceholders()
				) : (
					<>
						{ receiptId ? (
							<CompactCard className="concierge-quickstart-session__card-header">
								{ this.header() }
							</CompactCard>
						) : (
							''
						) }
						<CompactCard className="concierge-quickstart-session__card-body">
							{ this.body() }
						</CompactCard>
						<CompactCard className="concierge-quickstart-session__card-footer">
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
						<div className="concierge-quickstart-session__header">
							<div className="concierge-quickstart-session__placeholders">
								<div className="concierge-quickstart-session__placeholder-row is-placeholder" />
							</div>
						</div>
					</CompactCard>
				) : (
					''
				) }
				<CompactCard>
					<div className="concierge-quickstart-session__placeholders">
						<>
							<div className="concierge-quickstart-session__placeholder-row is-placeholder" />
							<div className="concierge-quickstart-session__placeholder-row is-placeholder" />
							<div className="concierge-quickstart-session__placeholder-row is-placeholder" />
							<div className="concierge-quickstart-session__placeholder-row is-placeholder" />
						</>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="concierge-quickstart-session__footer">
						<div className="concierge-quickstart-session__placeholders">
							<div className="concierge-quickstart-session__placeholder-button-container">
								<div className="concierge-quickstart-session__placeholder-button is-placeholder" />
								<div className="concierge-quickstart-session__placeholder-button is-placeholder" />
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
			<header className="concierge-quickstart-session__header">
				<h2 className="concierge-quickstart-session__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, productCost, productDisplayCost, currencyCode } = this.props;
		const fullCost = Math.round( productCost * 2.021 );
		return (
			<Fragment>
				<h4 className="concierge-quickstart-session__sub-header">
					{ translate( 'Presenting… a personal WordPress Expert, by your side' ) }
				</h4>
				<div className="concierge-quickstart-session__column-pane">
					<div className="concierge-quickstart-session__column-content">
						<p>
							{ translate(
								"What if you could sit with a true expert, someone who's helped hundreds of people succeed online, and get their advice to build a great site… in less time you ever thought possible?"
							) }
						</p>
						<p>
							<b>
								{ translate( 'Introducing WordPress.com {{em}}Quick Start{{/em}} Sessions.', {
									components: { em: <em /> },
								} ) }
							</b>
						</p>
						<p>
							{ translate(
								"{{em}}Quick Start{{/em}} sessions are 45-minute one-on-one conversations between you and one of our website building experts. They know WordPress inside out and will help you achieve your goals with a smile. That's why we call them Happiness Engineers.",
								{
									components: { em: <em /> },
								}
							) }
						</p>
						<p>
							{ translate(
								'During your {{em}}Quick Start{{/em}}, a Happiness Engineer will offer pro advice on everything you need to build a great site in the fastest way possible, like for example:',
								{
									components: { em: <em /> },
								}
							) }
						</p>
						<ul className="concierge-quickstart-session__checklist">
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate( 'How to choose the right design for your site and audience.', {
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to customize your site with your branding, images, fonts, and colors.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'What content, text, and pages you should have in your site (and why).',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to spread the word and get traffic, likes, and followers for your site.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to establish a solid foundation in your site to prevent headaches and problems.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
						</ul>

						<p>
							{ translate(
								'The session will be tailored entirely to your needs. In the end, not only will you have answers to your questions but you will be 100x more effective on your way to the site you always dreamed!'
							) }
						</p>
						<p>
							<b>
								{ translate(
									'Book your {{em}}Quick Start{{/em}} session below at a special one-time price of {{del}}%(oldPrice)s{{/del}} %(price)s.',
									{
										components: { del: <del />, em: <em /> },
										args: {
											oldPrice: formatCurrency( fullCost, currencyCode ),
											price: productDisplayCost,
										},
									}
								) }
							</b>{' '}
						</p>
						<p>
							{ translate(
								'Please notice, this is a one-time offer because you just got a new plan and we want you to make the most out of it! Regular price for {{em}}Quick Start{{/em}} sessions is %(oldPrice)s.',
								{
									components: { b: <b />, em: <em /> },
									args: {
										oldPrice: formatCurrency( fullCost, currencyCode ),
									},
								}
							) }
						</p>
						<p>
							<em>
								{ translate(
									'Note: {{em}}Quick Start{{/em}} sessions are currently available only in English.',
									{
										components: { em: <em /> },
									}
								) }
							</em>
						</p>
					</div>
					<div className="concierge-quickstart-session__column-doodle">
						<img
							className="concierge-quickstart-session__doodle"
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
			<footer className="concierge-quickstart-session__footer">
				<Button
					className="concierge-quickstart-session__decline-offer-button"
					onClick={ this.handleClickDecline }
				>
					{ translate( "No thanks, I'll do it on my own" ) }
				</Button>
				<Button
					primary
					className="concierge-quickstart-session__accept-offer-button"
					onClick={ this.handleClickAccept }
				>
					{ translate( 'Yes, I want a WordPress Expert by my side!', {
						args: {
							amount: productDisplayCost,
						},
					} ) }
				</Button>
			</footer>
		);
	}

	handleClickDecline = () => {
		const {
			siteSlug,
			receiptId,
			isEligibleForChecklist,
			trackUpsellButtonClick,
			redirectToPageBuilder,
		} = this.props;

		trackUpsellButtonClick( 'decline' );

		if ( ! receiptId ) {
			// Send the user to a generic page (not post-purchase related).
			page( `/stats/day/${ siteSlug }` );
		} else if ( isEligibleForChecklist ) {
			if ( redirectToPageBuilder ) {
				return page( getEditHomeUrl( siteSlug ) );
			}
			analytics.tracks.recordEvent( 'calypso_checklist_assign', {
				site: siteSlug,
				plan: 'paid',
			} );
			page( `/checklist/${ siteSlug }` );
		} else {
			page( `/checkout/thank-you/${ siteSlug }/${ receiptId }` );
		}
	};

	handleClickAccept = () => {
		const { siteSlug, trackUpsellButtonClick } = this.props;

		trackUpsellButtonClick( 'accept' );

		addItem( conciergeSessionItem() );

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
		};
	},
	{
		trackUpsellButtonClick,
	}
)( localize( ConciergeQuickstartSession ) );
