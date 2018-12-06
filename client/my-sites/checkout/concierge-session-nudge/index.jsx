/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import QuerySites from 'components/data/query-sites';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import { addItem } from 'lib/upgrades/actions';
import { cartItems } from 'lib/cart-values';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { localize } from 'i18n-calypso';

export class ConciergeSessionNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
	};

	render() {
		const { selectedSiteId } = this.props;
		const title = 'Checkout ‹ Expert Session';

		return (
			<Main className="concierge-session-nudge">
				<PageViewTracker path="/checkout/:site/add-expert-session/:receipt_id" title={ title } />
				<DocumentHead title={ title } />
				<QuerySites siteId={ selectedSiteId } />

				<CompactCard>{ this.header() }</CompactCard>
				<CompactCard>{ this.body() }</CompactCard>
				<CompactCard>{ this.footer() }</CompactCard>
			</Main>
		);
	}

	header() {
		const { translate } = this.props;
		return (
			<header className="concierge-session-nudge__header">
				<h2 className="concierge-session-nudge__title">
					{ translate( 'Congratulations, Your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate } = this.props;
		return (
			<Fragment>
				<div className="concierge-session-nudge__column-pane">
					<div className="concierge-session-nudge__column-content">
						<h4 className="concierge-session-nudge__sub-header">
							{ translate(
								'Want to create a site that looks great, gets traffic, and makes money?'
							) }
						</h4>

						<p>
							<b>
								{ translate(
									'Reserve a 45-minute one-on-one call with a website expert to help you get started on the right foot.'
								) }
							</b>
						</p>

						<p>{ translate( 'What our team of experts can help you with:' ) }</p>

						<p>
							<ul className="concierge-session-nudge__checklist">
								<li className="concierge-session-nudge__checklist-item">
									<Gridicon
										icon="checkmark"
										className="concierge-session-nudge__checklist-item-icon"
									/>
									<span className="concierge-session-nudge__checklist-item-text">
										{ translate( '{{b}}Design:{{/b}} Which template to choose.', {
											components: { b: <b /> },
											comment: "This a benefit on a 'Purchase a call with us' page",
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
											'{{b}}Traffic:{{/b}} How to get free search engine traffic with SEO tools.',
											{
												components: { b: <b /> },
												comment: "This a benefit on a 'Purchase a call with us' page",
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
												comment: "This a benefit on a 'Purchase a call with us' page",
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
												comment: "This a benefit on a 'Purchase a call with us' page",
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
											"{{b}}And more:{{/b}} Tell our experts what you'd like to cover.",
											{
												components: { b: <b /> },
												comment: "This a benefit on a 'Purchase a call with us' page",
											}
										) }
									</span>
								</li>
							</ul>
						</p>

						<h4 className="concierge-session-nudge__sub-header">
							{ translate(
								'Reserve a 45-minute "Quick Start" appointment, and save %(saveAmount)s if you sign up today.',
								{
									args: {
										saveAmount: '$50',
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
											oldPrice: '$150',
											price: '$99',
										},
									}
								) }
							</b>{' '}
							{ translate( 'Click the button below to confirm your purchase.' ) }
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
		const { translate } = this.props;
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
					onClick={ this.handleClickAccept }
				>
					{ translate( 'Reserve a call for $99' ) }
				</Button>
			</footer>
		);
	}

	handleClickDecline = () => {
		const { siteSlug, receiptId, isEligibleForChecklist, trackUpsellButtonClick } = this.props;

		trackUpsellButtonClick( 'decline' );

		page(
			isEligibleForChecklist
				? `/checklist/${ siteSlug }`
				: `/checkout/thank-you/${ siteSlug }/${ receiptId }`
		);
	};

	handleClickAccept = () => {
		const { siteSlug, trackUpsellButtonClick } = this.props;

		trackUpsellButtonClick( 'accept' );

		addItem( cartItems.conciergeSessionItem() );

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

		return {
			siteSlug: getSiteSlug( state, selectedSiteId ),
			isEligibleForChecklist: isEligibleForDotcomChecklist( state, selectedSiteId ),
		};
	},
	{
		trackUpsellButtonClick,
	}
)( localize( ConciergeSessionNudge ) );
