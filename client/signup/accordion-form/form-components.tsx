import styled from '@emotion/styled';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextArea from 'calypso/components/forms/form-textarea';
import SocialLogo from 'calypso/components/social-logo';

const Label = styled( FormLabel )`
	color: var( --studio-gray-50 );
	font-weight: 400;
	margin-bottom: 24px;
`;

const TextInput = styled( FormTextInput )`
	input&.form-text-input {
		border-radius: 4px;
		line-height: 44px;
		height: 44px;
		font-size: 14px;
		&:focus,
		&:focus:hover {
			border-color: #646970;
			box-shadow: 0 0 0 2px #e2eaf1;
		}
	}
`;

const TextArea = styled( FormTextArea )`
	input&.form-text-area {
		border-radius: 4px;
		line-height: 44px;
		height: 44px;
		font-size: 14px;
		&:focus,
		&:focus:hover {
			border-color: #646970;
			box-shadow: 0 0 0 2px #e2eaf1;
		}
	}
`;

const FlexContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	row-gap: 16px;
	column-gap: 32px;

	.form-fieldset {
		flex-basis: 100%;
	}
	@media ( min-width: 600px ) {
		.form-fieldset {
			flex-basis: 40%;
		}
	}
	.form-label {
		margin-bottom: 10px;
	}
`;

const SocialMediaLabel = styled.span`
	align-items: center;
	display: flex;
	gap: 10px;
`;

const AddressField = styled.div`
	flex-basis: 100%;
	@media ( min-width: 600px ) {
		flex-basis: 85%;
	}
`;

interface TextInputFieldProps {
	name: string;
	label?: TranslateResult;
	placeholder?: TranslateResult;
	value: string;
	error?: TranslateResult | null;
	onChange?: ( event: ChangeEvent< HTMLInputElement > ) => void;
}

export function TextInputField( props: TextInputFieldProps ) {
	return (
		<FormFieldset>
			<Label htmlFor={ props.name }>{ props.label }</Label>
			<TextInput { ...props } isError={ !! props.error } />
			{ props.error && <FormInputValidation isError text={ props.error } /> }
		</FormFieldset>
	);
}

export function TextAreaField( props: TextInputFieldProps ) {
	return (
		<FormFieldset>
			<Label htmlFor={ props.name }>{ props.label }</Label>
			<TextArea
				{ ...props }
				isError={ !! props.error }
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck="false"
			/>
		</FormFieldset>
	);
}

interface SocialMediaProfilesProps {
	facebookProps: TextInputFieldProps;
	twitterProps: TextInputFieldProps;
	linkedinProps: TextInputFieldProps;
	instagramProps: TextInputFieldProps;
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
}

export function SocialMediaProfiles( {
	facebookProps,
	twitterProps,
	linkedinProps,
	instagramProps,
	onChange,
}: SocialMediaProfilesProps ) {
	const translate = useTranslate();

	const twitterLabel = (
		<SocialMediaLabel>
			<SocialLogo size={ 16 } fill="#8C8F94" icon="twitter" />
			{ translate( 'Twitter' ) }
		</SocialMediaLabel>
	);
	const facebookLabel = (
		<SocialMediaLabel>
			<SocialLogo size={ 16 } fill="#8C8F94" icon="facebook" />
			{ translate( 'Facebook' ) }
		</SocialMediaLabel>
	);
	const instagramLabel = (
		<SocialMediaLabel>
			<SocialLogo size={ 16 } fill="#8C8F94" icon="instagram" />
			{ translate( 'Instagram' ) }
		</SocialMediaLabel>
	);
	const linkedinLabel = (
		<SocialMediaLabel>
			<SocialLogo size={ 16 } fill="#8C8F94" icon="linkedin" />
			{ translate( 'LinkedIn' ) }
		</SocialMediaLabel>
	);
	return (
		<>
			<Label>
				{ translate( 'Please enter the following Social Media profile links if you have any.' ) }
			</Label>
			<FlexContainer>
				<TextInputField
					{ ...twitterProps }
					label={ twitterLabel }
					placeholder="https://"
					onChange={ onChange }
				/>
				<TextInputField
					{ ...facebookProps }
					label={ facebookLabel }
					placeholder="https://"
					onChange={ onChange }
				/>
				<TextInputField
					{ ...instagramProps }
					label={ instagramLabel }
					placeholder="https://"
					onChange={ onChange }
				/>
				<TextInputField
					{ ...linkedinProps }
					label={ linkedinLabel }
					placeholder="https://"
					onChange={ onChange }
				/>
			</FlexContainer>
		</>
	);
}

interface ContactInformationProps {
	displayEmailProps: TextInputFieldProps;
	displayPhoneProps: TextInputFieldProps;
	displayAddressProps: TextInputFieldProps;
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
}

export function ContactInformation( {
	displayEmailProps,
	displayPhoneProps,
	displayAddressProps,
	onChange,
}: ContactInformationProps ) {
	const translate = useTranslate();
	return (
		<FlexContainer>
			<TextInputField
				{ ...displayEmailProps }
				label={ translate( 'Email address' ) }
				placeholder="name@example.com"
				onChange={ onChange }
			/>
			<TextInputField
				{ ...displayPhoneProps }
				label={ translate( 'Phone Number' ) }
				placeholder="+1 212 555 55 55"
				onChange={ onChange }
			/>
			<AddressField>
				<TextAreaField
					{ ...displayAddressProps }
					label={ translate( 'Physical address' ) }
					onChange={ onChange }
				/>
			</AddressField>
		</FlexContainer>
	);
}
