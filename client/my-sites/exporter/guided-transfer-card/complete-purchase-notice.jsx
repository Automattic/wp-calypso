/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { getSiteSlug } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'client/components/notice';
import NoticeAction from 'client/components/notice/notice-action';
import { cartItems } from 'client/lib/cart-values';
import upgradesActions from 'client/lib/upgrades/actions';
import page from 'page';

const redirectToCart = siteSlug => () => {
	upgradesActions.addItem( cartItems.guidedTransferItem() );
	page( `/checkout/${ siteSlug }` );
};

const CompletePurchaseNotice = ( { translate, siteSlug } ) => (
	<Notice
		status="is-warning"
		showDismiss={ false }
		text={ translate(
			"It looks like you've started a Guided Transfer. " +
				'We just need your payment to confirm the transfer and ' +
				"then we'll get started!"
		) }
	>
		<NoticeAction onClick={ redirectToCart( siteSlug ) }>{ translate( 'Continue' ) }</NoticeAction>
	</Notice>
);

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( CompletePurchaseNotice ) );
