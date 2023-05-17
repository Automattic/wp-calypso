import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import DataCenterPicker from 'calypso/blocks/data-center-picker';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { tip } from 'calypso/signup/icons';
import { ONBOARD_STORE } from '../../../../stores';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

type SuggestionsResponse =
	| {
			success: true;
			suggestions: { title: string }[];
	  }
	| {
			success: false;
	  };

const getSiteSuggestions = (): Promise< SuggestionsResponse > =>
	wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: '/site-suggestions',
	} );

export const NewHostedSiteOptions = ( { navigation }: Pick< StepProps, 'navigation' > ) => {
	const { currentSiteTitle, currentSiteGeoAffinity } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentSiteGeoAffinity: (
				select( ONBOARD_STORE ) as OnboardSelect
			 ).getSelectedSiteGeoAffinity(),
		} ),
		[]
	);

	const { submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ siteGeoAffinity, setSiteGeoAffinity ] = React.useState( currentSiteGeoAffinity ?? '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const translate = useTranslate();

	useQuery( [ 'site-suggestions' ], getSiteSuggestions, {
		enabled: ! currentSiteTitle,
		onSuccess: ( response ) => {
			if ( ! siteTitle && response.success === true ) {
				setSiteTitle( response.suggestions[ 0 ].title );
			}
		},
	} );

	const isSiteTitleEmpty = ! siteTitle || siteTitle.trim().length === 0;
	const isFormSubmitDisabled = isSiteTitleEmpty;

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( isFormSubmitDisabled ) {
			setFormTouched( true );

			return;
		}

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
		} );

		submit?.( { siteTitle, siteGeoAffinity } );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		setFormTouched( true );

		if ( event.currentTarget.name === 'siteTitle' ) {
			return setSiteTitle( event.currentTarget.value );
		}
	};

	const siteTitleError = formTouched && isSiteTitleEmpty;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle">{ translate( 'Site title' ) }</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ siteTitle }
					isError={ siteTitleError }
					onChange={ onChange }
					placeholder={ translate( 'My Hosted Site' ) }
				/>
				{ siteTitleError ? (
					<FormInputValidation isError text={ translate( 'Please provide a site title' ) } />
				) : (
					<FormSettingExplanation className="site-title-optional-explanation">
						<Icon className="site-title-optional-explanation__icon" icon={ tip } size={ 24 } />
						{ translate( "Don't worry, you can change it later." ) }
					</FormSettingExplanation>
				) }
			</FormFieldset>
			<DataCenterPicker onChange={ setSiteGeoAffinity } value={ siteGeoAffinity } compact />
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	const headerText = translate( "Let's create your site" );

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				stepName="site-options"
				shouldHideNavButtons
				headerImageUrl={ siteOptionsUrl }
				hideSkip={ true }
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
