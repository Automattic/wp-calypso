/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';

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

function getStoreStatus( isStoreDeprecated, isStoreRemoved ) {
	if ( isStoreDeprecated ) {
		return 'store-deprecated';
	}

	if ( isStoreRemoved ) {
		return 'store-removed';
	}

	return '';
}

class StoreMoveNoticeView extends Component {
	render = () => {
		const { site, isStoreDeprecated, isStoreRemoved } = this.props;
		const status = getStoreStatus( isStoreDeprecated, isStoreRemoved );

		return (
			<Card className={ classNames( 'dashboard__store-move-notice', status ) }>
				<img src={ megaphoneImage } alt="" />
				<h1>{ translate( 'Find all of your business features in WooCommerce' ) }</h1>
				<p>
					{ isStoreDeprecated &&
						translate(
							'We’re rolling your favorite Store features into WooCommerce in February. {{link}}Learn more{{/link}} about this streamlined, commerce-focused navigation experience, designed to help you save time and access your favorite extensions faster.',
							{
								components: {
									link: <a href="https://wordpress.com/support/store/" />,
								},
							}
						) }
					{ isStoreRemoved &&
						translate(
							'We’ve rolled your favorite Store functions into WooCommerce. {{link}}Learn more{{/link}} about how this streamlined, commerce-focused navigation experience can help you save time and access your favorite extensions faster.',
							{
								components: {
									link: <a href="https://wordpress.com/support/store/" />,
								},
							}
						) }
				</p>
				<Button primary href={ site.URL + '/wp-admin/admin.php?page=wc-admin' }>
					{ translate( 'Go to WooCommerce Home' ) }
				</Button>
			</Card>
		);
	};
}

function mapStateToProps( state ) {
	return {
		site: getSelectedSiteWithFallback( state ),
		isStoreDeprecated: config.isEnabled( 'woocommerce/store-deprecated' ),
		isStoreRemoved: config.isEnabled( 'woocommerce/store-removed' ),
	};
}

export default connect( mapStateToProps )( localize( StoreMoveNoticeView ) );
