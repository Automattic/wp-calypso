import { CALYPSO_CONTACT } from '@automattic/urls';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	__experimentalVStack as VStack,
	SelectControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useDataFormCountryCodes from './use-data-form-country-codes';
import useDisplayVatNotices from './use-display-vat-notices';
import useRecordVatEvents from './use-record-vat-events';
import useVatDetails from './use-vat-details';
import type { VatField, VatFormControlProps, VatFormData } from './types';

function VatSelectControl( { data, field, onChange }: VatFormControlProps ) {
	const translate = useTranslate();

	const { elements, getValue, id, label, isDisabled, isVatAlreadySet, canUserEdit } = field;

	const options =
		elements?.length === 0
			? [ { label: translate( 'Loading…' ), value: '' } ]
			: [ { label: '', value: '' }, ...( elements ?? [] ) ];
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			disabled={ isDisabled || ( isVatAlreadySet && ! canUserEdit ) || elements?.length === 0 }
			label={ label }
			value={ getValue( { item: data } ) }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			options={ options }
		/>
	);
}

function VatIdControl( { data, field, onChange }: VatFormControlProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { getValue, id, isDisabled, isVatAlreadySet, canUserEdit, label, taxName } = field;
	const { country } = data;

	const vatIdHelp =
		! canUserEdit &&
		translate(
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
			disabled={ isDisabled || ( isVatAlreadySet && ! canUserEdit ) }
			help={ isVatAlreadySet && vatIdHelp }
			label={ label }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			prefix={ country && <InputControlPrefixWrapper>{ country }</InputControlPrefixWrapper> }
			value={ getValue( { item: data } ) || '' }
		/>
	);
}

function VatInputControl( { data, field, onChange }: VatFormControlProps ) {
	const { getValue, id, label, isDisabled } = field;

	return (
		<InputControl
			__next40pxDefaultSize
			disabled={ isDisabled }
			label={ label }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			value={ getValue( { item: data } ) || '' }
		/>
	);
}

export default function VatForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ localData, setLocalData ] = useState< Partial< VatFormData > >( {} );

	const { isLoading, isUpdateSuccessful, isUpdating, setVatDetails, vatDetails, updateError } =
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

	useDisplayVatNotices( { error: updateError, success: isUpdateSuccessful, taxName } );
	useRecordVatEvents( { updateError, isUpdateSuccessful } );

	const isVatAlreadySet = !! vatDetails.id;
	const isDisabled = isLoading || isUpdating;
	const canUserEdit = vatDetails.can_user_edit ?? false;

	const fields: VatField[] = [
		{
			Edit: VatSelectControl,
			elements: countryCodes,
			id: 'country',
			isDisabled,
			isVatAlreadySet,
			canUserEdit,
			label: translate( 'Country' ),
		},
		{
			Edit: VatIdControl,
			id: 'id',
			isDisabled,
			isVatAlreadySet,
			canUserEdit,
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
		type: 'regular' as const,
		fields: [ 'country', 'id', 'name', 'address' ],
	};

	const onSubmit = ( e: React.FormEvent ) => {
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
