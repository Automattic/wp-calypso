import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

export const VideoPressSiteOptions = ( { navigation }: Pick< StepProps, 'navigation' > ) => {
	const { currentSiteTitle, currentTagline } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentTagline: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription(),
		} ),
		[]
	);

	const { submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle || null );
	const [ tagline, setTagline ] = React.useState( currentTagline || null );
	const translate = useTranslate();

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
			has_tagline: !! tagline,
		} );

		submit?.( { siteTitle, tagline } );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		switch ( event.currentTarget.name ) {
			case 'siteTitle':
				return setSiteTitle( event.currentTarget.value.trim() );
			case 'tagline':
				return setTagline( event.currentTarget.value.trim() );
		}
	};

	const headerText = translate( 'Set up your video site' );

	const isSiteTitleEmpty = siteTitle !== null && siteTitle.length === 0;
	const isTaglineEmpty = tagline !== null && tagline.length === 0;
	const isFormSubmitDisabled = ! tagline || ! siteTitle;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle">{ translate( 'Site name' ) }</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ isSiteTitleEmpty }
					onChange={ onChange }
					placeholder={ translate( 'My Video Site' ) }
				/>
				{ isSiteTitleEmpty && (
					<FormInputValidation isError text={ translate( 'Please provide a site title' ) } />
				) }
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline">{ translate( 'Brief description' ) }</FormLabel>
				<FormTextarea
					name="tagline"
					id="tagline"
					value={ tagline }
					isError={ isTaglineEmpty }
					onChange={ onChange }
					placeholder={ translate( 'Add a short description of your video site here.' ) }
				/>
				{ isTaglineEmpty && (
					<FormInputValidation isError text={ translate( 'Please provide a site description' ) } />
				) }
			</FormFieldset>
			<Button
				disabled={ isFormSubmitDisabled }
				className="site-options__submit-button"
				type="submit"
				primary
			>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				stepName="site-options"
				shouldHideNavButtons
				hideSkip={ true }
				isHorizontalLayout={ false }
				formattedHeader={
					<FormattedHeader
						id="site-options-header"
						headerText={ headerText }
						align="left"
						subHeaderText={ translate( 'Customize some details about your new site.' ) }
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
				showVideoPressPowered
			/>
		</>
	);
};
