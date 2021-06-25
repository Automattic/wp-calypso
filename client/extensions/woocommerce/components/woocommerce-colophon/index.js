/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import WooCommerceLogo from '../woocommerce-logo';

class WooCommerceColophon extends React.Component {
	static displayName = 'WooCommerceColophon';

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_store_woocommercecolophon_click' );
	};

	render() {
		return (
			<div className="woocommerce-colophon">
				<ExternalLink icon={ false } onClick={ this.onClick } href="https://woocommerce.com">
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

export default connect( null, { recordTracksEvent } )( localize( WooCommerceColophon ) );
