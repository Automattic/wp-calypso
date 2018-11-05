/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
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

export class ConciergeSessionNudge extends React.Component {
	static propTypes = {
		receiptId: PropTypes.number.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
	};

	render() {
		const { receiptId, selectedSiteId } = this.props;
		const title = 'Checkout ‹ Expert Session';

		return (
			<Main className="concierge-session-nudge">
				<PageViewTracker
					path={
						receiptId
							? '/checkout/:site/add-expert-session/:receipt_id'
							: '/checkout/:site/add-expert-session'
					}
					title={ title }
				/>
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
		const { siteSlug, receiptId, isEligibleForChecklist } = this.props;

		page(
			isEligibleForChecklist
				? `/checklist/${ siteSlug }`
				: `/checkout/thank-you/${ siteSlug }/${ receiptId }`
		);
	};

	handleClickAccept = () => {
		const { siteSlug } = this.props;

		addItem( cartItems.conciergeSessionItem() );

		page( `/checkout/${ siteSlug }` );
	};
}

export default connect( ( state, props ) => {
	const { selectedSiteId } = props;

	return {
		siteSlug: getSiteSlug( state, selectedSiteId ),
		isEligibleForChecklist: isEligibleForDotcomChecklist( state, selectedSiteId ),
	};
} )( localize( ConciergeSessionNudge ) );
