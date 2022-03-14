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

type SocialProfileFormOption = {
	label: TranslateResult;
	logo: ReactElement;
	placeholder: string;
};

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

	const socialProfileFormOptions: Record< SocialProfile, SocialProfileFormOption > = {
		FACEBOOK: {
			label: translate( 'Facebook' ),
			logo: <SocialLogo size={ 22 } icon="facebook" />,
			placeholder: 'https://facebook.com/yourprofile',
		},
		TWITTER: {
			label: translate( 'Twitter' ),
			logo: <SocialLogo size={ 22 } icon="twitter" />,
			placeholder: 'https://twitter.com/yourprofile',
		},
		INSTAGRAM: {
			label: translate( 'Instagram' ),
			logo: <SocialLogo size={ 22 } icon="instagram" />,
			placeholder: 'https://instagram.com/yourprofile',
		},
		LINKEDIN: {
			label: translate( 'Linkedin' ),
			logo: <SocialLogo size={ 22 } icon="linkedin" />,
			placeholder: 'https://linkedin.com/yourprofile',
		},
	};

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
			{ Object.entries( socialProfileFormOptions ).map( ( [ key, socialProfileOption ] ) => (
				<FormFieldset key={ key }>
					<FormLabel htmlFor={ key }>{ socialProfileOption.label }</FormLabel>
					<TextInputWrapper>
						{ socialProfileOption.logo }
						<FormInput
							name={ key }
							id={ key }
							value={ formValues[ key as SocialProfile ] }
							placeholder={ socialProfileOption.placeholder }
							onChange={ onChange }
						/>
					</TextInputWrapper>
				</FormFieldset>
			) ) }
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
