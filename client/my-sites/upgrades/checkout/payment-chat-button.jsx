/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import i18n from 'lib/i18n-utils';
import OlarkChatButton from 'components/olark-chat-button';
import Gridicon from 'components/gridicon';
import { isHappychatAvailable } from 'state/happychat/selectors';
import { getOlarkLocale } from 'state/ui/olark/selectors';
import { openChat } from 'state/ui/happychat/actions';
import { connectChat } from 'state/happychat/actions';
import config from 'config';

class PaymentChatButton extends Component {
	componentDidMount() {
		this.props.connectHappychat();
	}

	shouldUseHappychat() {
		const { olarkLocale } = this.props;
		const isEn = olarkLocale ? olarkLocale === 'en' : i18n.getLocaleSlug() === 'en';

		if ( ! config.isEnabled( 'happychat' ) ) {
			return false;
		}

		if ( ! isEn ) {
			// Happychat may only be staffed for EN
			return false;
		}

		return this.props.isHappychatAvailable;
	}

	openHappychat = ( event ) => {
		event.preventDefault();
		this.props.openHappychat();
	}

	render() {
		const { cart, translate, paymentType, transactionStep } = this.props;
		const { products } = cart;
		const product = products && products[ 0 ];
		const productSlug = product && product.product_slug;

		if ( this.shouldUseHappychat() ) {
			// Not translated on purpose since happy chat is only displayed for EN
			return (
				<button
					className="checkout__payment-chat-button is-borderless button"
					onClick={ this.openHappychat }>
					<Gridicon icon="chat" className="checkout__payment-chat-button-icon" />
					Need help? HappyChat with us
				</button>
			);
		}

		return (
			<OlarkChatButton
				borderless
				className="checkout__payment-chat-button"
				chatContext="presale"
				tracksData={ {
					payment_type: paymentType,
					transaction_step: transactionStep.name,
					product_slug: productSlug,
				} }>
				<Gridicon icon="chat" className="checkout__payment-chat-button-icon" />
				{ translate( 'Need help? Chat with us' ) }
			</OlarkChatButton>
		);
	}
}

export default connect(
	state => ( {
		isHappychatAvailable: isHappychatAvailable( state ),
		olarkLocale: getOlarkLocale( state ),
	} ),
	{
		connectHappychat: connectChat,
		openHappychat: openChat,
	}
)( localize( PaymentChatButton ) );
