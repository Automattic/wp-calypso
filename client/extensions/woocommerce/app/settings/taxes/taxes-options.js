/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

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

		const shippingDisabled =
			( shipToCountry && shipToCountry.value && 'disabled' === shipToCountry.value ) || false;
		const shippingDisabledMessage =
			( shippingDisabled && (
				<FormSettingExplanation>
					{ translate( 'Shipping has been disabled for this site.' ) }
				</FormSettingExplanation>
			) ) ||
			null;

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
