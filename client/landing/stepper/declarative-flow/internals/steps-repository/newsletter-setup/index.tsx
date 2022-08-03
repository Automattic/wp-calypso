import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { FormFileUpload } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { Icon, upload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { FormEvent, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';
import './style.scss';

const NewsletterSetup: Step = ( { navigation } ) => {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();

	const site = useSite();

	const [ formTouched, setFormTouched ] = React.useState( false );
	const [ siteIconUrl, setSiteIconUrl ] = React.useState( '' );
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ url, setUrl ] = React.useState( '' );

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setSiteIconUrl( site.icon?.img || '' );
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
		<form className="newsletter-setup__form" onSubmit={ onSubmit }>
			<FormFieldset className="newsletter-setup__publication-icon" disabled={ ! site }>
				<FormFileUpload
					className={ classNames( 'newsletter-setup__publication-button', {
						'has-icon': siteIconUrl,
					} ) }
					style={ { backgroundImage: `url("${ siteIconUrl }")` } }
					onChange={ () => {
						// TODO
					} }
				>
					{ ! siteIconUrl ? <Icon icon={ upload } /> : <span>{ __( 'Replace' ) } </span> }
				</FormFileUpload>
				{ ! siteIconUrl && (
					<FormSettingExplanation>{ __( 'Upload publication icon' ) }</FormSettingExplanation>
				) }
			</FormFieldset>

			<FormFieldset disabled={ ! site }>
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

			<FormFieldset disabled={ ! site }>
				<FormLabel htmlFor="tagline">{ __( 'Brief description' ) }</FormLabel>
				<FormInput value={ tagline } name="tagline" id="tagline" onChange={ onChange } />
			</FormFieldset>

			<FormFieldset disabled={ ! site }>
				<FormLabel htmlFor="accentColor">{ __( 'Accent Color' ) }</FormLabel>
				<FormInput value={ '' } name="accentColor" id="accentColor" onChange={ onChange } />
			</FormFieldset>

			<FormFieldset disabled={ ! site }>
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
			<Button className="newsletter-setup__submit-button" type="submit" primary>
				{ __( 'Continue' ) }
			</Button>
		</form>
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
