import { isWpError } from '@automattic/api-core';
import {
	countryListQuery,
	geoLocationQuery,
	userTaxDetailsQuery,
	userTaxDetailsMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	SelectControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, type DataFormControlProps, type Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import InlineSupportLink from '../../components/inline-support-link';
import { wpcomLink } from '../../utils/link';
import { getTaxName, getDataFormCountryCodes, stripCountryCodeFromVatId } from '../../utils/tax';
import type { UserTaxDetails, UserTaxFormData } from '@automattic/api-core';

const SUPPORT_CONTACT_URL = wpcomLink( '/support/contact' );

export type UserTaxFormControlProps = DataFormControlProps< UserTaxFormData >;

/**
 * Per-field configuration that the custom DataForm controls need but that is
 * not part of the DataViews `Field` API. It is provided through React context
 * because `@wordpress/dataviews` strips unknown properties when normalizing
 * fields.
 */
export interface UserTaxFieldConfig {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	canUserEdit?: boolean;
	taxName?: string;
}

const UserTaxFieldContext = createContext< UserTaxFieldConfig >( {} );

export interface UserTaxDetailsUpdateError {
	message: string;
	error?: string;
}
export interface UserTaxDetailsFetchError {
	message: string;
	error?: string;
}

const emptyUserTaxDetails = {};

function VatSelectControl( { data, field, onChange }: UserTaxFormControlProps ) {
	const { isDisabled, isVatAlreadySet, canUserEdit } = useContext( UserTaxFieldContext );
	const { elements, getValue, id, label } = field;

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

	const { isDisabled, isVatAlreadySet, canUserEdit, taxName } = useContext( UserTaxFieldContext );
	const { getValue, id, label } = field;
	const { country } = data;

	const vatIdHelp =
		! canUserEdit &&
		createInterpolateElement(
			sprintf(
				/* translators: %(taxName)s: the name of taxes in the country (eg: "VAT" or "GST"). */
				__(
					'To change your %(taxName)s ID, <contactSupportLink>please contact support</contactSupportLink>.'
				),
				{ taxName: taxName ?? __( 'VAT' ) }
			),
			{
				contactSupportLink: (
					<ExternalLink
						href={ SUPPORT_CONTACT_URL }
						children={ null }
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
	const { isDisabled } = useContext( UserTaxFieldContext );
	const { getValue, id, label } = field;

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
	const { data: countryList } = useSuspenseQuery( countryListQuery() );
	const countryCodes = getDataFormCountryCodes( countryList );
	const { recordTracksEvent } = useAnalytics();

	const [ localData, setLocalData ] = useState< Partial< UserTaxFormData > >( {} );
	const query = useSuspenseQuery( userTaxDetailsQuery() );
	const userTaxDetails: UserTaxDetails = query.data ?? emptyUserTaxDetails;
	const { data: geoData } = useSuspenseQuery( geoLocationQuery() );
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
		userTaxDetails?.address,
		userTaxDetails?.country,
		userTaxDetails?.id,
		userTaxDetails?.name,
	] );
	const taxName = getTaxName( countryList, formData.country ?? geoData?.country_short ?? 'GB' );
	const { createSuccessNotice, createErrorNotice, removeNotice } = useDispatch( noticesStore );
	const mutation = useMutation< UserTaxDetails, Error, UserTaxDetails >( userTaxDetailsMutation() );
	const formatUserTaxDetails = ( data: UserTaxDetails ) => {
		const { country, id } = data;

		if ( !! id && id?.length > 1 ) {
			return { ...data, id: stripCountryCodeFromVatId( id, country ) };
		}

		return data;
	};
	const setUserTaxDetails = ( userTaxDetails: UserTaxDetails ) =>
		mutation.mutate( formatUserTaxDetails( userTaxDetails ), {
			onSuccess() {
				recordTracksEvent( 'calypso_dashboard_vat_details_validation_success' );
				removeNotice( 'vat_info_notice' );
				createSuccessNotice(
					sprintf(
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						__( 'Your %s details have been updated!' ),
						taxName ?? __( 'VAT' )
					),
					{
						id: 'vat_info_notice',
						type: 'snackbar',
					}
				);
			},
			onError: ( error ) => {
				if ( isWpError( error ) ) {
					recordTracksEvent( 'calypso_dashboard_vat_details_validation_failure', {
						error: error.error,
					} );
				}
				removeNotice( 'vat_info_notice' );
				if ( error?.message?.length > 0 ) {
					createErrorNotice( error.message, { type: 'snackbar', id: 'vat_info_notice' } );
					return;
				}
				createErrorNotice(
					sprintf(
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						__( 'An error occurred while fetching %s details.' ),
						taxName ?? __( 'VAT' )
					),
					{
						type: 'snackbar',
						id: 'vat_info_notice',
					}
				);
			},
		} );

	const isVatAlreadySet = !! userTaxDetails.id;
	const isDisabled = query.isLoading || mutation.isPending;
	const canUserEdit = userTaxDetails.can_user_edit ?? false;

	const fields: Field< UserTaxFormData >[] = [
		{
			Edit: VatSelectControl,
			elements: countryCodes,
			id: 'country',
			label: __( 'Country' ),
		},
		{
			Edit: VatIdControl,
			id: 'id',
			label: __( 'VAT ID' ),
		},
		{
			Edit: VatInputControl,
			id: 'name',
			label: __( 'Name' ),
			type: 'text',
		},
		{
			Edit: VatInputControl,
			id: 'address',
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

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	/* This is a call to action for contacting support */
	const contactSupportLinkTitle = __( 'Contact Happiness Engineers' );

	const taxSupportPageURL = localizeUrl( 'https://wordpress.com/support/vat-gst-other-taxes/' );

	/* This is the title of the support page from https://wordpress.com/support/vat-gst-other-taxes/ */
	const taxSupportPageLinkTitle = __( 'VAT, GST, and other taxes' );

	const handleOpenCenterChat = useCallback(
		async ( e: React.MouseEvent< HTMLAnchorElement > ) => {
			e.preventDefault();
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			recordTracksEvent( 'calypso_dashboard_vat_details_support_click' );
		},
		[ recordTracksEvent, setNavigateToRoute, setShowHelpCenter ]
	);

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		__( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;

	return (
		<form onSubmit={ onSubmit }>
			<VStack spacing={ 4 }>
				<UserTaxFieldContext.Provider
					value={ { isDisabled, isVatAlreadySet, canUserEdit, taxName } }
				>
					<DataForm
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits ) => {
							setLocalData( ( current ) => ( { ...current, ...edits } ) );
						} }
					/>
				</UserTaxFieldContext.Provider>

				<Text variant="muted">
					{ createInterpolateElement(
						sprintf(
							/* translators: This is a list of tax-related reasons a customer might need to contact support, %(taxName)s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
							__(
								'If you need to update existing %(taxName)s details, have been charged taxes as a business subject to reverse charges, or do not see your country listed in this form <contactSupportLink>contact our Happiness Engineers</contactSupportLink>. Include your %(taxName)s number and country code when you contact us.'
							),
							{ taxName: taxName ?? fallbackTaxName }
						),
						{
							contactSupportLink: (
								<a
									href={ wpcomLink( '/help' ) }
									title={ contactSupportLinkTitle }
									onClick={ handleOpenCenterChat }
								/>
							),
						}
					) }
				</Text>
				<Text variant="muted">
					{ createInterpolateElement(
						__( 'For more information about taxes, <learnMoreLink>click here</learnMoreLink>.' ),
						{
							learnMoreLink: (
								<InlineSupportLink
									supportLink={ taxSupportPageURL }
									supportPostId={ 234670 } //This is what makes the document appear in a dialogue
									title={ taxSupportPageLinkTitle }
								/>
							),
						}
					) }
				</Text>

				<HStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						disabled={ isDisabled }
						isBusy={ mutation.isPending }
						type="submit"
						variant="primary"
					>
						{ __( 'Save' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
