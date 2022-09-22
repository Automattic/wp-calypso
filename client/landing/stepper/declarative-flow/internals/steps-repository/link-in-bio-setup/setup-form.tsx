/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button, FormInputValidation } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { Dispatch, FormEvent, SetStateAction, useEffect } from 'react';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { ForwardedAutoresizingFormTextarea } from 'calypso/blocks/comments/autoresizing-form-textarea';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';

interface SetupFormProps {
	site: SiteDetails | null;
	siteTitle: string;
	setComponentSiteTitle: Dispatch< SetStateAction< string > >;
	invalidSiteTitle: boolean;
	setInvalidSiteTitle: Dispatch< SetStateAction< boolean > >;
	tagline: string;
	setTagline: Dispatch< SetStateAction< string > >;
	selectedFile: File | undefined;
	setSelectedFile: Dispatch< SetStateAction< File | undefined > >;
	setBase64Image: Dispatch< SetStateAction< string | null | undefined > >;
	handleSubmit: ( event: FormEvent< Element > ) => void;
}

const SetupForm = ( {
	site,
	siteTitle,
	setComponentSiteTitle,
	invalidSiteTitle,
	setInvalidSiteTitle,
	tagline,
	setTagline,
	selectedFile,
	setSelectedFile,
	setBase64Image,
	handleSubmit,
}: SetupFormProps ) => {
	const { __ } = useI18n();
	const usesSite = !! useSiteSlugParam();

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		switch ( event.currentTarget.name ) {
			case 'link-in-bio-input-name':
				return setComponentSiteTitle( event.currentTarget.value );
			case 'link-in-bio-input-description':
				return setTagline( event.currentTarget.value );
		}
	};

	useEffect( () => {
		if ( siteTitle.trim().length && invalidSiteTitle ) {
			setInvalidSiteTitle( false );
		}
	}, [ siteTitle, invalidSiteTitle, setInvalidSiteTitle ] );

	return (
		<form className="link-in-bio-setup__form" onSubmit={ handleSubmit }>
			<SiteIconWithPicker
				site={ site }
				placeholderText={ __( 'Upload a profile image' ) }
				onSelect={ ( file ) => {
					setSelectedFile( file );
					imageFileToBase64( file );
				} }
				disabled={ usesSite ? ! site : false }
				selectedFile={ selectedFile }
			/>
			<FormFieldset>
				<FormLabel htmlFor="link-in-bio-input-name">{ __( 'Site name' ) }</FormLabel>
				<FormInput
					name="link-in-bio-input-name"
					id="link-in-bio-input-name"
					value={ siteTitle }
					onChange={ onChange }
					placeholder={ __( 'My Link in Bio' ) }
					isError={ invalidSiteTitle }
				/>
				{ invalidSiteTitle && (
					<FormInputValidation
						isError
						text={ __( `Oops. Looks like your Link in Bio doesn't have a name yet.` ) }
					/>
				) }
			</FormFieldset>

			<FormFieldset>
				<FormLabel htmlFor="link-in-bio-input-description">{ __( 'Brief description' ) }</FormLabel>
				<ForwardedAutoresizingFormTextarea
					name="link-in-bio-input-description"
					id="link-in-bio-input-description"
					value={ tagline }
					placeholder={ __( 'Add a short biography here' ) }
					enableAutoFocus={ false }
					onChange={ onChange }
				/>
			</FormFieldset>

			<Button className="link-in-bio-setup-form__submit" primary type="submit">
				{ __( 'Continue' ) }
			</Button>
		</form>
	);
};

export default SetupForm;
