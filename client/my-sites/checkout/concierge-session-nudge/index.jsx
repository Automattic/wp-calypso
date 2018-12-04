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

/*
 * There are no translate() calls in this file because it's launching only to
 * EN audience
 */
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
		return (
			<header className="concierge-session-nudge__header">
				<h2 className="concierge-session-nudge__title">
					Congratulations, Your site is being upgraded.
				</h2>
			</header>
		);
	}

	body() {
		return (
			<Fragment>
				<h4 className="concierge-session-nudge__sub-header">
					Want to create a site that looks great, gets traffic, and makes money?
				</h4>

				<p>
					<b>
						Reserve a 45-minute one-on-one call with a website expert to help you get started on the
						right foot.
					</b>
				</p>

				<p>What our team of experts can help you with:</p>

				<p>
					<ul className="concierge-session-nudge__checklist">
						<li className="concierge-session-nudge__checklist-item">
							<Gridicon icon="checkmark" className="concierge-session-nudge__checklist-item-icon" />
							<span className="concierge-session-nudge__checklist-item-text">
								<b>Design:</b> Which template to choose.
							</span>
						</li>
						<li className="concierge-session-nudge__checklist-item">
							<Gridicon icon="checkmark" className="concierge-session-nudge__checklist-item-icon" />
							<span className="concierge-session-nudge__checklist-item-text">
								<b>Traffic:</b> How to get free search engine traffic with SEO tools.
							</span>
						</li>
						<li className="concierge-session-nudge__checklist-item">
							<Gridicon icon="checkmark" className="concierge-session-nudge__checklist-item-icon" />
							<span className="concierge-session-nudge__checklist-item-text">
								<b>Site building tools:</b> Learn how to create a site you're proud to share.
							</span>
						</li>
						<li className="concierge-session-nudge__checklist-item">
							<Gridicon icon="checkmark" className="concierge-session-nudge__checklist-item-icon" />
							<span className="concierge-session-nudge__checklist-item-text">
								<b>Content:</b> What information to include and where it should go.
							</span>
						</li>
						<li className="concierge-session-nudge__checklist-item">
							<Gridicon icon="checkmark" className="concierge-session-nudge__checklist-item-icon" />
							<span className="concierge-session-nudge__checklist-item-text">
								<b>And more:</b> Tell our experts what you'd like to cover.
							</span>
						</li>
					</ul>
				</p>

				<h4 className="concierge-session-nudge__sub-header">
					Reserve a 45-minute &ldquo;Quick Start&rdquo; appointment, and save $50 if you sign up
					today.
				</h4>

				<p>
					<b>
						Book your call today for just <del>$149</del> $99.
					</b>{' '}
					Click the button below to confirm your purchase.
				</p>
			</Fragment>
		);
	}

	footer() {
		return (
			<footer className="concierge-session-nudge__footer">
				<Button
					className="concierge-session-nudge__decline-offer-button"
					onClick={ this.handleClickDecline }
				>
					Skip
				</Button>
				<Button
					primary
					className="concierge-session-nudge__accept-offer-button"
					onClick={ this.handleClickAccept }
				>
					Reserve a call for $99
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
)( ConciergeSessionNudge );
