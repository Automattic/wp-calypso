import { DataForm } from '@automattic/dataviews';
import { CALYPSO_CONTACT } from '@automattic/urls';
import {
	Button,
	__experimentalHStack as HStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	__experimentalVStack as VStack,
	Notice,
	SelectControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useDataFormCountryCodes from './use-data-form-country-codes';
import useVatDetails from './use-vat-details';

const VatRequiredSelectControl = ( { data, field, onChange } ) => (
	<SelectControl
		__next40pxDefaultSize
		__nextHasNoMarginBottom
		disabled={ field.isUpdating || field.isVatAlreadySet }
		label={ field.label }
		value={ field.getValue( { item: data } ) }
		onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
		options={ field.elements }
	/>
);

const VatIdControl = ( { data, field, onChange } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { getValue, id, isUpdating, isVatAlreadySet, label, taxName } = field;
	const { country } = data;

	const vatIdHelp = translate(
		/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
		'To change your %(taxName)s ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
		{
			args: { taxName: taxName ?? translate( 'VAT', { textOnly: true } ) },
			components: {
				contactSupportLink: (
					<a
						target="_blank"
						href={ CALYPSO_CONTACT }
						rel="noreferrer"
						onClick={ () => {
							dispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
						} }
					/>
				),
			},
		}
	);

	return (
		<InputControl
			__next40pxDefaultSize
			disabled={ isUpdating || isVatAlreadySet }
			help={ isVatAlreadySet && vatIdHelp }
			label={ label }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			prefix={ country && <InputControlPrefixWrapper>{ country }</InputControlPrefixWrapper> }
			value={ getValue( { item: data } ) || '' }
		/>
	);
};

const VatRequiredInputControl = ( { data, field, onChange } ) => (
	<InputControl
		__next40pxDefaultSize
		disabled={ field.isUpdating }
		label={ field.label }
		onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
		value={ field.getValue( { item: data } ) || '' }
	/>
);

export default function VatInfoDataForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ localData, setLocalData ] = useState();

	const { isUpdateSuccessful, isUpdating, setVatDetails, vatDetails, updateError } =
		useVatDetails();
	const countryCodes = useDataFormCountryCodes();

	const formData = useMemo( () => {
		const serverData = {
			country: vatDetails.country ?? '',
			id: vatDetails.id ?? '',
			name: vatDetails.name ?? '',
			address: vatDetails.address ?? '',
		};
		return {
			...serverData,
			...localData,
		};
	}, [ localData, vatDetails.address, vatDetails.country, vatDetails.id, vatDetails.name ] );

	const { data: geoData } = useGeoLocationQuery();
	const taxName = useTaxName( formData.country ?? geoData?.country_short ?? 'GB' );

	const isVatAlreadySet = !! vatDetails.id;

	const fields = [
		{
			Edit: VatRequiredSelectControl,
			elements: countryCodes,
			id: 'country',
			isUpdating,
			isVatAlreadySet,
			label: translate( 'Country' ),
			type: 'text',
		},
		{
			Edit: VatIdControl,
			id: 'id',
			isUpdating,
			isVatAlreadySet,
			label: translate( 'VAT ID' ),
			taxName,
		},
		{
			Edit: VatRequiredInputControl,
			id: 'name',
			label: translate( 'Name' ),
			type: 'text',
		},
		{
			Edit: VatRequiredInputControl,
			id: 'address',
			label: translate( 'Address' ),
			type: 'text',
		},
	];

	const form = {
		type: 'regular',
		fields: [ 'country', 'id', 'name', 'address' ],
	};

	const onSubmit = ( e ) => {
		e.preventDefault();
		dispatch( recordTracksEvent( 'calypso_vat_details_update' ) );
		setVatDetails( { ...vatDetails, ...localData } );
	};

	return (
		<form onSubmit={ onSubmit }>
			<VStack spacing={ 4 }>
				<DataForm
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits ) => {
						setLocalData( ( current ) => ( { ...current, ...edits } ) );
					} }
				/>

				{ ! isUpdating && !! updateError && (
					<Notice className="vat-info__notice" isDismissible={ false } status="error">
						{ updateError.message }
					</Notice>
				) }

				{ ! isUpdating && !! isUpdateSuccessful && (
					<Notice className="vat-info__notice" isDismissible={ false } status="success">
						{ translate( 'Your %s details have been updated!', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} ) }
					</Notice>
				) }

				<HStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						className="vat-info__submit-button"
						disabled={ isUpdating }
						isBusy={ isUpdating }
						type="submit"
						variant="primary"
					>
						{ translate( 'Validate and save' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
