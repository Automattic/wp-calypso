/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartStore from 'lib/cart/store';
import { hasStaleItem } from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { getNoticeLastTimeShown } from 'state/notices/selectors';
import { getSectionName, getSelectedSiteSlug } from 'state/ui/selectors';

const staleCartItemNoticeId = 'stale-cart-item-notice';

class StaleCartItemsNotice extends React.Component {
	showStaleCartItemsNotice = () => {
		// Remove any existing stale cart notice
		this.props.removeNotice( staleCartItemNoticeId );

		// Don't show on the checkout page?
		if ( this.props.sectionName === 'upgrades' ) {
			return null;
		}

		// Show a notice if there are stale items in the cart and it hasn't been shown
		// in the last 10 minutes (cart abandonment)
		if (
			this.props.selectedSiteSlug &&
			hasStaleItem( CartStore.get() ) &&
			this.props.staleCartItemNoticeLastTimeShown < Date.now() - 10 * 60 * 1000
		) {
			this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_view' );

			this.props.infoNotice( this.props.translate( 'Your cart is awaiting payment.' ), {
				id: staleCartItemNoticeId,
				isPersistent: false,
				duration: 10000,
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
