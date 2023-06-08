import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import DataCenterPicker from 'calypso/blocks/data-center-picker';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { useGetSiteSuggestionsQuery } from 'calypso/landing/stepper/hooks/use-get-site-suggestions-query';
import { isInHostingFlow } from 'calypso/landing/stepper/utils/is-in-hosting-flow';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { ONBOARD_STORE } from '../../../../stores';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

export const NewHostedSiteOptions = ( { navigation }: Pick< StepProps, 'navigation' > ) => {
	const { __ } = useI18n();
	const { currentSiteTitle, currentSiteGeoAffinity, planCartItem } = useSelect(
		( select ) => ( {
			currentSiteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			currentSiteGeoAffinity: (
				select( ONBOARD_STORE ) as OnboardSelect
			 ).getSelectedSiteGeoAffinity(),
			planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
		} ),
		[]
	);
	const hostingFlow = useSelector( isInHostingFlow );
	const { goBack, submit } = navigation;
	const [ siteTitle, setSiteTitle ] = React.useState( currentSiteTitle ?? '' );
	const [ siteGeoAffinity, setSiteGeoAffinity ] = React.useState( currentSiteGeoAffinity ?? '' );
	const [ formTouched, setFormTouched ] = React.useState( false );
	const translate = useTranslate();

	const pickedPlanSlug = planCartItem?.product_slug;

	const shouldShowGeoAffinityPicker = pickedPlanSlug
		? isBusinessPlan( pickedPlanSlug ) || isEcommercePlan( pickedPlanSlug )
		: hostingFlow;

	useGetSiteSuggestionsQuery( {
		enabled: ! currentSiteTitle,
		onSuccess: ( response ) => {
			if ( ! siteTitle && response.success === true ) {
				setSiteTitle( response.suggestions[ 0 ].title );
			}
		},
	} );

	const isSiteTitleEmpty = ! siteTitle || siteTitle.trim().length === 0;
	const isFormSubmitDisabled = isSiteTitleEmpty;
	const hasChangedInput = useRef( { geoAffinity: false, title: false } );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( isFormSubmitDisabled ) {
			setFormTouched( true );

			return;
		}

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: hasChangedInput.current.title,
			has_changed_geo_affinity: hasChangedInput.current.geoAffinity,
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
			<FormFieldset
				className={ classNames( 'site-options__form-fieldset', {
					'no-site-picker': ! shouldShowGeoAffinityPicker,
				} ) }
			>
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
			{ shouldShowGeoAffinityPicker && (
				<DataCenterPicker
					onChange={ ( value ) => {
						hasChangedInput.current.geoAffinity = true;
						setSiteGeoAffinity( value );
					} }
					value={ siteGeoAffinity }
					compact
				/>
			) }
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
				backLabelText={ __( 'Back' ) }
				hideBack={ hostingFlow }
				goBack={ goBack }
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
