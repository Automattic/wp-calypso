/* eslint-disable no-console */
import { Button } from '@automattic/components';
import { useHas3PC } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import storeImageUrl from 'calypso/assets/images/onboarding/store-onboarding.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const SiteOptions: Step = function SiteOptions( { navigation } ) {
	const { goBack, goNext, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const site = useSite();
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const translate = useTranslate();

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const handleSubmit = async ( event: React.FormEvent ) => {
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
			switch ( event.currentTarget.name ) {
				case 'siteTitle':
					return setSiteTitle( event.currentTarget.value );
				case 'tagline':
					return setTagline( event.currentTarget.value );
			}
		}
	};

	const getTextsFromIntent = ( intent: string ) => {
		switch ( intent ) {
			case 'sell':
				return {
					headerText: translate( "First, let's give your store a name" ),
					headerImage: storeImageUrl,
					siteTitleLabel: translate( 'Store name' ),
					taglineExplanation: translate( 'In a few words, explain what your store is about.' ),
				};
			case 'write':
			default:
				return {
					headerText: translate( "First, let's give your blog a name" ),
					headerImage: siteOptionsUrl,
					siteTitleLabel: translate( 'Blog name' ),
					taglineExplanation: translate( 'In a few words, explain what your blog is about.' ),
				};
		}
	};

	const isSiteTitleRequired = false;
	const isTaglineRequired = false;
	const siteTitleError = null;
	const taglineError = null;

	const { headerText, headerImage, siteTitleLabel, taglineExplanation } =
		getTextsFromIntent( intent );

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset disabled={ ! site } className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional={ ! isSiteTitleRequired }>
					{ siteTitleLabel }
				</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ siteTitleError }
					onChange={ onChange }
				/>
				{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
			</FormFieldset>
			<FormFieldset disabled={ ! site } className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional={ ! isTaglineRequired }>
					{ translate( 'Tagline' ) }
				</FormLabel>
				<FormInput
					name="tagline"
					id="tagline"
					value={ tagline }
					isError={ taglineError }
					onChange={ onChange }
				/>
				{ taglineError && <FormInputValidation isError text={ taglineError } /> }
				<FormSettingExplanation>
					<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
					{ taglineExplanation }
				</FormSettingExplanation>
			</FormFieldset>
			<Button disabled={ ! site } className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
			<p>
				<strong>Has 3PC: </strong>
				{ useHas3PC().hasCookies ? 'yes' : 'no' }
			</p>
		</form>
	);

	return (
		<StepContainer
			stepName={ 'site-options' }
			className={ `is-step-${ intent }` }
			headerImageUrl={ headerImage }
			skipButtonAlign={ 'top' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader id={ 'site-options-header' } headerText={ headerText } align={ 'left' } />
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteOptions;
