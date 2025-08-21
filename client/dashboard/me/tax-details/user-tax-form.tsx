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
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import useCountryList from '../../app/hooks/use-country-list';
import { geoLocationQuery } from '../../app/queries/geolocation';
import { getTaxName, getDataFormCountryCodes } from '../../utils/tax';
import useDisplayUserTaxNotices from './use-display-user-tax-notices';
import useUserTaxDetails from './use-user-tax-details';
import type {
	UserTaxField,
	UserTaxFormData,
	UserTaxNormalizedField,
	UpdateError,
} from '../../data/types';

export interface UserTaxFormControlProps {
	data: UserTaxFormData;
	field: UserTaxNormalizedField;
	onChange: ( edits: Partial< UserTaxFormData > ) => void;
}

function VatSelectControl( { data, field, onChange }: UserTaxFormControlProps ) {
	const { elements, getValue, id, label, isDisabled, isVatAlreadySet, canUserEdit } = field;

	const options =
		elements?.length === 0
			? [ { label: __( 'Loading…' ), value: '' } ]
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

function VatIdControl( { data, field, onChange }: UserTaxFormControlProps ) {
	const { recordTracksEvent } = useAnalytics();

	const { getValue, id, isDisabled, isVatAlreadySet, canUserEdit, label, taxName } = field;
	const { country } = data;

	const vatIdHelp =
		! canUserEdit &&
		createInterpolateElement(
			sprintf(
				/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
				__(
					'To change your %(taxName)s ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.'
				)
					.replaceAll( '{{contactSupportLink}}', '<contactSupportLink>' )
					.replaceAll( '{{/contactSupportLink}}', '</contactSupportLink>' ),
				{ taxName: taxName ?? __( 'VAT' ) }
			),
			{
				contactSupportLink: (
					<a
						target="_blank"
						href={ CALYPSO_CONTACT }
						rel="noreferrer"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_vat_details_support_click' );
						} }
					/>
				),
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

function VatInputControl( { data, field, onChange }: UserTaxFormControlProps ) {
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

export default function UserTaxForm() {
	const lastUpdateError = useRef< UpdateError >();
	const { recordTracksEvent } = useAnalytics();

	const [ localData, setLocalData ] = useState< Partial< UserTaxFormData > >( {} );

	const {
		isLoading,
		isUpdateSuccessful,
		isUpdating,
		setUserTaxDetails,
		userTaxDetails,
		updateError,
	} = useUserTaxDetails();
	const countryList = useCountryList();
	const countryCodes = getDataFormCountryCodes( countryList );

	const formData = useMemo( () => {
		const serverData = {
			country: userTaxDetails.country ?? '',
			id: userTaxDetails.id ?? '',
			name: userTaxDetails.name ?? '',
			address: userTaxDetails.address ?? '',
		};
		return {
			...serverData,
			...localData,
		};
	}, [
		localData,
		userTaxDetails.address,
		userTaxDetails.country,
		userTaxDetails.id,
		userTaxDetails.name,
	] );

	const { data: geoData } = geoLocationQuery();
	const taxName = getTaxName( countryList, formData.country ?? geoData?.country_short ?? 'GB' );

	useDisplayUserTaxNotices( { error: updateError, success: isUpdateSuccessful, taxName } );
	if ( updateError && lastUpdateError.current !== updateError ) {
		recordTracksEvent( 'calypso_dashboard_vat_details_validation_failure', {
			error: updateError.error,
		} );
		lastUpdateError.current = updateError;
	}

	if ( isUpdateSuccessful ) {
		recordTracksEvent( 'calypso_dashboard_vat_details_validation_success' );
	}

	const isVatAlreadySet = !! userTaxDetails.id;
	const isDisabled = isLoading || isUpdating;
	const canUserEdit = userTaxDetails.can_user_edit ?? false;

	const fields: UserTaxField[] = [
		{
			Edit: VatSelectControl,
			elements: countryCodes,
			id: 'country',
			isDisabled,
			isVatAlreadySet,
			canUserEdit,
			label: __( 'Country' ),
		},
		{
			Edit: VatIdControl,
			id: 'id',
			isDisabled,
			isVatAlreadySet,
			canUserEdit,
			label: __( 'VAT ID' ),
			taxName,
		},
		{
			Edit: VatInputControl,
			id: 'name',
			isDisabled,
			label: __( 'Name' ),
			type: 'text',
		},
		{
			Edit: VatInputControl,
			id: 'address',
			isDisabled,
			label: __( 'Address' ),
			type: 'text',
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ 'country', 'id', 'name', 'address' ],
	};

	const onSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		recordTracksEvent( 'calypso_dashboard_vat_details_update' );
		setUserTaxDetails( { ...userTaxDetails, ...localData } );
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
						disabled={ isDisabled }
						isBusy={ isUpdating }
						type="submit"
						variant="primary"
					>
						{ __( 'Validate and save' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
