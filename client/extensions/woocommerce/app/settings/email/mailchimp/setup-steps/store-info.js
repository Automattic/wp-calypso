/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import config from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import LanguagePicker from 'components/language-picker';
import SettingsPaymentsLocationCurrency from 'woocommerce/app/settings/payments/payments-location-currency.js';
import TimeZone from 'components/timezone';
import { translate } from 'i18n-calypso';

const fields = [
	{ name: 'store_name', label: translate( 'Store Name' ) },
	{ name: 'store_phone', label: translate( 'Phone' ) },
	{ name: 'admin_email', label: translate( 'Admin Email' ) },
];

const StoreInfo = ( { storeData, onChange, validateFields } ) => {
	const onTimezoneSelect = ( value ) => {
		const e = { target: {
			name: 'store_timezone',
			value
		} };
		onChange( e );
	};

	const selectLanguage = ( e ) => {
		const event = { target: {
			name: 'store_locale',
			value: e.target.value,
		} };
		onChange( event );
	};

	return (
		<FormFieldset className="setup-steps__store-info-field">
			<div>{ translate( 'Make sure that store informatin is correct. Every field is required' ) }</div>
			<SettingsPaymentsLocationCurrency />
			{ fields.map( ( item, index ) => (
				<div key={ index }>
					<FormLabel>
						{ item.label }
					</FormLabel>
					<FormTextInput
						name={ item.name }
						isError={ validateFields && ! storeData[ item.name ] }
						onChange={ onChange }
						value={ storeData[ item.name ] || '' }
					/>
					{ ( validateFields && ! storeData[ item.name ] ) && <FormInputValidation iserror text="field is required" /> }
				</div>
			) ) }
			<FormLabel>
				{ translate( 'Locale' ) }
				<LanguagePicker
					languages={ config( 'languages' ) }
					valueKey="langSlug"
					value={ storeData.store_locale }
					onChange={ selectLanguage }
				/>
			</FormLabel>
			<FormLabel>
				{ translate( 'Store Timezone' ) }
			</FormLabel>
			<TimeZone
				selectedZone={ storeData.store_timezone }
				onSelect={ onTimezoneSelect } />
		</FormFieldset>
	);
};

StoreInfo.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object,
	validateFields: PropTypes.bool
};

export default StoreInfo;
