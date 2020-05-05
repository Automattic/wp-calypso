/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { getNewMessages } from 'lib/cart-values';

class CartMessages extends PureComponent {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,

		// connected
		translate: PropTypes.func.isRequired,
	};

	state = { previousCart: null };

	componentDidMount() {
		// Makes sure that we display any messages from the current cart
		// that might have been delivered when the cart was unmounted
		this.displayCartMessages( this.props.cart );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.cart.hasLoadedFromServer ) {
			return;
		}

		if ( this.props.cart.messages !== nextProps.cart.messages ) {
			this.displayCartMessages( nextProps.cart );
		}
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

	displayCartMessages( newCart ) {
		const { previousCart } = this.state;
		const messages = getNewMessages( previousCart, newCart );

		messages.errors = this.getPrettyErrorMessages( messages.errors );

		this.setState( { previousCart: newCart } );

		if ( ! isEmpty( messages.errors ) ) {
			notices.error(
				messages.errors.map( ( error, index ) => (
					<p key={ `${ error.code }-${ index }` }>{ error.message }</p>
				) ),
				{ persistent: true }
			);
		} else if ( ! isEmpty( messages.success ) ) {
			notices.success(
				messages.success.map( ( success, index ) => (
					<p key={ `${ success.code }-${ index }` }>{ success.message }</p>
				) )
			);
		}
	}

	render() {
		return null;
	}
}

export default localize( CartMessages );
