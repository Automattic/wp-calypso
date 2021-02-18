/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { CompactCard } from '@automattic/components';
import PaymentLogo from 'calypso/components/payment-logo';

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

	return translate( '%(card)s ****%(digits)s', {
		args: {
			card: supportedTypes[ paymentType ],
			digits,
		},
	} );
};

const PaymentMethod = ( {
	translate,
	selected,
	isLoading,
	type,
	digits,
	name,
	expiry,
	onSelect,
} ) => {
	const renderPlaceholder = () => (
		<CompactCard className="label-settings__card">
			<FormCheckbox className="label-settings__card-checkbox" />
			<PaymentLogo className="label-settings__card-logo" type="placeholder" altText={ '' } />
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

	const expiryText = expiry
		? translate( 'Expires %(date)s', {
				args: { date: expiry },
				context: 'date is of the form MM/YY',
		  } )
		: '';

	return (
		<CompactCard className="label-settings__card" onClick={ onSelect }>
			<FormCheckbox
				className="label-settings__card-checkbox"
				checked={ selected }
				onChange={ onSelect }
			/>
			<PaymentLogo className="label-settings__card-logo" type={ typeId } altText={ typeTitle } />
			<div className="label-settings__card-details">
				<p className="label-settings__card-number">{ typeName }</p>
				<p className="label-settings__card-name">{ name }</p>
			</div>
			<div className="label-settings__card-date">{ expiryText }</div>
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
