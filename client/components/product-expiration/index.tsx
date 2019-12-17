/**
 * External dependencies
 */
import React from 'react';

interface Moment {
	isValid: () => boolean;
	format: ( arg0: string ) => string;
	diff: ( arg0: Date ) => number;
}

export interface Props {
	expiryDateMoment: Moment;
	purchaseDateMoment: Moment;
	isRefundable: boolean;
	dateFormat: string;
	translate: ( arg0: string, arg1: object ) => string;
}

class ProductExpiration extends React.PureComponent< Props > {
	static defaultProps = {
		expiryDateMoment: null,
		purchaseDateMoment: null,
		isRefundable: false,
		dateFormat: 'LL',
	};

	render() {
		const {
			expiryDateMoment,
			purchaseDateMoment,
			isRefundable,
			dateFormat,
			translate,
		} = this.props;

		// Return null if we don't have any dates.
		if ( ! expiryDateMoment && ! purchaseDateMoment ) {
			return null;
		}

		// Return the subscription date if we don't have the expiry date or the plan is refundable.
		if ( ! expiryDateMoment || isRefundable ) {
			if ( purchaseDateMoment.isValid() ) {
				return translate( 'Purchased on %s.', { args: purchaseDateMoment.format( dateFormat ) } );
			}
			return null;
		}

		// Return null if date is not parsable.
		if ( ! expiryDateMoment.isValid() ) {
			return null;
		}

		// If the expiry date is in the past, show the expiration date.
		if ( expiryDateMoment.diff( new Date() ) < 0 ) {
			return translate( 'Expired on %s.', { args: expiryDateMoment.format( dateFormat ) } );
		}

		// Lastly, return the renewal date.
		return translate( 'Renews on %s.', { args: expiryDateMoment.format( dateFormat ) } );
	}
}

export default ProductExpiration;
