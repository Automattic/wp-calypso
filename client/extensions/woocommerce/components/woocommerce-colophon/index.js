/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import ExternalLink from 'components/external-link';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';

import WooCommerceLogo from '../woocommerce-logo';

class WooCommerceColophon extends React.Component {
	static displayName = 'WooCommerceColophon';

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_store_woocommercecolophon_click' );
	};

	render() {
		return (
			<div className="woocommerce-colophon">
				<ExternalLink
					icon={ false }
					target="_blank"
					onClick={ this.onClick }
					href="https://woocommerce.com"
				>
					{ this.props.translate( 'Powered by {{WooCommerceLogo /}}', {
						components: {
							WooCommerceLogo: <WooCommerceLogo height={ 32 } width={ 120 } />,
						},
					} ) }
				</ExternalLink>
			</div>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( WooCommerceColophon ) );
