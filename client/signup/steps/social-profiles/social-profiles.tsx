import { Button, FormLabel } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SocialLogo from 'calypso/components/social-logo';
import type { SocialProfilesState, SocialProfileUrlKey } from './types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

const TextInputWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	border-radius: 4px;
	border: 1px solid var( --color-neutral-10 );
	&:focus-within,
	&:focus-within:hover {
		border-color: #646970;
		box-shadow: 0 0 0 2px #e2eaf1;
	}
	&:hover {
		border-color: var( --color-neutral-20 );
	}
	.social-logo {
		opacity: 0.18;
		margin: 11px 0 11px 10px;
	}
	input[type='text'].form-text-input {
		border: none;
		padding-inline-start: 0px;
		&:focus,
		&:focus:hover {
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
	name,
	label,
	logo,
	value,
	placeholder,
	onChange,
}: {
	name: SocialProfileUrlKey;
	label: TranslateResult;
	logo: ReactElement;
	value: string;
	placeholder: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
} ) => (
	<FormFieldset>
		<FormLabel htmlFor={ name }>{ label }</FormLabel>
		<TextInputWrapper>
			{ logo }
			<FormTextInput
				type="text"
				name={ name }
				value={ value }
				placeholder={ placeholder }
				onChange={ onChange }
			/>
		</TextInputWrapper>
	</FormFieldset>
);

export default function SocialProfiles( {
	defaultTwitterUrl = '',
	defaultFacebookUrl = '',
	defaultLinkedinUrl = '',
	defaultInstagramUrl = '',
	onSubmit,
	onSkip,
}: {
	defaultTwitterUrl: string;
	defaultFacebookUrl: string;
	defaultLinkedinUrl: string;
	defaultInstagramUrl: string;
	onSubmit: ( formValues: SocialProfilesState ) => void;
	onSkip: () => void;
} ) {
	const translate = useTranslate();

	const [ formValues, setFormValues ] = useState< SocialProfilesState >( {
		twitterUrl: defaultTwitterUrl,
		facebookUrl: defaultFacebookUrl,
		linkedinUrl: defaultLinkedinUrl,
		instagramUrl: defaultInstagramUrl,
	} );

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
				name="facebookUrl"
				label={ translate( 'Facebook' ) }
				logo={ <SocialLogo size={ 22 } icon="facebook" /> }
				placeholder="https://facebook.com/yourprofile"
				value={ formValues.facebookUrl }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				name="twitterUrl"
				label="X"
				logo={ <SocialLogo size={ 22 } icon="x" /> }
				placeholder="https://x.com/yourprofile"
				value={ formValues.twitterUrl }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				name="instagramUrl"
				label={ translate( 'Instagram' ) }
				logo={ <SocialLogo size={ 22 } icon="instagram" /> }
				placeholder="https://instagram.com/yourprofile"
				value={ formValues.instagramUrl }
				onChange={ onChange }
			/>
			<SocialProfilesFormField
				name="linkedinUrl"
				label={ translate( 'Linkedin' ) }
				logo={ <SocialLogo size={ 22 } icon="linkedin" /> }
				placeholder="https://linkedin.com/yourprofile"
				value={ formValues.linkedinUrl }
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
