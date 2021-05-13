/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import page from 'page';

const redirectToCart = ( siteSlug ) => () => {
	page( `/checkout/${ siteSlug }/guided_transfer` );
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

const mapStateToProps = ( state ) => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( CompletePurchaseNotice ) );
