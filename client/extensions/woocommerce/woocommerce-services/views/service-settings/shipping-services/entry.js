/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import { snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import Checkbox from 'woocommerce/woocommerce-services/components/checkbox';
import FormSelect from 'components/forms/form-select';
import NumberInput from 'woocommerce/woocommerce-services/components/number-field/number-input';

const ShippingServiceEntry = ( props ) => {
	const { currencySymbol, updateValue, errors, service } = props;

	const { enabled, name, adjustment, adjustment_type } = service;

	const hasError = Boolean( errors[ service.id ] );

	const onToggleEnabled = ( event ) => updateValue( 'enabled', event.target.checked );
	const onUpdateAdjustment = ( event ) => updateValue( 'adjustment', event.target.value );
	const onUpdateAdjustmentType = ( event ) => updateValue( 'adjustment_type', event.target.value );
	const id = 'service_' + snakeCase( service.name );

	return (
		<div className={ classNames( 'shipping-services__entry', { 'wcc-error': hasError } ) }>
			<label className="shipping-services__entry-title" htmlFor={ id }>
				<Checkbox id={ id } checked={ enabled } onChange={ onToggleEnabled } />
				<span>{ name }</span>
			</label>
			{ hasError ? <Gridicon icon="notice" /> : null }
			<NumberInput
				disabled={ ! enabled }
				value={ adjustment }
				onChange={ onUpdateAdjustment }
				isError={ hasError }
			/>
			<FormSelect
				disabled={ ! enabled }
				value={ adjustment_type }
				onChange={ onUpdateAdjustmentType }
			>
				<option value="flat">{ currencySymbol }</option>
				<option value="percentage">%</option>
			</FormSelect>
		</div>
	);
};

ShippingServiceEntry.propTypes = {
	service: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		enabled: PropTypes.bool,
		adjustment: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		adjustment_type: PropTypes.string,
	} ),
	currencySymbol: PropTypes.string.isRequired,
	updateValue: PropTypes.func.isRequired,
	settingsKey: PropTypes.string.isRequired,
};

ShippingServiceEntry.defaultProps = {
	enabled: false,
	adjustment: 0,
	adjustment_type: 'flat',
};

export default ShippingServiceEntry;
