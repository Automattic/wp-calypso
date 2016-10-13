/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	getNewMessages = require( 'lib/cart-values' ).getNewMessages,
	CartStore = require( 'lib/cart/store' );

module.exports = {
	componentDidMount: function() {
		CartStore.on( 'change', this.displayCartMessages );
	},

	componentWillUnmount: function() {
		CartStore.off( 'change', this.displayCartMessages );
	},

	getChargebackErrorMessage: function() {
		return this.translate(
			"{{strong}}Warning:{{/strong}} One or more transactions linked to this site were refunded due to a contested charge. This may have happened because of a chargeback by the credit card holder or a PayPal investigation. Each contested charge carries a fine. To resolve the issue and re-enable posting, please {{a}}pay for the chargeback fine{{/a}}.",
			{
				components: {
					strong: <strong />,
					a: <a href={ '/checkout/' + this.props.selectedSite.slug } />
				}
			}
		);
	},

	getBlockedPurchaseErrorMessage: function() {
		return this.translate(
			"Purchases are currently disabled. Please {{a}}contact us{{/a}} to re-enable purchases.",
			{
				components: {
					a: <a href={ 'https://wordpress.com/error-report/?url=payment@' + this.props.selectedSite.slug } target="_blank" rel="noopener noreferrer" />
				}
			}
		);
	},

	getPrettyErrorMessages: function( messages ) {
		if ( ! messages ) {
			return [];
		}

		return messages.map( function( error ) {
			if ( error.code === 'chargeback' ) {
				return Object.assign( error, { message: this.getChargebackErrorMessage() } );
			} else if ( error.code === 'blocked' ) {
				return Object.assign( error, { message: this.getBlockedPurchaseErrorMessage() } );
			} else {
				return error;
			}
		}, this );
	},

	displayCartMessages: function() {
		var newCart = this.props.cart,
			previousCart = ( this.state ) ? this.state.previousCart : null,
			messages = getNewMessages( previousCart, newCart );

		messages.errors = this.getPrettyErrorMessages( messages.errors );

		this.setState( { previousCart: newCart } );

		if ( ! isEmpty( messages.errors ) ) {
			notices.error( messages.errors.map( function( error ) {
				return ( <p key={ error.code }>{ error.message }</p> );
			}, this ) );
		} else if ( ! isEmpty( messages.success ) ) {
			notices.success( messages.success.map( function( success ) {
				return ( <p key={ success.code }>{ success.message }</p> );
			}, this ) );
		}
	}
};
