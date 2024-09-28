import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Input } from 'calypso/my-sites/domains/components/form';

const UkAddressFieldset = ( {
	getFieldProps,
	contactDetailsErrors,
	arePostalCodesSupported = true,
} ) => {
	const translate = useTranslate();

	return (
		<div className="custom-form-fieldsets__address-fields uk-address-fieldset">
			<Input
				label={ translate( 'City' ) }
				{ ...getFieldProps( 'city', { customErrorMessage: contactDetailsErrors?.city } ) }
			/>
			{ arePostalCodesSupported && (
				<Input
					label={ translate( 'Postal Code' ) }
					{ ...getFieldProps( 'postal-code', {
						customErrorMessage: contactDetailsErrors?.postalCode,
					} ) }
				/>
			) }
		</div>
	);
};

UkAddressFieldset.propTypes = {
	getFieldProps: PropTypes.func,
	contactDetailsErrors: PropTypes.object,
	arePostalCodesSupported: PropTypes.bool,
};

export default UkAddressFieldset;
