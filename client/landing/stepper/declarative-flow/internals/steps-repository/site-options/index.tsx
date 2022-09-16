/* eslint-disable no-console */
import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import storeImageUrl from 'calypso/assets/images/onboarding/store-onboarding.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const SiteOptions: Step = function SiteOptions( { navigation, flow } ) {
	const [ currentSiteTitle, currentTagling ] = useSelect( ( select ) => {
		return [
			select( ONBOARD_STORE ).getSelectedSiteTitle(),
			select( ONBOARD_STORE ).getSelectedSiteDescription(),
		];
	} );

	const { goBack, goNext, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ tagline, setTagline ] = React.useState( currentTagling ?? '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const translate = useTranslate();
	const site = useSite();
	const isVideoPressFlow = 'videopress' === flow;

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( formTouched ) {
			return;
		}

		setSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site, formTouched ] );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( site ) {
			await saveSiteSettings( site.ID, {
				blogname: siteTitle,
				blogdescription: tagline,
			} );
		}

		if ( isVideoPressFlow || site ) {
			recordTracksEvent( 'calypso_signup_site_options_submit', {
				has_site_title: !! siteTitle,
				has_tagline: !! tagline,
			} );

			submit?.( { siteTitle, tagline } );
		}
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( isVideoPressFlow || site ) {
			setFormTouched( true );

			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
				case 'tagline':
					return setTagline( event.currentTarget.value );
			}
		}
	};

	const getTextsForVideoPressFlow = () => {
		return {
			headerText: translate( 'Set up your video site' ),
			headerImage: undefined,
			siteTitleLabel: translate( 'Site name' ),
			taglineLabel: translate( 'Brief description' ),
			taglineExplanation: translate( 'Add a short description of your video site here.' ),
			subHeaderText: translate( 'Customize some details about your new site.' ),
		};
	};

	const getTextsFromIntent = ( intent: string ) => {
		switch ( intent ) {
			case 'sell':
				return {
					headerText: translate( "First, let's give your store a name" ),
					headerImage: storeImageUrl,
					siteTitleLabel: translate( 'Store name' ),
					taglineLabel: translate( 'Tagline' ),
					taglineExplanation: translate( 'In a few words, explain what your store is about.' ),
					subHeaderText: undefined,
				};
			case 'write':
			default:
				return {
					headerText: translate( "First, let's give your blog a name" ),
					headerImage: siteOptionsUrl,
					siteTitleLabel: translate( 'Blog name' ),
					taglineLabel: translate( 'Tagline' ),
					taglineExplanation: translate( 'In a few words, explain what your blog is about.' ),
					subHeaderText: undefined,
				};
		}
	};

	const isSiteTitleRequired = isVideoPressFlow;
	const isTaglineRequired = isVideoPressFlow;
	const siteTitleError = null;
	const taglineError = null;

	const textsForFlow = isVideoPressFlow
		? getTextsForVideoPressFlow()
		: getTextsFromIntent( intent );

	const {
		headerText,
		headerImage,
		siteTitleLabel,
		taglineLabel,
		taglineExplanation,
		subHeaderText,
	} = textsForFlow;

	const isFormDisabled = ! isVideoPressFlow && ! site;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset disabled={ isFormDisabled } className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional={ ! isSiteTitleRequired }>
					{ siteTitleLabel }
				</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ siteTitleError }
					onChange={ onChange }
					placeholder={ isVideoPressFlow ? translate( 'My Video Site' ) : null }
				/>
				{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
			</FormFieldset>
			<FormFieldset disabled={ isFormDisabled } className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional={ ! isTaglineRequired }>
					{ taglineLabel }
				</FormLabel>
				{ ! isVideoPressFlow && (
					<FormInput
						name="tagline"
						id="tagline"
						value={ tagline }
						isError={ taglineError }
						onChange={ onChange }
						placeholder={ null }
					/>
				) }
				{ isVideoPressFlow && (
					<FormTextarea
						name="tagline"
						id="tagline"
						value={ tagline }
						isError={ taglineError ?? undefined }
						onChange={ onChange }
						placeholder={ taglineExplanation }
					/>
				) }
				{ taglineError && <FormInputValidation isError text={ taglineError } /> }
				{ ! isVideoPressFlow && (
					<FormSettingExplanation>
						<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
						{ taglineExplanation }
					</FormSettingExplanation>
				) }
			</FormFieldset>
			<Button
				disabled={ isFormDisabled }
				className="site-options__submit-button"
				type="submit"
				primary
			>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			shouldHideNavButtons={ isVideoPressFlow }
			stepName={ 'site-options' }
			className={ `is-step-${ intent }` }
			headerImageUrl={ headerImage }
			skipButtonAlign={ 'top' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ ! isVideoPressFlow }
			formattedHeader={
				<FormattedHeader
					id={ 'site-options-header' }
					headerText={ headerText }
					align={ 'left' }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered={ isVideoPressFlow }
		/>
	);
};

export default SiteOptions;
