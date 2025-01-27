import { FormInputValidation } from '@automattic/components';
import styled from '@emotion/styled';
import { Icon } from '@wordpress/icons';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ChangeEvent, ChangeEventHandler, ReactNode } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextArea from 'calypso/components/forms/form-textarea';
import InfoPopover from 'calypso/components/info-popover';
import SocialLogo from 'calypso/components/social-logo';
import { tip } from 'calypso/signup/icons';

// TODO: This probably should be moved out to a more suitable folder name like difm-components
export const Label = styled.label`
	color: var( --studio-gray-50 );
	font-weight: 400;
	font-size: 0.875rem;
	cursor: inherit;
`;

export const LabelLink = styled( Label )`
	text-decoration: underline;
	font-weight: bold;
`;

export const LabelContainer = styled.div`
	margin-bottom: 12px;
`;

export const SubLabel = styled.label`
	font-weight: 400;
	text-decoration-line: none;
	color: ${ ( props ) => ( props.color ? props.color : 'inherited' ) };
	margin-bottom: 16px;
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
	textarea&.form-textarea {
		border-radius: 4px;
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
			// 50% - row gap
			flex-basis: calc( 50% - 16px );
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
	margin-bottom: 12px;
`;

const AddressField = styled.div`
	flex-basis: 100%;
`;

const FormSettingExplanationContainer = styled.div`
	.form-setting-explanation {
		display: flex;
		align-items: center;
		margin: 16px 0;
		font-style: normal;
		color: var( --studio-gray-40 );

		.site-options__form-icon {
			margin-right: 8px;
		}
	}
`;

const StyledFormInputValidation = styled( FormInputValidation )< { isWarning?: boolean } >`
	margin-top: ${ ( props ) => ( props.isWarning ? '24px' : 0 ) };
`;

const FlexFormFieldset = styled( FormFieldset )`
	display: flex;
`;

const StyledFormFieldset = styled( FormFieldset, {
	shouldForwardProp: ( prop ) => prop !== 'hasFillerContentCheckbox',
} )( ( props ) => ( {
	marginBottom: props.hasFillerContentCheckbox ? '12px' : '20px',
} ) );

const StyledFormCheckbox = styled( FormCheckbox )`
	&.form-checkbox {
		margin-right: 6px;
	}
`;

const ClickableLabel = styled( Label )`
	cursor: pointer;
`;

const CharacterCounter = styled.small`
	float: right;
`;

type TextInputFieldProps = {
	name: string;
	label?: TranslateResult;
	placeholder?: TranslateResult;
	value: string;
	error?: TranslateResult | null;
	sublabel?: TranslateResult;
	rows?: number;
	explanation?: TranslateResult;
	disabled?: boolean;
	onChange?: ( event: ChangeEvent< HTMLInputElement > ) => void;
};

export function LabelBlock( { inputName, children }: { inputName?: string; children: ReactNode } ) {
	return (
		<LabelContainer>
			<Label htmlFor={ inputName }>{ children }</Label>
		</LabelContainer>
	);
}

export function TextInputField( props: TextInputFieldProps ) {
	return (
		<FormFieldset>
			{ props.label && <LabelBlock inputName={ props.name }>{ props.label } </LabelBlock> }
			{ props.sublabel && <SubLabel htmlFor={ props.name }>{ props.sublabel }</SubLabel> }
			<TextInput { ...props } isError={ !! props.error } />
			{ props.error && <StyledFormInputValidation isError text={ props.error } /> }
			{ props.explanation && (
				<FormSettingExplanationContainer>
					<FormSettingExplanation>
						<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
						{ props.explanation }
					</FormSettingExplanation>
				</FormSettingExplanationContainer>
			) }
		</FormFieldset>
	);
}

type TextAreaFieldProps = TextInputFieldProps & {
	rows?: number;
	hasFillerContentCheckbox?: boolean;
} & (
		| {
				characterLimit?: never;
				characterLimitError?: never;
				shouldEnforceCharacterLimit?: never;
		  }
		| {
				characterLimitError: TranslateResult;
				characterLimit: number;
				shouldEnforceCharacterLimit?: boolean;
		  }
	);

export function TextAreaField( props: TextAreaFieldProps ) {
	const {
		hasFillerContentCheckbox,
		value,
		characterLimit,
		characterLimitError,
		shouldEnforceCharacterLimit,
		onChange: onChangeFromProps,
		...otherProps
	} = props;

	const onChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		if ( shouldEnforceCharacterLimit ) {
			if ( event.target.value.length <= characterLimit ) {
				return onChangeFromProps?.( event );
			}
			return;
		}
		return onChangeFromProps?.( event );
	};

	return (
		<StyledFormFieldset hasFillerContentCheckbox={ hasFillerContentCheckbox }>
			{ props.label && <LabelBlock inputName={ props.name }>{ props.label } </LabelBlock> }
			{ props.sublabel && <SubLabel htmlFor={ props.name }>{ props.sublabel }</SubLabel> }
			<TextArea
				{ ...otherProps }
				onChange={ onChange }
				value={ value }
				rows={ props.rows ? props.rows : 10 }
				isError={ !! props.error }
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck="false"
			/>
			{ characterLimit && value?.length ? (
				<CharacterCounter>
					{ value.length }/{ characterLimit }
				</CharacterCounter>
			) : null }
			{ characterLimit &&
				( shouldEnforceCharacterLimit
					? value?.length === characterLimit
					: value?.length > characterLimit ) && (
					<StyledFormInputValidation isError={ false } isWarning text={ characterLimitError } />
				) }
			{ props.error && <StyledFormInputValidation isError text={ props.error } /> }
		</StyledFormFieldset>
	);
}

export function CheckboxField( props: {
	checked: boolean;
	name: string;
	value: string;
	onChange: ChangeEventHandler< HTMLInputElement >;
	label: TranslateResult;
	helpText: TranslateResult;
} ) {
	return (
		<FlexFormFieldset>
			<ClickableLabel>
				<>
					<StyledFormCheckbox
						name={ props.name }
						value={ props.value }
						checked={ props.checked }
						onChange={ props.onChange }
					/>
					{ props.label }
				</>
			</ClickableLabel>
			<InfoPopover showOnHover position="top">
				{ props.helpText }
			</InfoPopover>
		</FlexFormFieldset>
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
				{ translate( 'Please enter the following social media profile links if you have any.' ) }
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
					rows={ 3 }
					label={ translate( 'Physical address (if you want a map on your site)' ) }
					onChange={ onChange }
				/>
			</AddressField>
		</FlexContainer>
	);
}

export const HorizontalGrid = styled.div`
	display: flex;
	gap: 20px;
	justify-content: space-between;
	margin-bottom: 20px;
	flex-wrap: wrap;
`;
