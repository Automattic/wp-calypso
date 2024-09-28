import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { StateSelect, Input } from 'calypso/my-sites/domains/components/form';
import { getStateLabelText, getPostCodeLabelText, STATE_SELECT_TEXT } from './utils';

const UsAddressFieldset = ( {
	getFieldProps,
	countryCode = 'US',
	contactDetailsErrors,
	arePostalCodesSupported = true,
} ) => {
	const translate = useTranslate();

	return (
		<div className="custom-form-fieldsets__address-fields us-address-fieldset">
			<Input
				label={ translate( 'City' ) }
				{ ...getFieldProps( 'city', { customErrorMessage: contactDetailsErrors?.city } ) }
			/>
			<StateSelect
				label={ getStateLabelText( countryCode ) }
				countryCode={ countryCode }
				selectText={ STATE_SELECT_TEXT[ countryCode ] }
				{ ...getFieldProps( 'state', {
					needsChildRef: true,
					customErrorMessage: contactDetailsErrors?.state,
				} ) }
			/>
			{ arePostalCodesSupported && (
				<Input
					label={ getPostCodeLabelText( countryCode ) }
					{ ...getFieldProps( 'postal-code', {
						customErrorMessage: contactDetailsErrors?.postalCode,
					} ) }
				/>
			) }
		</div>
	);
};

UsAddressFieldset.propTypes = {
	countryCode: PropTypes.string,
	contactDetailsErrors: PropTypes.object,
	arePostalCodesSupported: PropTypes.bool,
};

export default UsAddressFieldset;
