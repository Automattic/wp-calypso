/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checkbox from 'components/checkbox';
import CompactCard from 'components/card/compact';
import PaymentLogo from 'components/payment-logo';

const PaymentMethod = ( { translate, selected, type, digits, name, expiry, onSelect } ) => {
	const supportedTypes = {
		amex: translate( 'American Express' ),
		discover: translate( 'Discover' ),
		mastercard: translate( 'MasterCard' ),
		visa: translate( 'VISA' ),
		paypal: translate( 'PayPal' ),
	};

	const typeId = Object.keys( supportedTypes ).includes( type ) ? type : 'placeholder';
	const typeName = supportedTypes[ type ] || type;

	const renderDigits = () => {
		if ( ! digits ) {
			return null;
		}

		return translate( '****%(digits)s', { args: { digits } } );
	};

	return (
		<CompactCard className="shipping__card" onClick={ onSelect }>
			<Checkbox
				className="shipping__card-checkbox"
				checked={ selected }
				onChange={ onSelect }
			/>
			<PaymentLogo className="shipping__card-logo" type={ typeId } />
			<div className="shipping__card-details">
				<p className="shipping__card-number">{ typeName } { renderDigits() }</p>
				<p className="shipping__card-name">{ name }</p>
			</div>
			<div className="shipping__card-date">
				{ translate( 'Expires %(date)s', {
					args: { date: expiry },
					context: 'date is of the form MM/YY',
				} ) }
			</div>
		</CompactCard>
	);
};

PaymentMethod.propTypes = {
	selected: PropTypes.bool.isRequired,
	type: PropTypes.string,
	digits: PropTypes.string,
	name: PropTypes.string,
	expiry: PropTypes.string,
	onSelect: PropTypes.func,
};

export default localize( PaymentMethod );
