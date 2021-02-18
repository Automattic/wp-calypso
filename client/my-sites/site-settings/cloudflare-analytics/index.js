/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from '../wrap-settings-form';
import { Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo.svg';

/**
 * Style dependencies
 */
import './style.scss';

const validateTrackingId = ( code ) => ! code || code.match( /^[a-fA-F0-9]+$/i );

export function CloudflareAnalyticsSettings( {
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
	site,
} ) {
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ loggedCloudflareAnalyticsModified, setLoggedCloudflareAnalyticsModified ] = useState(
		false
	);
	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;
	const handleFieldChange = ( key, value ) => {
		const updatedCloudflareFields = Object.assign( {}, fields.cloudflare || {}, {
			[ key ]: value,
		} );
		updateFields( { cloudflare_analytics: updatedCloudflareFields } );
	};

	const handleCodeChange = ( event ) => {
		const code = event.target.value.trim();
		setIsCodeValid( validateTrackingId( code ) );
		handleFieldChange( 'code', code );
	};

	const handleFieldFocus = () => {
		trackTracksEvent( 'calypso_cloudflare_analytics_key_field_focused', { path } );
		eventTracker( 'Focused Analytics Key Field' )();
	};

	const handleFieldKeypress = () => {
		if ( ! loggedCloudflareAnalyticsModified ) {
			trackTracksEvent( 'calypso_cloudflare_analytics_key_field_modified', { path } );
			setLoggedCloudflareAnalyticsModified( true );
		}
		uniqueEventTracker( 'Typed In Analytics Key Field' )();
	};

	const renderForm = () => {
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const analyticsSupportUrl = 'https://wordpress.com/support/CLOUDFLARE_SUPPORT_URL/'; // TODO: add support link

		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				<SettingsSectionHeader
					disabled={ isSubmitButtonDisabled }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Cloudflare Analytics' ) }
				/>

				<Card className="cloudflare-analytics site-settings__analytics-settings">
					<div className="cloudflare-analytics site-settings__cloudflare-description">
						<div className="cloudflare-analytics site-settings__cloudflare-description-text">
							<p>
								{ translate(
									'At Cloudflare, our mission is to help build a better internet - and part of that ' +
										'is to deliver essential web analytics to everyone with a website without ' +
										'compromising user privacy. For free.'
								) }
							</p>
						</div>

						{ isDesktop() && (
							<div className="cloudflare-analytics site-settings__cloudflare-description-illustration">
								<img src={ cloudflareIllustration } alt="" />
							</div>
						) }
					</div>
					<FormFieldset>
						<FormLabel htmlFor="cloudflareCode">
							{ translate( 'Tracking ID', { context: 'site setting' } ) }
						</FormLabel>
						<FormTextInput
							name="cloudflareCode"
							id="cloudflareCode"
							value={ fields.cloudflare_analytics ? fields.cloudflare_analytics.code : '' }
							onChange={ handleCodeChange }
							placeholder={ placeholderText }
							disabled={ isRequestingSettings || ! enableForm }
							onFocus={ handleFieldFocus }
							onKeyPress={ handleFieldKeypress }
							isError={ ! isCodeValid }
						/>
						{ ! isCodeValid && (
							<FormTextValidation
								isError
								text={ translate( 'Invalid Cloudflare Analytics ID.' ) }
							/>
						) }
					</FormFieldset>
					<p>
						{ translate( '{{a}}Learn more{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl( analyticsSupportUrl ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</p>
				</Card>
			</form>
		);
	};

	// we need to check that site has loaded first... a placeholder would be better,
	// but returning null is better than a fatal error for now
	if ( ! site ) {
		return null;
	}
	return renderForm();
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		path,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
		enableForm: true, // TODO: make this mutually exclusive with Google Analytics?
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps, null, { pure: false } );

const getFormSettings = partialRight( pick, [ 'cloudflare_analytics' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( CloudflareAnalyticsSettings );
