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

function getCountry( country: string, options: object[] ): string {
	if ( options.length < 1 ) {
		return country;
	}

	for ( let i = 0; i < options.length; i++ ) {
		if ( options[ i ].value === country ) {
			return country;
		}
	}

	return options[ 0 ].value;
}

export default function CompanyDetailsForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// The partner has already been fetched through e.g. the requireAccessContext
	// controller function, so we do not have to do any further checks.
	const partner = useSelector( getCurrentPartner );
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const showCountryFields = countryOptions.length > 0;
	const submitNotificationId = 'partner-portal-company-details-form';

	const [ name, setName ] = useState( partner?.name ?? '' );
	const [ countryValue, setCountry ] = useState( partner?.address.country ?? '' );
	const [ city, setCity ] = useState( partner?.address.city ?? '' );
	const [ line1, setLine1 ] = useState( partner?.address.line1 ?? '' );
	const [ line2, setLine2 ] = useState( partner?.address.line2 ?? '' );
	const [ postalCode, setPostalCode ] = useState( partner?.address.postal_code ?? '' );
	const [ addressState, setAddressState ] = useState( partner?.address.state ?? '' );

	const country = getCountry( countryValue, countryOptions );
	const stateOptions = stateOptionsMap.hasOwnProperty( country )
		? stateOptionsMap[ country ]
		: false;
	const payload = {
		name: name,
		city: city,
		line1: line1,
		line2: line2,
		country: country,
		postal_code: postalCode,
		state: addressState,
	};

	const updateCompanyDetails = useUpdateCompanyDetailsMutation( {
		onSuccess: () => {
			dispatch(
				successNotice( translate( 'Company details have been updated' ), {
					id: submitNotificationId,
				} )
			);
		},
		onError: ( error: APIError ) => {
			dispatch(
				errorNotice( error.message, {
					id: submitNotificationId,
				} )
			);
		},
	} );

	const handleSubmit = useCallback(
		( e ) => {
			e.preventDefault();

			if ( ! showCountryFields || updateCompanyDetails.isLoading ) {
				return;
			}

			dispatch( removeNotice( submitNotificationId ) );

			updateCompanyDetails.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_update_company_details_submit', {
					partner_id: partner?.id,
					...payload,
				} )
			);
		},
		[
			submitNotificationId,
			showCountryFields,
			payload,
			partner?.id,
			updateCompanyDetails.isLoading,
			updateCompanyDetails.mutate,
			dispatch,
		]
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
						disabled={ updateCompanyDetails.isLoading }
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
							disabled={ updateCompanyDetails.isLoading }
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
								disabled={ updateCompanyDetails.isLoading }
							/>
						</>
					) }

					{ ! showCountryFields && Object.keys( stateOptionsMap ).length === 0 && (
						<TextPlaceholder />
					) }
				</FormFieldset>
				<FormFieldset className="company-details-form__business-address">
					<FormLabel>{ translate( 'Business address' ) }</FormLabel>
					<FormTextInput
						id="line1"
						name="line1"
						placeholder={ translate( 'Street name and house number' ) }
						value={ line1 }
						onChange={ ( event: any ) => setLine1( event.target.value ) }
						disabled={ updateCompanyDetails.isLoading }
					/>
					<FormTextInput
						id="line2"
						name="line2"
						placeholder={ translate( 'Apartment, floor, suite or unit number' ) }
						value={ line2 }
						onChange={ ( event: any ) => setLine2( event.target.value ) }
						disabled={ updateCompanyDetails.isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="postalCode">{ translate( 'Postal code' ) }</FormLabel>
					<FormTextInput
						id="postalCode"
						name="postalCode"
						value={ postalCode }
						onChange={ ( event: any ) => setPostalCode( event.target.value ) }
						disabled={ updateCompanyDetails.isLoading }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="city">{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						id="city"
						name="city"
						value={ city }
						onChange={ ( event: any ) => setCity( event.target.value ) }
						disabled={ updateCompanyDetails.isLoading }
					/>
				</FormFieldset>
				<div className="company-details-form__controls">
					<Button
						primary
						type="submit"
						className="company-details-form__submit"
						disabled={ ! showCountryFields || updateCompanyDetails.isLoading }
						busy={ updateCompanyDetails.isLoading }
					>
						{ translate( 'Update details' ) }
					</Button>
				</div>
			</form>
		</Card>
	);
}
