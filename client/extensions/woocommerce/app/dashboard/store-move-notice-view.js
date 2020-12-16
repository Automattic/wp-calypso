/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import { Card, Button } from '@automattic/components';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { localize, translate } from 'i18n-calypso';
import config from 'calypso/config';

/**
 * Image dependencies
 */

import megaphoneImage from 'calypso/assets/images/woocommerce/megaphone.svg';

class StoreMoveNoticeView extends Component {
	render = () => {
		const { site, title, status } = this.props;
		return (
			<div className={ 'dashboard__store-move-notice ' + status }>
				<Card>
					<img src={ megaphoneImage } alt="" />
					<h1>{ title }</h1>
					<p>{ translate( "Now you'll be able to access all of your most important" ) }</p>
					<p>
						{ translate( 'store management features in one place. ' ) }
						<a href="https://wordpress.com/support/store/">
							{ translate( 'Find more information about this change here' ) }
						</a>
					</p>
					<Button primary href={ site.URL + '/wp-admin/admin.php?page=wc-admin' }>
						{ translate( 'Go to WooCommerce Home' ) }
					</Button>
				</Card>
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	let title;
	let status;

	if ( config.isEnabled( 'woocommerce/store-deprecated' ) ) {
		title = translate( 'Store is moving to WooCommerce' );
		status = 'store-deprecated';
	} else if ( config.isEnabled( 'woocommerce/store-removed' ) ) {
		title = translate( 'Store has moved to WooCommerce' );
		status = 'store-removed';
	}

	return {
		site,
		title,
		status,
	};
}

export default connect( mapStateToProps )( localize( StoreMoveNoticeView ) );
