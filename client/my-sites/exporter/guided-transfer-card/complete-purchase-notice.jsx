/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { cartItems } from 'lib/cart-values';
import upgradesActions from 'lib/upgrades/actions';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const redirectToCart = siteSlug => () => {
	upgradesActions.addItem( cartItems.guidedTransferItem() );
	page( `/checkout/${ siteSlug }` );
};

const CompletePurchaseNotice = ( { translate, siteSlug } ) =>
	<Notice
		status="is-warning"
		showDismiss={ false }
		text={ translate(
			"It looks like you've started a Guided Transfer. " +
			'We just need your payment to confirm the transfer and ' +
			"then we'll get started!" ) }
	>
		<NoticeAction onClick={ redirectToCart( siteSlug ) }>
			{ translate( 'Continue' ) }
		</NoticeAction>
	</Notice>;

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( CompletePurchaseNotice ) );
