import { Button, FormInputValidation, Spinner } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useSelect } from '@wordpress/data';
import { Icon, shuffle } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useState } from 'react';
import DataCenterPicker from 'calypso/blocks/data-center-picker';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { useGetSiteSuggestionsQuery } from 'calypso/landing/stepper/hooks/use-get-site-suggestions-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { ONBOARD_STORE } from '../../../../stores';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

export const NewHostedSiteOptions = ( { navigation }: Pick< StepProps, 'navigation' > ) => {
	const { __ } = useI18n();
	const { currentSiteTitle, currentSiteGeoAffinity } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentSiteGeoAffinity: (
				select( ONBOARD_STORE ) as OnboardSelect
			 ).getSelectedSiteGeoAffinity(),
		} ),
		[]
	);
	const { goBack, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ siteGeoAffinity, setSiteGeoAffinity ] = React.useState( currentSiteGeoAffinity ?? '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const translate = useTranslate();

	const [ shouldOverrideSiteTitle, setShouldOverrideSiteTitle ] = useState( false );

	const { refetch, isFetching } = useGetSiteSuggestionsQuery( {
		params: {
			dictionary: 'hosting',
		},
		enabled: shouldOverrideSiteTitle,
		refetchOnWindowFocus: false,
		onSuccess: ( response ) => {
			if ( response.success === true ) {
				setSiteTitle( response.suggestions[ 0 ].title );
			}
		},
	} );

	const isSiteTitleEmpty = ! siteTitle || siteTitle.trim().length === 0;
	const isFormSubmitDisabled = isSiteTitleEmpty;
	const hasChangedInput = useRef( { title: false, geoAffinity: false } );
	const isSmallScreen = useMobileBreakpoint();

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( isFormSubmitDisabled ) {
			setFormTouched( true );

			return;
		}

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: true,
			has_geo_affinity: hasChangedInput.current.geoAffinity,
		} );

		submit?.( { siteTitle, siteGeoAffinity } );
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		setFormTouched( true );

		if ( event.currentTarget.name === 'siteTitle' ) {
			hasChangedInput.current.title = true;
			return setSiteTitle( event.currentTarget.value );
		}
	};

	const siteTitleError = formTouched && isSiteTitleEmpty;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle">{ translate( 'Give your site a name' ) }</FormLabel>
				<div css={ { position: 'relative' } }>
					<FormInput
						name="siteTitle"
						id="siteTitle"
						value={ siteTitle }
						isError={ siteTitleError }
						onChange={ onChange }
						placeholder={ translate( 'My Hosted Site' ) }
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
					/>
					<Button
						css={ {
							position: 'absolute',
							top: 0,
							right: '1rem',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							color: 'var(--color-text) !important',
						} }
						borderless
						onClick={ () => {
							if ( shouldOverrideSiteTitle ) {
								refetch();
							} else {
								setShouldOverrideSiteTitle( true );
							}

							recordTracksEvent( 'calypso_signup_site_options_fetch_suggestion_click', {
								source: 'site_title',
								has_changed_title: hasChangedInput.current.title,
							} );
						} }
						aria-label={ translate( 'Generate a random site name' ) }
					>
						{ ! isFetching && (
							<>
								<Icon icon={ shuffle } fill="currentColor" />
								{ ! isSmallScreen && translate( 'Generate' ) }
							</>
						) }
						{ isFetching && <Spinner size={ 16 } /> }
					</Button>
				</div>
				{ siteTitleError ? (
					<FormInputValidation isError text={ translate( 'Please provide a site title' ) } />
				) : (
					<FormSettingExplanation className="site-title-optional-explanation">
						<Icon className="site-title-optional-explanation__icon" icon={ tip } size={ 24 } />
						{ translate( "Don't worry, you can change it later." ) }
					</FormSettingExplanation>
				) }
			</FormFieldset>
			<DataCenterPicker
				onChange={ ( value ) => {
					hasChangedInput.current.geoAffinity = true;
					setSiteGeoAffinity( value );
				} }
				value={ siteGeoAffinity }
				compact
			/>
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
				backLabelText={ __( 'Back' ) }
				goBack={ goBack }
				skipLabelText={ __( 'Migrate a site' ) }
				goNext={ () => window.location.assign( '/setup/import-hosted-site' ) }
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
