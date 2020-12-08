/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartStore from 'calypso/lib/cart/store';
import { hasStaleItem } from 'calypso/lib/cart-values/cart-items';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice, removeNotice } from 'calypso/state/notices/actions';
import { getNoticeLastTimeShown } from 'calypso/state/notices/selectors';
import { getSectionName, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { reloadCart } from 'calypso/lib/cart/actions';

const staleCartItemNoticeId = 'stale-cart-item-notice';

class StaleCartItemsNotice extends React.Component {
	showStaleCartItemsNotice = () => {
		// Don't show on the checkout page?
		if ( this.props.sectionName === 'upgrades' ) {
			// Remove any existing stale cart notice
			this.props.removeNotice( staleCartItemNoticeId );
			return null;
		}

		// Show a notice if there are stale items in the cart and it hasn't been shown
		// in the last 10 minutes (cart abandonment)
		const cart = CartStore.get();
		if (
			this.props.selectedSiteSlug &&
			hasStaleItem( cart ) &&
			this.props.staleCartItemNoticeLastTimeShown < Date.now() - 10 * 60 * 1000 &&
			cart.hasLoadedFromServer &&
			! cart.hasPendingServerUpdates
		) {
			this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_view' );

			// Remove any existing stale cart notice
			this.props.removeNotice( staleCartItemNoticeId );

			this.props.infoNotice( this.props.translate( 'Your cart is awaiting payment.' ), {
				id: staleCartItemNoticeId,
				button: this.props.translate( 'View your cart' ),
				href: '/checkout/' + this.props.selectedSiteSlug,
				onClick: this.clickStaleCartItemsNotice,
			} );
		}
	};

	clickStaleCartItemsNotice = () => {
		this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_click' );
	};

	componentDidMount() {
		reloadCart();
		CartStore.on( 'change', this.showStaleCartItemsNotice );
	}

	componentWillUnmount() {
		CartStore.off( 'change', this.showStaleCartItemsNotice );
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
		staleCartItemNoticeLastTimeShown: getNoticeLastTimeShown( state, staleCartItemNoticeId ),
		sectionName: getSectionName( state ),
	} ),
	{ infoNotice, removeNotice, recordTracksEvent }
)( localize( StaleCartItemsNotice ) );
