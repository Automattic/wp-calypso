import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import FilePicker from 'calypso/components/file-picker';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useReferEnterpriseHostingForm from './hooks/use-refer-enterprise-hosting-form';

const CustomFormRadio = ( {
	id,
	label,
	checked,
	onChange,
}: {
	id?: string;
	label: string;
	checked?: boolean;
	onChange: () => void;
} ) => {
	return (
		<div
			className="refer-enterprise-hosting-form__radio"
			onClick={ onChange }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' ) {
					onChange();
				}
			} }
		>
			<FormRadio
				id={ id }
				htmlFor={ id }
				label={ label }
				checked={ checked }
				onChange={ onChange }
			/>
		</div>
	);
};

export default function ReferEnterpriseHostingForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		formData,
		updateFormData,
		validationError,
		updateValidationError,
		submit,
		isPending,
		validate,
	} = useReferEnterpriseHostingForm();
	const [ isSuccess, setIsSuccess ] = useState( false );

	const handleInputChange = (
		name: string,
		value: string | string[] | boolean | File | undefined
	) => {
		updateFormData( name, value );
		updateValidationError( { [ name ]: '' } );
	};

	const handleSubmit = useCallback( async () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_refer_form_submit' ) );

		const error = await validate( formData );

		if ( error ) {
			updateValidationError( error );
		} else {
			submit( formData, {
				onSuccess: () => {
					dispatch( successNotice( translate( 'Your request has been submitted successfully.' ) ) );
					setIsSuccess( true );
				},
				onError: () => {
					dispatch(
						errorNotice( translate( 'An error occurred while submitting your request.' ) )
					);
				},
			} );
		}
	}, [ validate, submit, updateValidationError, formData, dispatch, translate ] );

	const handleBackToMarketplace = () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_marketplace_hosting_enterprise_refer_form_back_to_marketplace'
			)
		);
	};

	if ( isSuccess ) {
		return (
			<Form
				className="refer-enterprise-hosting-form"
				title={ translate( 'WordPress VIP referral sent' ) }
				description={ translate(
					"Your client referral to Enterprise VIP Hosting is appreciated. We'll take it from here and ensure you're updated on our progress."
				) }
			>
				<div className="refer-enterprise-hosting-form__footer">
					<Button
						variant="primary"
						href={ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK }
						onClick={ handleBackToMarketplace }
					>
						{ translate( 'Back to the marketplace' ) }
					</Button>
				</div>
			</Form>
		);
	}

	return (
		<Form
			className="refer-enterprise-hosting-form"
			title={ translate( 'Submit WordPress VIP referral' ) }
			autocomplete="off"
			description={ translate(
				'Once submitted, our team will take it from there. We will keep you informed of our progress along the way. All fields are required unless marked as optional'
			) }
		>
			<FormSection title={ translate( 'End user company information' ) }>
				<FormField
					label={ translate( 'Company name' ) }
					labelFor="companyName"
					error={ validationError.companyName }
				>
					<FormTextInput
						id="companyName"
						name="companyName"
						value={ formData.companyName }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'companyName', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Company address' ) }
					labelFor="address"
					error={ validationError.address }
				>
					<FormTextInput
						id="address"
						name="address"
						value={ formData.address }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'address', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Country code' ) }
					labelFor="countryCode"
					error={ validationError.countryCode }
				>
					<FormTextInput
						id="countryCode"
						name="countryCode"
						value={ formData.countryCode }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'countryCode', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'State/Province Code (optional)' ) } labelFor="state">
					<FormTextInput
						id="state"
						name="state"
						value={ formData.state }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'state', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'City' ) } labelFor="city" error={ validationError.city }>
					<FormTextInput
						id="city"
						name="city"
						value={ formData.city }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'city', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'ZIP/Postal code' ) }
					labelFor="zip"
					error={ validationError.zip }
				>
					<FormTextInput
						id="zip"
						name="zip"
						value={ formData.zip }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'zip', e.target.value )
						}
					/>
				</FormField>
			</FormSection>
			<FormSection title={ translate( 'End user contact information' ) }>
				<div className="refer-enterprise-hosting-form__contact-name">
					<FormField
						label={ translate( 'First name' ) }
						labelFor="firstName"
						error={ validationError.firstName }
					>
						<FormTextInput
							id="firstName"
							name="firstName"
							value={ formData.firstName }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
								handleInputChange( 'firstName', e.target.value )
							}
						/>
					</FormField>

					<FormField
						label={ translate( 'Last name' ) }
						labelFor="lastName"
						error={ validationError.lastName }
					>
						<FormTextInput
							id="lastName"
							name="lastName"
							value={ formData.lastName }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
								handleInputChange( 'lastName', e.target.value )
							}
						/>
					</FormField>
				</div>

				<FormField label={ translate( 'Title' ) } labelFor="title" error={ validationError.title }>
					<FormTextInput
						id="title"
						name="title"
						value={ formData.title }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'title', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Phone (optional)' ) }
					labelFor="phone"
					error={ validationError.phone }
				>
					<FormTextInput
						id="phone"
						name="phone"
						value={ formData.phone }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'phone', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'Email' ) } labelFor="email" error={ validationError.email }>
					<FormTextInput
						id="email"
						name="email"
						value={ formData.email }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'email', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Website' ) }
					labelFor="website"
					error={ validationError.website }
				>
					<FormTextInput
						id="website"
						name="website"
						value={ formData.website }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'website', e.target.value )
						}
					/>
				</FormField>
			</FormSection>
			<FormSection title={ translate( 'Opportunity information' ) }>
				<FormField
					label={ translate( 'Tell us more about this opportunity' ) }
					labelFor="opportunityDescription"
					error={ validationError.opportunityDescription }
				>
					<FormTextarea
						id="opportunityDescription"
						name="opportunityDescription"
						value={ formData.opportunityDescription }
						onChange={ ( e: ChangeEvent< HTMLTextAreaElement > ) =>
							handleInputChange( 'opportunityDescription', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Type of lead' ) }
					labelFor="leadType"
					error={ validationError.leadType }
				>
					<FormSelect
						id="leadType"
						name="leadType"
						value={ formData.leadType }
						onChange={ ( e: ChangeEvent< HTMLSelectElement > ) =>
							handleInputChange( 'leadType', e.target.value )
						}
					>
						<option value="media">{ translate( 'Media' ) }</option>
						<option value="public">{ translate( 'Public sector' ) }</option>
						<option value="other">{ translate( 'Other' ) }</option>
					</FormSelect>
				</FormField>

				<FormField label={ translate( 'Is this a request for proposal (RFP)?' ) }>
					<CustomFormRadio
						id="plans_to_offer_products_yes"
						label={ translate( 'Yes' ) }
						checked={ formData.includeRfp === 'yes' }
						onChange={ () => handleInputChange( 'includeRfp', 'yes' ) }
					/>

					<CustomFormRadio
						id="plans_to_offer_products_no"
						label={ translate( 'No' ) }
						checked={ formData.includeRfp === 'no' }
						onChange={ () => {
							handleInputChange( 'includeRfp', 'no' );
							handleInputChange( 'rfpFile', undefined );
						} }
					/>
				</FormField>

				{ formData.includeRfp === 'yes' && (
					<FilePicker
						accept="*"
						onPick={ ( files: FileList ) => {
							if ( files.length ) {
								handleInputChange( 'rfpFile', files[ 0 ] );
							}
						} }
					>
						<Button variant="secondary" onClick={ () => {} }>
							{ formData.rfpFile ? translate( 'Upload new file' ) : translate( 'Upload RFP file' ) }
						</Button>

						{ formData.rfpFile && (
							<div className="refer-enterprise-hosting-form__rfp-file">
								{ translate( 'Attached file:' ) } { formData.rfpFile.name }
							</div>
						) }
					</FilePicker>
				) }
			</FormSection>

			<div className="refer-enterprise-hosting-form__footer">
				<Button variant="primary" onClick={ handleSubmit } isBusy={ isPending }>
					{ translate( 'Submit VIP referral' ) }
				</Button>
			</div>
		</Form>
	);
}
