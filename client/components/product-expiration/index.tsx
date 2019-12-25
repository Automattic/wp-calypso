/**
 * External dependencies
 */
import React from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Moment } from 'moment';

interface Props extends LocalizeProps {
	dateFormat?: string;
	expiryDateMoment: Moment;
	isRefundable?: boolean;
	purchaseDateMoment?: Moment;
}

export class ProductExpiration extends React.PureComponent< Props > {
	static defaultProps = {
		dateFormat: 'LL',
		isRefundable: false,
	};

	render() {
		const {
			dateFormat,
			expiryDateMoment,
			isRefundable,
			purchaseDateMoment,
			translate,
		} = this.props;

		// Return null if we don't have any dates.
		if ( ! expiryDateMoment && ! purchaseDateMoment ) {
			return null;
		}

		// Return the subscription date if we don't have the expiry date or the plan is refundable.
		if ( ! expiryDateMoment || isRefundable ) {
			if ( purchaseDateMoment && purchaseDateMoment.isValid() ) {
				return translate( 'Purchased on %s', { args: purchaseDateMoment.format( dateFormat ) } );
			}
			return null;
		}

		// Return null if date is not parsable.
		if ( ! expiryDateMoment.isValid() ) {
			return null;
		}

		// If the expiry date is in the past, show the expiration date.
		if ( expiryDateMoment.diff( new Date() ) < 0 ) {
			return translate( 'Expired on %s', { args: expiryDateMoment.format( dateFormat ) } );
		}

		// Lastly, return the renewal date.
		return translate( 'Renews on %s', { args: expiryDateMoment.format( dateFormat ) } );
	}
}

export default localize( ProductExpiration );
