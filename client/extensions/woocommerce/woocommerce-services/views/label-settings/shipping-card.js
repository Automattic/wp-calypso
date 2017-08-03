/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormCheckbox from 'components/forms/form-checkbox';
import PaymentLogo from 'components/payment-logo';

const ShippingCard = ( { translate, selected, type, digits, name, date, onSelect } ) => {
	return (
		<CompactCard className="label-settings__card">
			<FormCheckbox
				className="label-settings__card-checkbox"
				checked={ selected }
				onChange={ onSelect }
			/>
			<div className="label-settings__card-info">
				<PaymentLogo className="label-settings__card-logo" type={ type.toLowerCase() } />
				<div className="label-settings__card-details">
					<p className="label-settings__card-number">{ type } ****{ digits }</p>
					<p className="label-settings__card-name">{ name }</p>
				</div>
				<div className="label-settings__card-date">
					{ translate( 'Expires %(date)s', {
						args: { date: date },
						context: 'date is of the form MM/YY'
					} ) }
				</div>
			</div>
		</CompactCard>
	);
};

ShippingCard.propTypes = {
	selected: PropTypes.bool.isRequired,
	type: PropTypes.string,
	digits: PropTypes.string,
	name: PropTypes.string,
	date: PropTypes.string,
	onSelect: PropTypes.func
};

export default localize( ShippingCard );
