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

/**
 * Style dependencies
 */
import './style.scss';

export class ConciergeQuickstartSession extends React.Component {
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
		const title = translate( 'Checkout ‹ Quick Start Session', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<Main className="concierge-quickstart-session">
				<PageViewTracker
					path="/checkout/:site/offer-quickstart-session/:receipt_id"
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
		const { translate, productDisplayCost, isLoggedIn } = this.props;
		return (
			<footer className="concierge-quickstart-session__footer">
				{ ! isLoggedIn && (
					<Button
						primary
						className="concierge-quickstart-session__get-started-button"
						onClick={ () => this.handleClickAccept( 'get_started' ) }
					>
						{ translate( 'Get Started!' ) }
					</Button>
				) }
				{ isLoggedIn && (
					<>
						<Button
							className="concierge-quickstart-session__decline-offer-button"
							onClick={ this.handleClickDecline }
						>
							{ translate( "No thanks, I'll do it on my own" ) }
						</Button>
						<Button
							primary
							className="concierge-quickstart-session__accept-offer-button"
							onClick={ () => this.handleClickAccept( 'accept' ) }
						>
							{ translate( 'Yes, I want a WordPress Expert by my side!', {
								args: {
									amount: productDisplayCost,
								},
							} ) }
						</Button>
					</>
				) }
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

		trackUpsellButtonClick( `calypso_offer_quickstart_upsell_${ buttonAction }_button_click` );
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
)( localize( ConciergeQuickstartSession ) );
