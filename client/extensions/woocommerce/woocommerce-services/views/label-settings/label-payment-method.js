/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormCheckbox from 'components/forms/form-checkbox';
import PaymentLogo from 'components/payment-logo';

export const getPaymentMethodTitle = ( translate, paymentType, digits ) => {
	const supportedTypes = {
		amex: translate( 'American Express' ),
		discover: translate( 'Discover' ),
		mastercard: translate( 'MasterCard' ),
		visa: translate( 'VISA' ),
		paypal: translate( 'PayPal' ),
	};

	if ( ! supportedTypes[ paymentType ] ) {
		return null;
	}

	if ( ! digits ) {
		return supportedTypes[ paymentType ];
	}

	return translate( '%(card)s ****%(digits)s', { args: {
		card: supportedTypes[ paymentType ],
		digits
	} } );
};

const PaymentMethod = ( { translate, selected, isLoading, type, digits, name, expiry, onSelect } ) => {
	const renderPlaceholder = () => (
		<CompactCard className="label-settings__card">
			<FormCheckbox
				className="label-settings__card-checkbox" />
			<PaymentLogo className="label-settings__card-logo" type="placeholder" />
			<div className="label-settings__card-details">
				<p className="label-settings__card-number" />
				<p className="label-settings__card-name" />
			</div>
			<div className="label-settings__card-date">
				<p />
			</div>
		</CompactCard>
	);

	if ( isLoading ) {
		return renderPlaceholder();
	}

	const typeTitle = getPaymentMethodTitle( translate, type, digits );
	const typeId = typeTitle ? type : 'placeholder';
	const typeName = typeTitle || type;

	return (
		<CompactCard className="label-settings__card" onClick={ onSelect }>
			<FormCheckbox
				className="label-settings__card-checkbox"
				checked={ selected }
				onChange={ onSelect }
			/>
			<PaymentLogo className="label-settings__card-logo" type={ typeId } />
			<div className="label-settings__card-details">
				<p className="label-settings__card-number">{ typeName }</p>
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
	isLoading: PropTypes.bool,
	type: PropTypes.string,
	digits: PropTypes.string,
	name: PropTypes.string,
	expiry: PropTypes.string,
	onSelect: PropTypes.func,
};

export default localize( PaymentMethod );
