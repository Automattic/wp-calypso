import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import SocialLogo from 'calypso/components/social-logo';
import type { SocialProfile, SocialProfilesState } from 'calypso/state/difm/social-profiles/schema';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

const TextInputWrapper = styled.div`
	display: flex;
	align-items: center;
	border: 1px solid #646970;
	box-sizing: border-box;
	border-radius: 4px;

	.social-logo {
		opacity: 0.18;
		margin: 11px 0 11px 10px;
	}
	input[type='text'].form-text-input {
		border: none;
		padding-left: 10px;
		&:focus {
			box-shadow: none;
		}
		&::placeholder {
			color: var( --studio-gray-30 );
		}
	}
`;

const ButtonWrapper = styled.div`
	display: flex;
	align-items: center;
	margin-top: 40px;
	gap: 24px;
`;

const ActionButton = styled( Button )`
	padding: 9px 48px;
	border-radius: 4px;
	font-weight: 500;
`;

const SocialProfilesFormField = ( {
	socialProfileId,
	label,
	logo,
	value,
	placeholder,
	onChange,
}: {
	socialProfileId: SocialProfile;
	label: TranslateResult;
	logo: ReactElement;
	value: string;
	placeholder: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
} ) => (
	<FormFieldset>
		<FormLabel htmlFor={ socialProfileId }>{ label }</FormLabel>
		<TextInputWrapper>
			{ logo }
			<FormInput
				name={ socialProfileId }
				id={ socialProfileId }
				value={ value }
				placeholder={ placeholder }
				onChange={ onChange }
			/>
		</TextInputWrapper>
	</FormFieldset>
);

export default function SocialProfiles( {
	initialSocialProfiles,
	onSubmit,
	onSkip,
}: {
	initialSocialProfiles: SocialProfilesState;
	onSubmit: ( formValues: SocialProfilesState ) => void;
	onSkip: () => void;
} ) {
	const translate = useTranslate();

	const [ formValues, setFormValues ] = useState( initialSocialProfiles );

	const onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setFormValues( ( value ) => ( {
			...value,
			[ event.target.name ]: event.target.value,
		} ) );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		onSubmit( formValues );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<SocialProfilesFormField
				socialProfileId="FACEBOOK"
				label={ translate( 'Facebook' ) }
				logo={ <SocialLogo size={ 22 } icon="facebook" /> }
				placeholder="https://facebook.com/yourprofile"
				value={ formValues[ 'FACEBOOK' ] }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				socialProfileId="TWITTER"
				label={ translate( 'Twitter' ) }
				logo={ <SocialLogo size={ 22 } icon="twitter" /> }
				placeholder="https://twitter.com/yourprofile"
				value={ formValues[ 'TWITTER' ] }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				socialProfileId="INSTAGRAM"
				label={ translate( 'Instagram' ) }
				logo={ <SocialLogo size={ 22 } icon="instagram" /> }
				placeholder="https://instagram.com/yourprofile"
				value={ formValues[ 'INSTAGRAM' ] }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				socialProfileId="LINKEDIN"
				label={ translate( 'Linkedin' ) }
				logo={ <SocialLogo size={ 22 } icon="linkedin" /> }
				placeholder="https://linkedin.com/yourprofile"
				value={ formValues[ 'LINKEDIN' ] }
				onChange={ onChange }
			/>
			<ButtonWrapper>
				<ActionButton type="submit" primary>
					{ translate( 'Continue' ) }
				</ActionButton>
				<ActionButton borderless onClick={ onSkip }>
					{ translate( 'Skip' ) }
				</ActionButton>
			</ButtonWrapper>
		</form>
	);
}
