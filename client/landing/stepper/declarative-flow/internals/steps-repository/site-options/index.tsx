/* eslint-disable no-console */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';
import './style.scss';

const SiteOptions: Step = function IntentStep( { navigation } ) {
	const { goBack, goNext } = navigation;

	const translate = useTranslate();
	const headerText = translate( "First, let's give your blog a name" );

	const handleSubmit = ( event: React.FormEvent ) => console.log( event );
	const onChange = ( event: React.FormEvent ) => console.log( event );

	// Need to set this up...
	const isSiteTitleRequired = false;
	const isTaglineRequired = false;
	const siteTitle = '';
	const tagline = '';
	const taglineExplanation = 'In a few words, explain what your blog is about.';
	const siteTitleError = null;
	const taglineError = null;

	const stepContent = (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional={ ! isSiteTitleRequired }>
					{ translate( 'Blog name' ) }
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
			<FormFieldset className="site-options__form-fieldset">
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
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			headerImageUrl={ siteOptionsUrl }
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
