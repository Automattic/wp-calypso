/**
 * External dependencies
 */
import React from 'react';
import { defaultRegistry } from '@automattic/composite-checkout';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar';
import Item from './item';
import WordPressLogo from 'components/wordpress-logo';
import WordPressWordmark from 'components/wordpress-wordmark';
import { recordTracksEvent } from 'state/analytics/actions';

class CheckoutMasterbar extends React.Component {
	clickClose = () => {
		const { select } = defaultRegistry;
		const siteSlug = select( 'wpcom' )?.getSiteSlug();
		const closeUrl = siteSlug ? '/plans/' + siteSlug : '/start';
		this.props.recordTracksEvent( 'calypso_masterbar_close_clicked' );
		window.location = closeUrl;
	};

	render() {
		const { translate, title } = this.props;
		return (
			<Masterbar>
				<div className="masterbar__secure-checkout">
					<Item
						url={ '#' }
						icon="cross"
						className="masterbar__close-button"
						onClick={ this.clickClose }
						tooltip={ translate( 'Close Checkout' ) }
						tipTarget="close"
					/>
					<Item className="masterbar__item-logo">
						<WordPressLogo className="masterbar__wpcom-logo" />
						<WordPressWordmark className="masterbar__wpcom-wordmark" />
					</Item>
					<span className="masterbar__secure-checkout-text">
						{ translate( 'Secure checkout' ) }
					</span>
				</div>
				<Item className="masterbar__item-title">{ title }</Item>
			</Masterbar>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( CheckoutMasterbar ) );
