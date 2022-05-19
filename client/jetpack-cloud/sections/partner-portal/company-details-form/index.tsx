import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SelectDropdown from 'calypso/components/select-dropdown';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import useUpdateCompanyDetailsMutation from 'calypso/state/partner-portal/partner/hooks/use-update-company-details';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { APIError } from 'calypso/state/partner-portal/types';
import { useCountriesAndStates } from './hooks/use-countries-and-states';
import './style.scss';

export default function CompanyDetailsForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// The partner has already been fetched through e.g. the requireAccessContext
	// controller function, so we do not have to do any further checks.
	const partner = useSelector( getCurrentPartner );
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const submitNotificationId = 'company-details-form';
	const showCountryFields = countryOptions.length > 0;

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ name, setName ] = useState( partner?.name ?? '' );
	const [ country, setCountry ] = useState( partner?.address.country ?? '' );
	const [ city, setCity ] = useState( partner?.address.city ?? '' );
	const [ line1, setLine1 ] = useState( partner?.address.line1 ?? '' );
	const [ line2, setLine2 ] = useState( partner?.address.line2 ?? '' );
	const [ postalCode, setPostalCode ] = useState( partner?.address.postalCode ?? '' );
	const [ addressState, setAddressState ] = useState( partner?.address.state ?? '' );

	const stateOptions = stateOptionsMap.hasOwnProperty( country )
		? stateOptionsMap[ country ]
		: false;

	const updateCompanyDetails = useUpdateCompanyDetailsMutation( {
		onSuccess: () => {
			dispatch(
				successNotice( translate( 'Company details has been updated' ), {
					id: submitNotificationId,
				} )
			);
			setIsSubmitting( false );
		},
		onError: ( error: APIError ) => {
			dispatch(
				errorNotice( error.message, {
					id: submitNotificationId,
				} )
			);
			setIsSubmitting( false );
		},
	} );

	const handleSubmit = useCallback(
		( e ) => {
			e.preventDefault();
			setIsSubmitting( true );
			dispatch( removeNotice( submitNotificationId ) );

			const payload = {
				name: name,
				city: city,
				line1: line1,
				line2: line2,
				country: country,
				postal_code: postalCode,
				state: addressState,
			};

			updateCompanyDetails.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_update_company_details_submit', {
					partner_id: partner?.id,
					...payload,
				} )
			);
		},
		[ dispatch, updateCompanyDetails ]
	);

	return (
		<Card className="company-details-form">
			<form onSubmit={ handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Company name' ) }</FormLabel>
					<FormTextInput
						id="name"
						name="name"
						value={ name }
						onChange={ ( event: any ) => setName( event.target.value ) }
						disabled={ isSubmitting }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="line1">{ translate( 'Address line 1' ) }</FormLabel>
					<FormTextInput
						id="line1"
						name="line1"
						value={ line1 }
						onChange={ ( event: any ) => setLine1( event.target.value ) }
						disabled={ isSubmitting }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="line2">{ translate( 'Address line 2' ) }</FormLabel>
					<FormTextInput
						id="line2"
						name="line2"
						value={ line2 }
						onChange={ ( event: any ) => setLine2( event.target.value ) }
						disabled={ isSubmitting }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						id="city"
						name="city"
						value={ city }
						onChange={ ( event: any ) => setCity( event.target.value ) }
						disabled={ isSubmitting }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="postalCode">{ translate( 'Postal code' ) }</FormLabel>
					<FormTextInput
						id="postalCode"
						name="postalCode"
						value={ postalCode }
						onChange={ ( event: any ) => setPostalCode( event.target.value ) }
						disabled={ isSubmitting }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ translate( 'Country' ) }</FormLabel>
					{ showCountryFields && (
						<SelectDropdown
							className="company-details-form__dropdown"
							initialSelected={ country }
							options={ countryOptions }
							onSelect={ ( option: any ) => {
								setCountry( option.value );
								// Reset the value of state since it no longer matches with the selected country.
								setAddressState( '' );
							} }
							disabled={ isSubmitting }
							isLoading={ countryOptions.length === 0 }
						/>
					) }

					{ ! showCountryFields && <TextPlaceholder /> }
				</FormFieldset>
				<FormFieldset>
					{ showCountryFields && stateOptions && (
						<>
							<FormLabel>{ translate( 'State' ) }</FormLabel>
							<SelectDropdown
								className="company-details-form__dropdown"
								initialSelected={ addressState }
								options={ stateOptions }
								onSelect={ ( option: any ) => {
									setAddressState( option.value );
								} }
								disabled={ isSubmitting }
							/>
						</>
					) }

					{ ! showCountryFields && Object.keys( stateOptionsMap ).length === 0 && (
						<TextPlaceholder />
					) }
				</FormFieldset>
				<div className="company-details-form__controls">
					<Button
						primary
						type="submit"
						className="company-details-form__submit"
						disabled={ ! showCountryFields || isSubmitting }
						busy={ isSubmitting }
					>
						{ translate( 'Update details' ) }
					</Button>
				</div>
			</form>
		</Card>
	);
}
