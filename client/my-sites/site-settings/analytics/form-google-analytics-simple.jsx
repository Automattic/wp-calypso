/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

import { CompactCard } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormToggle from 'calypso/components/forms/form-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import googleIllustration from 'calypso/assets/images/illustrations/google-analytics-logo.svg';
import { FEATURE_GOOGLE_ANALYTICS, TYPE_PREMIUM } from 'calypso/lib/plans/constants';
import { findFirstSimilarPlanKey } from 'calypso/lib/plans';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

const validateGoogleAnalyticsCode = ( code ) =>
	! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i );
const GoogleAnalyticsSimpleForm = ( {
	fields,
	updateFields,
	isRequestingSettings,
	isSavingSettings,
	enableForm,
	eventTracker,
	handleSubmitForm,
	path,
	translate,
	trackTracksEvent,
	uniqueEventTracker,
	showUpgradeNudge,
	site,
} ) => {
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ isGoogleEnabled, setIsGoogleEnabled ] = useState( false );
	const [ loggedGoogleAnalyticsModified, setLoggedGoogleAnalyticsModified ] = useState( false );

	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;
	const analyticsSupportUrl = 'https://wordpress.com/support/google-analytics/';
	const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
	const nudgeTitle = translate(
		'Connect your site to Google Analytics in seconds with the Premium plan'
	);

	useEffect( () => {
		if ( fields?.wga?.code ) {
			setIsGoogleEnabled( true );
		} else {
			setIsGoogleEnabled( false );
		}
	}, [ fields ] );

	const handleFieldChange = ( value, callback = () => {} ) => {
		const updatedFields = Object.assign( {}, fields.wga || {}, {
			code: value,
		} );
		updateFields( { wga: updatedFields }, callback );
	};

	const recordSupportLinkClick = () => {
		trackTracksEvent( 'calypso_traffic_settings_google_support_click' );
	};

	const handleCodeChange = ( event ) => {
		const code = event.target.value.trim();
		setIsCodeValid( validateGoogleAnalyticsCode( code ) );
		handleFieldChange( code );
	};

	const handleFieldFocus = () => {
		trackTracksEvent( 'calypso_google_analytics_key_field_focused', { path } );
		eventTracker( 'Focused Analytics Key Field' )();
	};

	const handleFieldKeypress = () => {
		if ( ! loggedGoogleAnalyticsModified ) {
			trackTracksEvent( 'calypso_google_analytics_key_field_modified', { path } );
			setLoggedGoogleAnalyticsModified( true );
		}
		uniqueEventTracker( 'Typed In Analytics Key Field' )();
	};

	const handleFormToggle = () => {
		if ( isGoogleEnabled ) {
			setIsGoogleEnabled( false );
			handleFieldChange( '', () => {
				handleSubmitForm();
			} );
		} else {
			setIsGoogleEnabled( true );
		}
	};

	const renderForm = () => {
		const plan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: TYPE_PREMIUM,
		} );

		const nudge = (
			<UpsellNudge
				description={ translate(
					"Add your unique Measurement ID to monitor your site's performance in Google Analytics."
				) }
				event={ 'google_analytics_settings' }
				feature={ FEATURE_GOOGLE_ANALYTICS }
				plan={ plan }
				showIcon={ true }
				title={ nudgeTitle }
			/>
		);
		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				<SettingsSectionHeader
					disabled={ isSubmitButtonDisabled }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Google' ) }
				/>

				<CompactCard>
					<div className="analytics site-settings__analytics">
						<div className="analytics site-settings__analytics-illustration">
							<img src={ googleIllustration } alt="" />
						</div>
						<div className="analytics site-settings__analytics-text">
							<p className="analytics site-settings__analytics-title">
								{ translate( 'Google Analytics' ) }
							</p>
							<p>
								{ translate(
									'A free analytics tool that offers additional insights into your site.'
								) }
							</p>
							<p>
								<a
									onClick={ recordSupportLinkClick }
									href={ analyticsSupportUrl }
									target="_blank"
									rel="noreferrer"
								>
									{ translate( 'Learn more' ) }
								</a>
							</p>
						</div>
					</div>
					{ isGoogleEnabled && (
						<div>
							<FormFieldset>
								<FormLabel htmlFor="wgaCode">
									{ translate( 'Google Analytics Measurement ID', { context: 'site setting' } ) }
								</FormLabel>
								<FormTextInput
									name="wgaCode"
									id="wgaCode"
									value={ fields.wga ? fields.wga.code : '' }
									onChange={ handleCodeChange }
									placeholder={ placeholderText }
									disabled={ isRequestingSettings || ! enableForm }
									onFocus={ handleFieldFocus }
									onKeyPress={ handleFieldKeypress }
									isError={ ! isCodeValid }
								/>
								{ ! isCodeValid && (
									<FormTextValidation
										isError={ true }
										text={ translate( 'Invalid Google Analytics Measurement ID.' ) }
									/>
								) }
								<ExternalLink
									icon
									href="https://support.google.com/analytics/answer/1032385?hl=en"
									target="_blank"
									rel="noopener noreferrer"
								>
									{ translate( 'Where can I find my Measurement ID?' ) }
								</ExternalLink>
							</FormFieldset>
							<p>
								{ translate(
									'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} ' +
										'with different insights into your traffic. WordPress.com stats and Google Analytics ' +
										'use different methods to identify and track activity on your site, so they will ' +
										'normally show slightly different totals for your visits, views, etc.',
									{
										components: {
											a: <a href={ '/stats/' + site.domain } />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
									{
										components: {
											a: (
												<a
													href={ localizeUrl( analyticsSupportUrl ) }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
							</p>
						</div>
					) }
				</CompactCard>
				{ showUpgradeNudge && site && site.plan ? (
					nudge
				) : (
					<CompactCard>
						<div className="analytics site-settings__analytics">
							<FormToggle
								checked={ isGoogleEnabled }
								disabled={ isRequestingSettings || isSavingSettings }
								onChange={ () => handleFormToggle( ! isGoogleEnabled ) }
							>
								{ translate( 'Add Google' ) }
							</FormToggle>
						</div>
					</CompactCard>
				) }
				<div className="analytics site-settings__analytics-spacer" />
			</form>
		);
	};

	// we need to check that site has loaded first... a placeholder would be better,
	// but returning null is better than a fatal error for now
	if ( ! site ) {
		return null;
	}
	return renderForm();
};

export default GoogleAnalyticsSimpleForm;
