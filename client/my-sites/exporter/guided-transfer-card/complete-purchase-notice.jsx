/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { cartItems } from 'lib/cart-values';
import upgradesActions from 'lib/upgrades/actions';
import page from 'page';

class CompletePurchaseNotice extends Component {
	redirectToCart = () => {
		upgradesActions.addItem( cartItems.guidedTransferItem() );
		page( `/checkout/${ this.props.siteSlug }` );
	}

	render() {
		const { translate } = this.props;

		return (
			<Notice
				status="is-warning"
				showDismiss={ false }
				text={ translate(
					"It looks like you've started a Guided Transfer. " +
					'We just need your payment to confirm the transfer and ' +
					"then we'll get started!" ) }
			>
				<NoticeAction onClick={ this.redirectToCart }>
					{ translate( 'Continue' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default localize( CompletePurchaseNotice );
