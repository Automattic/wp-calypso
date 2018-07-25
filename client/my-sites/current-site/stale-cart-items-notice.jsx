/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartStore from 'lib/cart/store';
import { cartItems } from 'lib/cart-values';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getNoticeLastTimeShown } from 'state/notices/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const staleCartItemNoticeId = 'stale-cart-item-notice';

class StaleCartItemsNotice extends Component {
	componentDidMount() {
		CartStore.on( 'change', this.showStaleCartItemsNotice );
	}

	componentWillUnmount() {
		CartStore.off( 'change', this.showStaleCartItemsNotice );
	}

	render() {
		return null;
	}

	showStaleCartItemsNotice = () => {
		// Remove any existing stale cart notice
		this.props.removeNotice( staleCartItemNoticeId );

		// Show a notice if there are stale items in the cart and it hasn't been shown in the last 10 minutes (cart abandonment)
		if (
			this.props.selectedSite &&
			cartItems.hasStaleItem( CartStore.get() ) &&
			this.props.staleCartItemNoticeLastTimeShown < Date.now() - 10 * 60 * 1000
		) {
			this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_view' );

			this.props.infoNotice( this.props.translate( 'Your cart is awaiting payment.' ), {
				id: staleCartItemNoticeId,
				isPersistent: false,
				duration: 10000,
				button: this.props.translate( 'Complete your purchase' ),
				href: '/checkout/' + this.props.selectedSite.slug,
				onClick: this.clickStaleCartItemsNotice,
			} );
		}
	};

	clickStaleCartItemsNotice = () => {
		this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_click' );
	};
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state ),
		staleCartItemNoticeLastTimeShown: getNoticeLastTimeShown( state, staleCartItemNoticeId ),
	} ),
	{ infoNotice, removeNotice, recordTracksEvent }
)( localize( StaleCartItemsNotice ) );
