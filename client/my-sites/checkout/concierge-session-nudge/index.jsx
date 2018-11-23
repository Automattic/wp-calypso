/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
				<h2 className="concierge-session-nudge__title">Offer header</h2>
			</header>
		);
	}

	body() {
		return <Fragment>Offer content</Fragment>;
	}

	footer() {
		return (
			<footer className="concierge-session-nudge__footer">
				<Button
					className="concierge-session-nudge__decline-offer-button"
					onClick={ this.handleClickDecline }
				>
					No, thank you.
				</Button>
				<Button
					primary
					className="concierge-session-nudge__accept-offer-button"
					onClick={ this.handleClickAccept }
				>
					Yes, please.
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
