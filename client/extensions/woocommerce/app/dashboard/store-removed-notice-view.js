/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { Card, Button } from '@automattic/components';
import Main from 'calypso/components/main';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { localize, translate } from 'i18n-calypso';

/**
 * Image dependencies
 */

import megaphoneImage from 'calypso/assets/images/woocommerce/megaphone.svg';

class StoreRemovedNoticeView extends Component {
	render = () => {
		const { site } = this.props;
		return (
			<Main className={ 'dashboard' } wideLayout>
				<div className="dashboard__store-removed">
					<Notice status="is-error" icon="notice" translate={ translate } showDismiss={ false }>
						{ translate( 'Store has moved to WooCommerce' ) }
						<NoticeAction href="#">{ translate( 'More' ) }</NoticeAction>
					</Notice>
					<Card>
						<img src={ megaphoneImage } alt="" />
						<h1>{ translate( 'Store has moved to WooCommerce' ) }</h1>
						<p>{ translate( "Now you'll be able to access all of your most important" ) }</p>
						<p>{ translate( 'store management features in one place.' ) }</p>
						<Button primary href={ site.URL + '/wp-admin/admin.php?page=wc-admin' }>
							{ translate( 'Go to WooCommerce Home' ) }
						</Button>
					</Card>
				</div>
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( StoreRemovedNoticeView ) );
