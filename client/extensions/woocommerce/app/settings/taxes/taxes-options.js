/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

class TaxesOptions extends Component {
	static propTypes = {
		onCheckboxChange: PropTypes.func.isRequired,
		pricesIncludeTaxes: PropTypes.bool,
		shippingIsTaxable: PropTypes.bool,
		shipToCountry: PropTypes.shape( {
			value: PropTypes.string,
		} ),
	};

	render = () => {
		const {
			onCheckboxChange,
			pricesIncludeTaxes,
			shippingIsTaxable,
			shipToCountry,
			translate,
		} = this.props;

		let shippingDisabled = false;
		let shippingDisabledMessage = null;
		if ( shipToCountry && shipToCountry.value && 'disabled' === shipToCountry.value ) {
			shippingDisabled = true;
			shippingDisabledMessage = (
				<FormSettingExplanation>
					{ translate( 'Shipping has been disabled for this site.' ) }
				</FormSettingExplanation>
			);
		}

		return (
			<div className="taxes__taxes-options">
				<ExtendedHeader
					label={ translate( 'Tax settings' ) }
					description={ translate( 'Configure how taxes are calculated' ) }
				/>
				<Card>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox
								checked={ pricesIncludeTaxes || false }
								name="pricesIncludeTaxes"
								onChange={ onCheckboxChange }
							/>
							<span>{ translate( 'Taxes are included in product prices' ) }</span>
						</FormLabel>
						<FormLabel>
							<FormCheckbox
								checked={ shippingIsTaxable || false }
								name="shippingIsTaxable"
								onChange={ onCheckboxChange }
								disabled={ shippingDisabled }
							/>
							<span>{ translate( 'Charge taxes on shipping costs' ) }</span>
							{ shippingDisabledMessage }
						</FormLabel>
					</FormFieldset>
				</Card>
			</div>
		);
	};
}

export default localize( TaxesOptions );
