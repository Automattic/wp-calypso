import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

const formTouchedFactory = ( touched = false ) => ( {
	siteTitle: touched,
	tagline: touched,
} );

export const VideoPressSiteOptions = ( { navigation }: Pick< StepProps, 'navigation' > ) => {
	const { currentSiteTitle, currentTagline } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentTagline: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription(),
		} ),
		[]
	);

	const { submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ tagline, setTagline ] = React.useState( currentTagline ?? '' );
	const translate = useTranslate();
	const [ formTouched, setFormTouched ] = React.useState( formTouchedFactory );

	const isSiteTitleEmpty = siteTitle.length === 0;
	const isTaglineEmpty = tagline.length === 0;

	const isFormSubmitDisabled = isSiteTitleEmpty || isTaglineEmpty;

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( isFormSubmitDisabled ) {
			setFormTouched( formTouchedFactory( true ) );

			return;
		}

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
			has_tagline: !! tagline,
		} );

		submit?.( { siteTitle, tagline } );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		const inputName = event.currentTarget.name;

		setFormTouched( ( value ) => ( {
			...value,
			[ inputName ]: true,
		} ) );

		switch ( inputName ) {
			case 'siteTitle':
				return setSiteTitle( event.currentTarget.value );
			case 'tagline':
				return setTagline( event.currentTarget.value );
		}
	};

	const headerText = translate( 'Set up your video site' );

	const hasSiteTitleError = formTouched.siteTitle && isSiteTitleEmpty;
	const hasTaglineError = formTouched.tagline && isTaglineEmpty;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle">{ translate( 'Site name' ) }</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ hasSiteTitleError }
					onChange={ onChange }
					placeholder={ translate( 'My Video Site' ) }
				/>
				{ hasSiteTitleError && (
					<FormInputValidation isError text={ translate( 'Please provide a site title' ) } />
				) }
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline">{ translate( 'Brief description' ) }</FormLabel>
				<FormTextarea
					name="tagline"
					id="tagline"
					value={ tagline }
					isError={ hasTaglineError }
					onChange={ onChange }
					placeholder={ translate( 'Add a short description of your video site here.' ) }
				/>
				{ hasTaglineError && (
					<FormInputValidation isError text={ translate( 'Please provide a site description' ) } />
				) }
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
				shouldHideNavButtons
				hideSkip
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
