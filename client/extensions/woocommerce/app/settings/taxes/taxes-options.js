/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import ExtendedHeader from 'woocommerce/components/extended-header';

class TaxesOptions extends Component {

	static propTypes = {
		onCheckboxChange: PropTypes.func.isRequired,
		pricesIncludeTaxes: PropTypes.bool,
		shippingIsTaxable: PropTypes.bool,
	};

	render = () => {
		const { onCheckboxChange, pricesIncludeTaxes, shippingIsTaxable, translate } = this.props;

		return (
			<div className="taxes__taxes-options">
				<ExtendedHeader
					label={ translate( 'Tax settings' ) }
					description={ translate( 'Configure how taxes are calculated' ) }
				/>
				<Card>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox checked={ pricesIncludeTaxes || false } name="pricesIncludeTaxes" onChange={ onCheckboxChange } />
								<span>{ translate( 'Taxes are included in product prices' ) }</span>
						</FormLabel>
						<FormLabel>
							<FormCheckbox checked={ shippingIsTaxable || false } name="shippingIsTaxable" onChange={ onCheckboxChange } />
								<span>{ translate( 'Charge taxes on shipping costs' ) }</span>
						</FormLabel>
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

export default localize( TaxesOptions );
