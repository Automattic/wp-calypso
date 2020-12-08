/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import { getNewMessages } from 'calypso/lib/cart-values';

class CartMessages extends PureComponent {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		isLoadingCart: PropTypes.bool,
		selectedSite: PropTypes.shape( {
			slug: PropTypes.string,
		} ).isRequired,

		// connected
		translate: PropTypes.func.isRequired,
	};

	previousCart = null;

	componentDidMount() {
		this.displayCartMessages();
	}

	componentDidUpdate() {
		this.displayCartMessages();
	}

	getChargebackErrorMessage() {
		return this.props.translate(
			'{{strong}}Warning:{{/strong}} One or more transactions linked to this site were refunded due to a contested charge. ' +
				'This may have happened because of a chargeback by the credit card holder or a PayPal investigation. Each contested ' +
				'charge carries a fine. To resolve the issue and re-enable posting, please {{a}}pay for the chargeback fine{{/a}}.',
			{
				components: {
					strong: <strong />,
					a: <a href={ '/checkout/' + this.props.selectedSite.slug } />,
				},
			}
		);
	}

	getBlockedPurchaseErrorMessage() {
		return this.props.translate(
			'Purchases are currently disabled. Please {{a}}contact us{{/a}} to re-enable purchases.',
			{
				components: {
					a: (
						<a
							href={
								'https://wordpress.com/error-report/?url=payment@' + this.props.selectedSite.slug
							}
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);
	}

	getPrettyErrorMessages( messages ) {
		if ( ! messages ) {
			return [];
		}

		return messages.map( ( error ) => {
			switch ( error.code ) {
				case 'chargeback':
					return Object.assign( error, { message: this.getChargebackErrorMessage() } );

				case 'blocked':
					return Object.assign( error, { message: this.getBlockedPurchaseErrorMessage() } );

				default:
					return error;
			}
		} );
	}

	displayCartMessages() {
		const newCart = this.props.cart;
		if ( this.props.isLoadingCart ) {
			return;
		}
		const messages = getNewMessages( this.previousCart, newCart );

		messages.errors = this.getPrettyErrorMessages( messages.errors );

		this.previousCart = newCart;

		if ( messages.errors?.length > 0 ) {
			notices.error(
				messages.errors.map( ( error ) => (
					<p key={ `${ error.code }-${ error.message }` }>{ error.message }</p>
				) ),
				{ persistent: true }
			);
			return;
		}

		if ( messages.success?.length > 0 ) {
			notices.success(
				messages.success.map( ( success ) => (
					<p key={ `${ success.code }-${ success.message }` }>{ success.message }</p>
				) )
			);
			return;
		}
	}

	render() {
		return null;
	}
}

export default localize( CartMessages );
