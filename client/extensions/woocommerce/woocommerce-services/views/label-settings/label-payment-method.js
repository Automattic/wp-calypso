/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
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

	const typeId = includes( Object.keys( supportedTypes ), type ) ? type : 'placeholder';
	const typeName = supportedTypes[ type ] || type;

	const renderDigits = () => {
		if ( ! digits ) {
			return null;
		}

		return translate( '****%(digits)s', { args: { digits } } );
	};

	return (
		<CompactCard className="label-settings__card" onClick={ onSelect }>
			<FormCheckbox
				className="label-settings__card-checkbox"
				checked={ selected }
				onChange={ onSelect }
			/>
			<PaymentLogo className="label-settings__card-logo" type={ typeId } />
			<div className="label-settings__card-details">
				<p className="label-settings__card-number">{ typeName } { renderDigits() }</p>
				<p className="label-settings__card-name">{ name }</p>
			</div>
			<div className="label-settings__card-date">
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
