/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import { Card, Button } from '@automattic/components';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import config from 'calypso/config';

/**
 * Image dependencies
 */

import megaphoneImage from 'calypso/assets/images/woocommerce/megaphone.svg';

class StoreMoveNoticeView extends Component {
	render = () => {
		const { site, title, status } = this.props;
		return (
			<Card className={ classNames( 'dashboard__store-move-notice', status ) }>
				<img src={ megaphoneImage } alt="" />
				<h1>{ title }</h1>
				<p>
					Now you'll be able to access all of your most important store management features in one
					place.{ ' ' }
					<a href="https://wordpress.com/support/store/">
						Find more information about this change here.
					</a>
				</p>
				<Button primary href={ site.URL + '/wp-admin/admin.php?page=wc-admin' }>
					Go to WooCommerce Home
				</Button>
			</Card>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	let title;
	let status;

	if ( config.isEnabled( 'woocommerce/store-deprecated' ) ) {
		title = 'Store is moving to WooCommerce';
		status = 'store-deprecated';
	} else if ( config.isEnabled( 'woocommerce/store-removed' ) ) {
		title = 'Store has moved to WooCommerce';
		status = 'store-removed';
	}

	return {
		site,
		title,
		status,
	};
}

export default connect( mapStateToProps )( StoreMoveNoticeView );
