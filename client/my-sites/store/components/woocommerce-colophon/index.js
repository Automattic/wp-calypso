import { ExternalLink } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import WooCommerceLogo from '../woocommerce-logo';

class WooCommerceColophon extends Component {
	static displayName = 'WooCommerceColophon';

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_store_woocommercecolophon_click' );
	};

	render() {
		return (
			<div className="woocommerce-colophon">
				<ExternalLink onClick={ this.onClick } href="https://woocommerce.com">
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
