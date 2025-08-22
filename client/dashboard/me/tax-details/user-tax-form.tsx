import { CALYPSO_CONTACT } from '@automattic/urls';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	__experimentalVStack as VStack,
	SelectControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { countryListQuery } from '../../app/queries/countries';
import { geoLocationQuery } from '../../app/queries/geo';
import { userTaxDetailsMutation, userTaxDetailsQuery } from '../../app/queries/me-tax-details';
import { getTaxName, getDataFormCountryCodes, stripCountryCodeFromVatId } from '../../utils/tax';
import type {
	UserTaxField,
	UserTaxFormData,
	UserTaxNormalizedField,
	UserTaxDetails,
	SetUserTaxDetails,
} from '../../data/types';

export interface UserTaxFormControlProps {
	data: UserTaxFormData;
	field: UserTaxNormalizedField;
	onChange: ( edits: Partial< UserTaxFormData > ) => void;
}

export interface UpdateError {
	message: string;
	error: string;
}
export interface FetchError {
	message: string;
	error: string;
}

export interface UserTaxDetailsManager {
	userTaxDetails: UserTaxDetails;
	isLoading: boolean;
	isUpdating: boolean;
	isUpdateSuccessful: boolean;
	fetchError: FetchError | null;
	updateError: UpdateError | null;
	setUserTaxDetails: SetUserTaxDetails;
}

const emptyUserTaxDetails = {};

export function useUserTaxDetails(): UserTaxDetailsManager {
	const query = useQuery< UserTaxDetails, FetchError >( userTaxDetailsQuery() );
	const mutation = useMutation< UserTaxDetails, UpdateError, UserTaxDetails >(
		userTaxDetailsMutation()
	);
	const formatUserTaxDetails = useCallback( ( data: UserTaxDetails ) => {
		const { country, id } = data;

		if ( !! id && id?.length > 1 ) {
			return { ...data, id: stripCountryCodeFromVatId( id, country ) };
		}

		return data;
	}, [] );
	const setDetails = useCallback(
		( userTaxDetails: UserTaxDetails ) => {
			return mutation.mutateAsync( formatUserTaxDetails( userTaxDetails ) );
		},
		[ mutation, formatUserTaxDetails ]
	);

	return useMemo(
		() => ( {
			userTaxDetails: query.data ?? emptyUserTaxDetails,
			isLoading: query.isLoading,
			isUpdating: mutation.isPending,
			isUpdateSuccessful: mutation.isSuccess,
			fetchError: query.error as FetchError,
			updateError: mutation.error,
			setUserTaxDetails: setDetails,
		} ),
		[ query, setDetails, mutation ]
	);
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
	const lastFetchError = useRef< FetchError >();
	const { createSuccessNotice, createErrorNotice, removeNotice } = useDispatch( noticesStore );
	const lastUpdateError = useRef< UpdateError >();
	const { recordTracksEvent } = useAnalytics();

	const [ localData, setLocalData ] = useState< Partial< UserTaxFormData > >( {} );

	const {
		isLoading,
		isUpdateSuccessful,
		isUpdating,
		setUserTaxDetails,
		userTaxDetails,
		fetchError,
		updateError,
	} = useUserTaxDetails();
	const { data: countryList } = useSuspenseQuery( countryListQuery() );
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

	const { data: geoData } = useSuspenseQuery( geoLocationQuery() );
	const taxName = getTaxName( countryList, formData.country ?? geoData?.country_short ?? 'GB' );

	useEffect( () => {
		if ( updateError && lastUpdateError.current !== updateError ) {
			removeNotice( 'vat_info_notice' );
			createErrorNotice( updateError.message, { type: 'snackbar', id: 'vat_info_notice' } );
			recordTracksEvent( 'calypso_dashboard_vat_details_validation_failure', {
				error: updateError.error,
			} );
			lastUpdateError.current = updateError;
		}

		if ( isUpdateSuccessful ) {
			removeNotice( 'vat_info_notice' );
			createSuccessNotice(
				sprintf(
					/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
					__( 'Your %s details have been updated!' ),
					taxName ?? __( 'VAT' )
				),
				{
					id: 'vat_info_notice',
				}
			);
			recordTracksEvent( 'calypso_dashboard_vat_details_validation_success' );
		}
		if ( fetchError && lastFetchError.current !== fetchError ) {
			recordTracksEvent( 'calypso_dashboard_vat_details_fetch_failure', {
				error: fetchError.error,
				message: fetchError.message,
			} );
			lastFetchError.current = fetchError;
		}

		if ( fetchError ) {
			removeNotice( 'vat_info_notice' );
			createErrorNotice(
				/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
				sprintf( __( 'An error occurred while fetching %s details.' ), taxName ?? __( 'VAT' ) ),
				{
					type: 'snackbar',
					id: 'vat_info_notice',
				}
			);
		}
	}, [
		taxName,
		isUpdateSuccessful,
		fetchError,
		updateError,
		lastUpdateError,
		removeNotice,
		createErrorNotice,
		createSuccessNotice,
		recordTracksEvent,
	] );

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
