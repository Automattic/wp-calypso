import { Card, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import megaphoneImage from 'calypso/assets/images/woocommerce/megaphone.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteWithFallback } from 'calypso/state/sites/selectors';

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
			<Card className={ clsx( 'dashboard__store-move-notice', 'store-removed' ) }>
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
										href={ localizeUrl(
											'https://wordpress.com/support/new-woocommerce-experience-on-wordpress-dot-com/'
										) }
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
