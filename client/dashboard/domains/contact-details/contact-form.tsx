import {
	CheckboxControl,
	ExternalLink,
	Flex,
	FlexBlock,
	Notice,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

import './contact-form.scss';

interface ContactFormData {
	firstName: string;
	lastName: string;
	organization: string;
	email: string;
	phone: string;
	country: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	postCode: string;
	optOutTransferLock: boolean;
}

interface ContactFormProps {
	initialData?: Partial< ContactFormData >;
	onSubmit?: ( data: ContactFormData ) => void;
	onCancel?: () => void;
	errors?: Partial< Record< keyof ContactFormData, string > >;
	isSubmitting?: boolean;
}

// Mock data - in a real implementation, this would come from an API
const COUNTRIES = [
	{ label: 'United Kingdom', value: 'GB' },
	{ label: 'United States', value: 'US' },
	{ label: 'Canada', value: 'CA' },
	{ label: 'Brazil', value: 'BR' },
	{ label: 'Germany', value: 'DE' },
	{ label: 'France', value: 'FR' },
	{ label: 'Spain', value: 'ES' },
	{ label: 'Italy', value: 'IT' },
	{ label: 'Netherlands', value: 'NL' },
	{ label: 'Australia', value: 'AU' },
];

export default function ContactForm( {
	initialData = {},
	onSubmit,
	onCancel,
	errors = {},
	isSubmitting = false,
}: ContactFormProps ) {
	const [ formData, setFormData ] = useState< ContactFormData >( {
		firstName: 'Value',
		lastName: 'Value',
		organization: '',
		email: 'email@email.com',
		phone: '+44 1234 567890',
		country: 'GB',
		addressLine1: '',
		addressLine2: '',
		city: 'London',
		postCode: 'NW1 1ED',
		optOutTransferLock: false,
		...initialData,
	} );

	const handleFieldChange = ( field: keyof ContactFormData, value: string | boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ field ]: value,
		} ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit?.( formData );
	};

	return (
		<form onSubmit={ handleSubmit } className="contact-form">
			{ /* First Name & Last Name */ }
			<Flex gap={ 4 }>
				<FlexBlock>
					<TextControl
						label={ __( 'FIRST NAME' ) }
						value={ formData.firstName }
						onChange={ ( value ) => handleFieldChange( 'firstName', value ) }
						error={ errors.firstName }
					/>
				</FlexBlock>
				<FlexBlock>
					<TextControl
						label={ __( 'LAST NAME' ) }
						value={ formData.lastName }
						onChange={ ( value ) => handleFieldChange( 'lastName', value ) }
						error={ errors.lastName }
					/>
				</FlexBlock>
			</Flex>

			{ /* Organisation */ }
			<TextControl
				label={ __( 'ORGANISATION' ) }
				value={ formData.organization }
				onChange={ ( value ) => handleFieldChange( 'organization', value ) }
				placeholder={ __( 'Your organization' ) }
				error={ errors.organization }
			/>

			{ /* Email & Phone */ }
			<Flex gap={ 4 }>
				<FlexBlock>
					<TextControl
						type="email"
						label={ __( 'EMAIL' ) }
						value={ formData.email }
						onChange={ ( value ) => handleFieldChange( 'email', value ) }
						error={ errors.email }
					/>
				</FlexBlock>
				<FlexBlock>
					<TextControl
						label={ __( 'PHONE' ) }
						value={ formData.phone }
						onChange={ ( value ) => handleFieldChange( 'phone', value ) }
						error={ errors.phone }
					/>
				</FlexBlock>
			</Flex>

			{ /* Country */ }
			<SelectControl
				label={ __( 'COUNTRY' ) }
				value={ formData.country }
				onChange={ ( value ) => handleFieldChange( 'country', value ) }
				options={ COUNTRIES }
				error={ errors.country }
			/>

			{ /* Address Line 1 */ }
			<TextControl
				label={ __( 'ADDRESS LINE 1' ) }
				value={ formData.addressLine1 }
				onChange={ ( value ) => handleFieldChange( 'addressLine1', value ) }
				placeholder={ __( 'Address line 1' ) }
				error={ errors.addressLine1 }
			/>

			{ /* Address Line 2 */ }
			<TextControl
				label={ __( 'ADDRESS LINE 2' ) }
				value={ formData.addressLine2 }
				onChange={ ( value ) => handleFieldChange( 'addressLine2', value ) }
				placeholder={ __( 'Address line 2' ) }
				error={ errors.addressLine2 }
			/>

			{ /* City & Post Code */ }
			<Flex gap={ 4 }>
				<FlexBlock>
					<TextControl
						label={ __( 'CITY' ) }
						value={ formData.city }
						onChange={ ( value ) => handleFieldChange( 'city', value ) }
						error={ errors.city }
					/>
				</FlexBlock>
				<FlexBlock>
					<TextControl
						label={ __( 'POST CODE' ) }
						value={ formData.postCode }
						onChange={ ( value ) => handleFieldChange( 'postCode', value ) }
						error={ errors.postCode }
					/>
				</FlexBlock>
			</Flex>

			{ /* Transfer Lock Checkbox */ }
			<CheckboxControl
				label={ __( 'Opt-out of the 60-day transfer lock' ) }
				checked={ formData.optOutTransferLock }
				onChange={ ( value ) => handleFieldChange( 'optOutTransferLock', value ) }
			/>

			{ /* Legal Disclaimer */ }
			<Notice status="info" isDismissible={ false } className="contact-form__legal-notice">
				<p>
					{ __( 'By clicking **Save contact info**, you agree to the applicable' ) }{ ' ' }
					<ExternalLink href="#">{ __( 'Domain Registration Agreement' ) }</ExternalLink>{ ' ' }
					{ __(
						'and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your'
					) }{ ' ' }
					<ExternalLink href="#">{ __( 'Designated Agent' ) }</ExternalLink>.
				</p>
			</Notice>

			{ /* Action Buttons */ }
			<div className="contact-form__actions">
				<Flex gap={ 3 } justify="start">
					<button type="submit" className="contact-form__submit-button" disabled={ isSubmitting }>
						{ __( 'Save contact info' ) }
					</button>
					{ onCancel && (
						<button
							type="button"
							className="contact-form__cancel-button"
							onClick={ onCancel }
							disabled={ isSubmitting }
						>
							{ __( 'Cancel' ) }
						</button>
					) }
				</Flex>
			</div>
		</form>
	);
}
