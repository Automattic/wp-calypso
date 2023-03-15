/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button, FormInputValidation } from '@automattic/components';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { Dispatch, FormEvent, ReactChild, SetStateAction, useEffect } from 'react';
import { ForwardedAutoresizingFormTextarea } from 'calypso/blocks/comments/autoresizing-form-textarea';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface TranslatedStrings {
	titlePlaceholder?: string;
	titleMissing?: string;
	taglinePlaceholder?: string;
	iconPlaceholder?: string;
}
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
	translatedText?: TranslatedStrings;
	isLoading?: boolean;
	isSubmitError?: boolean;
	children?: ReactChild | ReactChild[];
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
	translatedText,
	isLoading = false,
	isSubmitError = false,
	children,
}: SetupFormProps ) => {
	const { __ } = useI18n();
	const usesSite = !! useSiteSlugParam();

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	useEffect( () => {
		if ( siteTitle.trim().length && invalidSiteTitle ) {
			setInvalidSiteTitle( false );
		}
	}, [ siteTitle, invalidSiteTitle, setInvalidSiteTitle ] );

	return (
		<form className="setup-form__form" onSubmit={ handleSubmit }>
			<SiteIconWithPicker
				site={ site }
				placeholderText={ translatedText?.iconPlaceholder || __( 'Upload a profile image' ) }
				onSelect={ ( file ) => {
					setSelectedFile( file );
					imageFileToBase64( file );
				} }
				disabled={ usesSite ? ! site : false }
				selectedFile={ selectedFile }
			/>
			<FormFieldset>
				<TextControl
					label={ __( 'Site name' ) }
					name="setup-form-input-name"
					id="setup-form-input-name"
					className="setup-form-input-name"
					value={ siteTitle }
					onChange={ ( value ) => setComponentSiteTitle( value ) }
					placeholder={ translatedText?.titlePlaceholder || __( 'My Site Name' ) }
				/>
				{ invalidSiteTitle && (
					<FormInputValidation
						isError
						text={
							translatedText?.titleMissing ||
							__( `Oops. Looks like your site doesn't have a name yet.` )
						}
					/>
				) }
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="setup-form-input-description">{ __( 'Brief description' ) }</FormLabel>
				<ForwardedAutoresizingFormTextarea
					name="setup-form-input-description"
					id="setup-form-input-description"
					value={ tagline }
					placeholder={ translatedText?.taglinePlaceholder || __( 'Add a short description here' ) }
					enableAutoFocus={ false }
					onChange={ ( event: React.FormEvent< HTMLInputElement > ) =>
						setTagline( event.currentTarget.value )
					}
				/>
			</FormFieldset>
			{ children }
			<Button className="setup-form__submit" disabled={ isLoading } type="submit">
				{ isLoading ? __( 'Loading' ) : __( 'Continue' ) }
			</Button>
			{ isSubmitError && (
				<FormInputValidation
					isError={ isSubmitError }
					text={ __( 'Oops, there was an issue! Please try again.' ) }
				/>
			) }
		</form>
	);
};

export default SetupForm;
