import { Button, FormInputValidation, Popover } from '@automattic/components';
import { useSiteLogoMutation } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

import './style.scss';

/**
 * Generates an inline SVG for the color picker swatch
 *
 * @param color the color in HEX
 * @returns a value for background-image
 */
function generateSwatchSVG( color: string | undefined ) {
	return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ccc' stroke-width='1' fill='${ encodeURIComponent(
		color || '#fff'
	) }'%3E%3C/circle%3E${
		// render a line when a color isn't selected
		! color
			? `%3Cline x1='18' y1='4' x2='7' y2='20' stroke='%23ccc' stroke-width='1'%3E%3C/line%3E`
			: ''
	}%3C/svg%3E`;
}
const NewsletterSetup: Step = ( { navigation } ) => {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const accentColorRef = React.useRef< HTMLInputElement >( null );

	const site = useSite();

	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ colorPickerOpen, setColorPickerOpen ] = React.useState( false );
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ accentColor, setAccentColor ] = React.useState< string | undefined >();
	const [ url, setUrl ] = React.useState( '' );
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const { mutateAsync: setSiteLogo, isLoading: isUploadingIcon } = useSiteLogoMutation( site?.ID );
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const isLoading = ! site || isUploadingIcon;

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setSiteTitle( site.name || '' );
		setTagline( site.description );
		setUrl( new URL( site.URL ).host );
	}, [ site, formTouched ] );

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
				blogdescription: tagline,
			} );
			recordTracksEvent( 'calypso_signup_site_options_submit', {
				has_site_title: !! siteTitle,
				has_tagline: !! tagline,
			} );

			if ( selectedFile ) {
				try {
					await setSiteLogo( selectedFile );
				} catch ( _error ) {
					// communicate the error to the user
				}
			}

			submit?.( { siteTitle, tagline } );
		}
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( site ) {
			setFormTouched( true );
			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
				case 'tagline':
					return setTagline( event.currentTarget.value );
				case 'accentColor':
					return setAccentColor( event.currentTarget.value );
			}
		}
	};

	const navigateToDomains = () => {
		// TODO
	};

	const siteTitleError =
		formTouched && ! siteTitle.trim()
			? 'Your publication needs a name so your subscribers can identify you.'
			: '';

	const stepContent = (
		<>
			<form className="newsletter-setup__form" onSubmit={ onSubmit }>
				<SiteIconWithPicker
					site={ site }
					onSelect={ setSelectedFile }
					selectedFile={ selectedFile }
				/>
				<Popover
					isVisible={ colorPickerOpen }
					context={ accentColorRef.current }
					position="top left"
					onClose={ () => setColorPickerOpen( false ) }
				>
					<ColorPicker
						disableAlpha
						color={ accentColor || '#000000' }
						onChangeComplete={ ( value ) => setAccentColor( value.hex ) }
					/>
				</Popover>
				<FormFieldset disabled={ isLoading }>
					<FormLabel htmlFor="siteTitle">{ __( 'Publication name*' ) }</FormLabel>
					<FormInput
						value={ siteTitle }
						name="siteTitle"
						id="siteTitle"
						isError={ !! siteTitleError }
						onChange={ onChange }
					/>
					{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
				</FormFieldset>

				<FormFieldset disabled={ isLoading }>
					<FormLabel htmlFor="tagline">{ __( 'Brief description' ) }</FormLabel>
					<FormInput value={ tagline } name="tagline" id="tagline" onChange={ onChange } />
				</FormFieldset>

				<FormFieldset disabled={ isLoading }>
					<FormLabel htmlFor="accentColor">{ __( 'Accent Color' ) }</FormLabel>
					<FormInput
						inputRef={ accentColorRef }
						className="newsletter-setup__accent-color"
						style={ {
							backgroundImage: generateSwatchSVG( accentColor ),
						} }
						type="text"
						name="accentColor"
						id="accentColor"
						onFocus={ () => setColorPickerOpen( ! colorPickerOpen ) }
						readOnly
						value={ accentColor || '#000000' }
					/>
				</FormFieldset>

				<FormFieldset disabled={ isLoading }>
					<FormLabel htmlFor="blogURL">{ __( 'Publication Address' ) }</FormLabel>
					{ ! url ? (
						<FormInput value={ url } disabled={ true } />
					) : (
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						<FormTextInputWithAction
							id="blogURL"
							className={ 'newsletter-setup__url' }
							defaultValue={ url }
							readOnly={ true }
							action="Change"
							onAction={ navigateToDomains }
						/>
					) }
				</FormFieldset>
				<Button
					disabled={ isLoading }
					className="newsletter-setup__submit-button"
					type="submit"
					primary
				>
					{ __( 'Continue' ) }
				</Button>
			</form>
		</>
	);

	return (
		<StepContainer
			stepName={ 'newsletter-setup' }
			goBack={ goBack }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'newsletter' }
			formattedHeader={
				<FormattedHeader
					id={ 'newsletter-setup-header' }
					headerText={ __( 'Setup your Newsletter' ) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default NewsletterSetup;
