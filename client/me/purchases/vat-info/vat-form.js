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
import useRecordVatEvents from './use-record-vat-events';
import useVatDetails from './use-vat-details';

const VatSelectControl = ( { data, field, onChange } ) => {
	const translate = useTranslate();

	const options =
		field.elements.length === 0
			? [ { label: translate( 'Loading…' ), value: '' } ]
			: field.elements;

	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			disabled={ field.isDisabled || field.isVatAlreadySet || field.elements.length === 0 }
			label={ field.label }
			value={ field.getValue( { item: data } ) }
			onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
			options={ options }
		/>
	);
};

const VatIdControl = ( { data, field, onChange } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { getValue, id, isDisabled, isVatAlreadySet, label, taxName } = field;
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
			disabled={ isDisabled || isVatAlreadySet }
			help={ isVatAlreadySet && vatIdHelp }
			label={ label }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			prefix={ country && <InputControlPrefixWrapper>{ country }</InputControlPrefixWrapper> }
			value={ getValue( { item: data } ) || '' }
		/>
	);
};

const VatInputControl = ( { data, field, onChange } ) => (
	<InputControl
		__next40pxDefaultSize
		disabled={ field.isDisabled }
		label={ field.label }
		onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
		value={ field.getValue( { item: data } ) || '' }
	/>
);

export default function VatForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ localData, setLocalData ] = useState();

	const { isLoading, isUpdateSuccessful, isUpdating, setVatDetails, vatDetails, updateError } =
		useVatDetails();
	const countryCodes = useDataFormCountryCodes();

	useRecordVatEvents( { updateError, isUpdateSuccessful } );

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
	const isDisabled = isLoading || isUpdating;

	const fields = [
		{
			Edit: VatSelectControl,
			elements: countryCodes,
			id: 'country',
			isDisabled,
			isVatAlreadySet,
			label: translate( 'Country' ),
		},
		{
			Edit: VatIdControl,
			id: 'id',
			isDisabled,
			isVatAlreadySet,
			label: translate( 'VAT ID' ),
			taxName,
		},
		{
			Edit: VatInputControl,
			id: 'name',
			isDisabled,
			label: translate( 'Name' ),
			type: 'text',
		},
		{
			Edit: VatInputControl,
			id: 'address',
			isDisabled,
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
						disabled={ isDisabled }
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
