/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { languages } from 'languages';
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

const StoreInfo = ( { storeData = {}, onChange, validateFields } ) => {
	const onTimezoneSelect = ( value ) => {
		const e = {
			target: {
				name: 'store_timezone',
				value,
			},
		};
		onChange( e );
	};

	const selectLanguage = ( e ) => {
		const event = {
			target: {
				name: 'store_locale',
				value: e.target.value,
			},
		};
		onChange( event );
	};

	const isError = ( name ) => {
		if ( name === 'store_phone' ) {
			return validateFields && ! ( storeData.name && storeData[ name ].length >= 6 );
		}
		return validateFields && ! storeData[ name ];
	};

	return (
		<div className="setup-steps__store-info-field">
			<p>
				{ translate(
					'Mailchimp needs to know some basic information about your store ' +
						'to provide you with the best experience. Note that every field is required.'
				) }
			</p>
			<SettingsPaymentsLocationCurrency />
			{ fields.map( ( item, index ) => {
				const error = isError( item.name );
				const errorMsg =
					item.name === 'store_phone'
						? translate( 'number needs at least 6 digits' )
						: translate( 'field is required' );
				return (
					<FormFieldset key={ index }>
						<div>
							<FormLabel>{ item.label }</FormLabel>
							<FormTextInput
								name={ item.name }
								isError={ error }
								onChange={ onChange }
								value={ storeData[ item.name ] || '' }
							/>
							{ error && <FormInputValidation isError text={ errorMsg } /> }
						</div>
					</FormFieldset>
				);
			} ) }
			<FormFieldset>
				<FormLabel>
					{ translate( 'Locale' ) }
					<LanguagePicker
						languages={ languages }
						valueKey="langSlug"
						value={ storeData.store_locale }
						onChange={ selectLanguage }
					/>
				</FormLabel>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ translate( 'Store Timezone' ) }</FormLabel>
				<TimeZone selectedZone={ storeData.store_timezone } onSelect={ onTimezoneSelect } />
			</FormFieldset>
		</div>
	);
};

StoreInfo.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object.isRequired,
	validateFields: PropTypes.bool,
};

export default StoreInfo;
