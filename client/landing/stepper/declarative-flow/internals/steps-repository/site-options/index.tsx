import { Button, FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import storeImageUrl from 'calypso/assets/images/onboarding/store-onboarding.svg';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

const SiteOptions: Step< {
	submits: {
		siteTitle: string;
		tagline: string;
	};
} > = ( { navigation } ) => {
	const { currentSiteTitle, currentTagline } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentTagline: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription(),
		} ),
		[]
	);

	const { goBack, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ tagline, setTagline ] = React.useState( currentTagline ?? '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const translate = useTranslate();
	const site = useSite();

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const isFormDisabled = ! site;

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

		if ( isFormDisabled ) {
			return;
		}

		await saveSiteSettings( site.ID, {
			blogname: siteTitle,
			blogdescription: tagline,
		} );

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
			has_tagline: !! tagline,
		} );

		submit?.( { siteTitle, tagline } );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( isFormDisabled ) {
			return;
		}

		setFormTouched( true );

		switch ( event.currentTarget.name ) {
			case 'siteTitle':
				return setSiteTitle( event.currentTarget.value );
			case 'tagline':
				return setTagline( event.currentTarget.value );
		}
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
				};
			case 'write':
				return {
					headerText: translate( "First, let's give your blog a name" ),
					headerImage: siteOptionsUrl,
					siteTitleLabel: translate( 'Blog name' ),
					taglineLabel: translate( 'Tagline' ),
					taglineExplanation: translate( 'In a few words, explain what your blog is about.' ),
				};
			case 'build':
			default:
				return {
					headerText: translate( "Let's give your site a name" ),
					headerImage: siteOptionsUrl,
					siteTitleLabel: translate( 'Site name' ),
					taglineLabel: translate( 'Tagline' ),
					taglineExplanation: translate( 'In a few words, explain what your site is about.' ),
				};
		}
	};

	const { headerText, headerImage, siteTitleLabel, taglineLabel, taglineExplanation } =
		getTextsFromIntent( intent );

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset disabled={ isFormDisabled } className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional>
					{ siteTitleLabel }
				</FormLabel>
				<FormInput name="siteTitle" id="siteTitle" value={ siteTitle } onChange={ onChange } />
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional>
					{ taglineLabel }
				</FormLabel>
				<FormInput
					name="tagline"
					id="tagline"
					value={ tagline }
					onChange={ onChange }
					placeholder={ null }
				/>
				<FormSettingExplanation>
					<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
					{ taglineExplanation }
				</FormSettingExplanation>
			</FormFieldset>
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				stepName="site-options"
				shouldHideNavButtons={ false }
				className={ `is-step-${ intent }` }
				headerImageUrl={ headerImage }
				goBack={ goBack }
				isHorizontalLayout
				formattedHeader={
					<FormattedHeader id="site-options-header" headerText={ headerText } align="left" />
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteOptions;
