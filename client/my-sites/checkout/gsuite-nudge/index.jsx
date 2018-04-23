/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import GoogleAppsDialog from 'components/upgrades/google-apps/google-apps-dialog';
import Main from 'components/main';
import QuerySites from 'components/data/query-sites';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';
import { addItem, removeItem } from 'lib/upgrades/actions';
import { cartItems } from 'lib/cart-values';
import { isDotComPlan } from 'lib/products-values';
import { getABTestVariation } from 'lib/abtest';
import PageViewTracker from 'lib/analytics/page-view-tracker';

export class GsuiteNudge extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		receiptId: PropTypes.number.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
	};

	handleClickSkip = () => {
		const { siteSlug, receiptId } = this.props;

		// DO NOT assign the test here.
		if ( 'show' === getABTestVariation( 'checklistThankYouForPaidUser' ) ) {
			page( `/checklist/${ siteSlug }?d=paid` );
		} else {
			page( `/checkout/thank-you/${ siteSlug }/${ receiptId }` );
		}
	};

	handleAddGoogleApps = googleAppsCartItem => {
		const { siteSlug, receiptId } = this.props;

		googleAppsCartItem.extra = {
			...googleAppsCartItem.extra,
			receipt_for_domain: receiptId,
		};

		this.removePlanFromCart();

		addItem( googleAppsCartItem );
		page( `/checkout/${ siteSlug }` );
	};

	removePlanFromCart() {
		const items = cartItems.getAll( this.props.cart );
		items.filter( isDotComPlan ).forEach( function( item ) {
			removeItem( item, false );
		} );
	}

	render() {
		const { domain, receiptId, selectedSiteId, siteSlug, siteTitle, translate } = this.props;

		return (
			<Main className="gsuite-nudge">
				<PageViewTracker
					path={
						receiptId
							? '/checkout/:site/with-gsuite/:domain/:receipt_id'
							: '/checkout/:site/with-gsuite/:domain'
					}
					title="G Suite Upsell"
					properties={ { site: siteSlug, domain, ...( receiptId && { receiptId } ) } }
				/>
				<DocumentHead
					title={ translate( 'Add G Suite < %(siteTitle)s', {
						args: { siteTitle },
					} ) }
				/>
				<QuerySites siteId={ selectedSiteId } />
				<GoogleAppsDialog
					domain={ this.props.domain }
					onClickSkip={ this.handleClickSkip }
					onAddGoogleApps={ this.handleAddGoogleApps }
				/>
			</Main>
		);
	}
}

export default connect( ( state, props ) => {
	return {
		siteSlug: getSiteSlug( state, props.selectedSiteId ),
		siteTitle: getSiteTitle( state, props.selectedSiteId ),
	};
} )( localize( GsuiteNudge ) );
