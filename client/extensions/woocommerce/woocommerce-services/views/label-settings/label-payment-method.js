/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import CompactCard from 'components/card/compact';
import StoredCard from 'my-sites/checkout/checkout/stored-card';

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

const PaymentMethod = ( { selected, isLoading, id, card, onSelect } ) => {
	const renderPlaceholder = () => (
		<CompactCard className="label-settings__card">
			<FormRadio className="label-settings__card-radio" />
			<StoredCard card={ { card_type: '' } } />
		</CompactCard>
	);

	if ( isLoading ) {
		return renderPlaceholder();
	}

	const htmlId = `label-settings-payment-method-${ id }`;
	return (
		<label htmlFor={ htmlId }>
			<CompactCard className="label-settings__card is-clickable">
				<FormRadio id={ htmlId } checked={ selected } onChange={ onSelect } />
				<StoredCard card={ card } />
			</CompactCard>
		</label>
	);
};

PaymentMethod.propTypes = {
	selected: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool,
	card: PropTypes.shape( {
		card_type: PropTypes.string,
		card: PropTypes.string,
		name: PropTypes.string,
		expiry: PropTypes.string,
	} ),
	onSelect: PropTypes.func,
};

export default localize( PaymentMethod );
