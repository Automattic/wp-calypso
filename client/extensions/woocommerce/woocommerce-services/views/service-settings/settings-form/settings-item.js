/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import NumberField from 'woocommerce/woocommerce-services/components/number-field';
import Text from 'woocommerce/woocommerce-services/components/text';
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import RadioButtons from 'woocommerce/woocommerce-services/components/radio-buttons';
import ShippingClassesField from 'woocommerce/woocommerce-services/components/shipping-classes-field';
import getPackagingManagerLink from 'woocommerce/woocommerce-services/lib/utils/get-packaging-manager-link';
import ShippingServiceGroups from '../shipping-services';
import FormLegend from 'components/forms/form-legend';

const SettingsItem = ( {
	formData,
	layout,
	schema,
	formValueActions,
	storeOptions,
	errors,
	translate,
	site,
	shippingClasses,
} ) => {
	const id = layout.key ? layout.key : layout;
	const updateValue = ( value ) => formValueActions.updateField( id, value );
	const updateSubValue = ( key, val ) => formValueActions.updateField( [ id ].concat( key ), val );
	const fieldValue = formData[ id ];
	const fieldSchema = schema.properties[ id ];
	const fieldType = layout.type || fieldSchema.type || '';
	const fieldError = errors[ '' ] ? errors[ '' ].value || layout.validation_hint || '' : false;

	switch ( fieldType ) {
		case 'radios':
			return (
				<RadioButtons
					valuesMap={ layout.titleMap }
					title={ fieldSchema.title }
					description={ fieldSchema.description }
					value={ fieldValue }
					setValue={ updateValue }
					error={ fieldError }
				/>
			);

		case 'shipping_services':
			return (
				<ShippingServiceGroups
					services={ schema.definitions.services }
					title={ fieldSchema.title }
					description={ fieldSchema.description }
					settings={ fieldValue }
					currencySymbol={ storeOptions.currency_symbol }
					updateValue={ updateSubValue }
					settingsKey={ id }
					errors={ errors }
					generalError={ fieldError }
				/>
			);

		case 'packages':
			return (
				<div>
					<FormLegend>{ translate( 'Saved Packages' ) }</FormLegend>
					{ translate( 'Add and edit saved packages using the {{a}}Packaging Manager{{/a}}.', {
						components: {
							a: <a href={ getPackagingManagerLink( site ) } />,
						},
					} ) }
				</div>
			);

		case 'text':
			return (
				<Text
					id={ id }
					title={ layout.title }
					className={ layout.class }
					value={ fieldValue || layout.description }
				/>
			);

		case 'number':
			return (
				<NumberField
					id={ id }
					title={ fieldSchema.title }
					description={ fieldSchema.description }
					value={ fieldValue }
					placeholder={ layout.placeholder }
					updateValue={ updateValue }
					error={ fieldError }
				/>
			);

		case 'shipping_classes':
			return (
				<ShippingClassesField
					id={ id }
					title={ fieldSchema.title }
					description={ fieldSchema.description }
					value={ fieldValue }
					options={ shippingClasses }
					updateValue={ updateValue }
				/>
			);

		default:
			return (
				<TextField
					id={ id }
					title={ fieldSchema.title }
					description={ fieldSchema.description }
					value={ fieldValue }
					placeholder={ layout.placeholder }
					updateValue={ updateValue }
					error={ fieldError }
				/>
			);
	}
};

SettingsItem.propTypes = {
	layout: PropTypes.oneOfType( [ PropTypes.string.isRequired, PropTypes.object.isRequired ] )
		.isRequired,
	schema: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	formValueActions: PropTypes.object.isRequired,
	errors: PropTypes.object,
};

export default localize( SettingsItem );
