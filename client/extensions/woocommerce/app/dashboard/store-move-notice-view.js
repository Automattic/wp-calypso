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
import { getSelectedSiteWithFallback } from 'calypso/state/sites/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
/**
 * Image dependencies
 */

import megaphoneImage from 'calypso/assets/images/woocommerce/megaphone.svg';

class StoreMoveNoticeView extends Component {
	trackTryWooCommerceClick = () => {
		this.props.recordTracksEvent( 'calypso_store_try_woocommerce_click' );
	};

	trackLearnMoreAboutWooCommerceClick = () => {
		this.props.recordTracksEvent( 'calypso_store_learn_more_about_woocommerce_click' );
	};

	render = () => {
		const { site } = this.props;

		return (
			<Card className={ classNames( 'dashboard__store-move-notice', 'store-removed' ) }>
				<img src={ megaphoneImage } alt="" />
				<h1>{ translate( 'Find all of your business features in WooCommerce' ) }</h1>
				<p>
					{ translate(
						'We’ve rolled your favorite Store features into WooCommerce. In addition to Products and Orders, you have top-level access for managing your Analytics, Marketing, and Customers. {{link}}Learn more{{/link}} about what has changed.',
						{
							components: {
								link: (
									<a
										onClick={ this.trackLearnMoreAboutWooCommerceClick }
										href="https://wordpress.com/support/new-woocommerce-experience-on-wordpress-dot-com/"
									/>
								),
							},
						}
					) }
				</p>
				<Button
					primary
					onClick={ this.trackTryWooCommerceClick }
					href={ site.URL + '/wp-admin/admin.php?page=wc-admin&from-calypso' }
				>
					{ translate( 'Try WooCommerce now' ) }
				</Button>
			</Card>
		);
	};
}

function mapStateToProps( state ) {
	return {
		site: getSelectedSiteWithFallback( state ),
	};
}

export default connect( mapStateToProps, {
	recordTracksEvent,
} )( localize( StoreMoveNoticeView ) );
