import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import useUpdateCompanyDetailsMutation from 'calypso/state/partner-portal/partner/hooks/use-update-company-details';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

function castAsString( value: any ): string {
	if ( value === null || typeof value === 'undefined' ) {
		return '';
	}

	return String( value );
}

export default function CompanyDetailsForm(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const submitNotificationId = 'company-details-form';

	// The partner has already been fetched through e.g. the requireAccessContext
	// controller function, so we do not have to do any further checks.
	const partner = useSelector( getCurrentPartner );

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ name, setName ] = useState( castAsString( partner?.name ) );
	const [ country, setCountry ] = useState( castAsString( partner?.address.country ) );
	const [ city, setCity ] = useState( castAsString( partner?.address.city ) );
	const [ line1, setLine1 ] = useState( castAsString( partner?.address.line1 ) );
	const [ line2, setLine2 ] = useState( castAsString( partner?.address.line2 ) );
	const [ postalCode, setPostalCode ] = useState( castAsString( partner?.address.postal_code ) );
	const [ addressState, setAddressState ] = useState( castAsString( partner?.address.state ) );

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

	const handleSubmit = useCallback( () => {
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
	}, [ dispatch, updateCompanyDetails ] );

	return (
		<Card className="company-details-form">
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
				<FormLabel htmlFor="addressState">{ translate( 'State' ) }</FormLabel>
				<FormTextInput
					id="addressState"
					name="addressState"
					value={ addressState }
					onChange={ ( event: any ) => setAddressState( event.target.value ) }
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
				<FormLabel htmlFor="country">{ translate( 'Country' ) }</FormLabel>
				<FormTextInput
					id="country"
					name="country"
					value={ country }
					onChange={ ( event: any ) => setCountry( event.target.value ) }
					disabled={ isSubmitting }
				/>
			</FormFieldset>

			<div className="company-details-form__controls">
				<Button
					primary
					className="company-details-form__submit"
					disabled={ isSubmitting }
					busy={ isSubmitting }
					onClick={ handleSubmit }
				>
					{ translate( 'Update details' ) }
				</Button>
			</div>
		</Card>
	);
}
