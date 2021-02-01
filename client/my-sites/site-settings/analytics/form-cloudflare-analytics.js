/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { hasSiteAnalyticsFeature } from '../utils';
import wrapSettingsForm from '../wrap-settings-form';
import { CompactCard } from '@automattic/components';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import FormToggle from 'calypso/components/forms/form-toggle';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo-small.svg';
import { findFirstSimilarPlanKey } from 'calypso/lib/plans';
import { TYPE_PREMIUM, FEATURE_CLOUDFLARE_ANALYTICS } from 'calypso/lib/plans/constants';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

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
	showUpgradeNudge,
	site,
} ) {
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ isCloudflareEnabled, setIsCloudflareEnabled ] = useState( false );
	const [ loggedCloudflareAnalyticsModified, setLoggedCloudflareAnalyticsModified ] = useState(
		false
	);
	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;

	useEffect( () => {
		if ( fields?.cloudflare_analytics?.code ) {
			setIsCloudflareEnabled( true );
		}
	}, [ fields ] );

	const handleFieldChange = ( value, callback = () => {} ) => {
		const updatedCloudflareFields = Object.assign( {}, fields.cloudflare || {}, {
			code: value,
		} );
		updateFields( { cloudflare_analytics: updatedCloudflareFields }, callback );
	};

	const recordSupportLinkClick = () => {
		trackTracksEvent( 'calypso_traffic_settings_cloudflare_click' );
	};

	const handleCodeChange = ( event ) => {
		const code = event.target.value.trim();
		setIsCodeValid( validateTrackingId( code ) );
		handleFieldChange( code );
	};

	const handleFieldFocus = () => {
		trackTracksEvent( 'calypso_cloudflare_analytics_key_field_focused', { path } );
		eventTracker( 'Focused Cloudflare Analytics Key Field' )();
	};

	const handleFieldKeypress = () => {
		if ( ! loggedCloudflareAnalyticsModified ) {
			trackTracksEvent( 'calypso_cloudflare_analytics_key_field_modified', { path } );
			setLoggedCloudflareAnalyticsModified( true );
		}
		uniqueEventTracker( 'Typed In Analytics Key Field' )();
	};

	const handleFormToggle = () => {
		if ( isCloudflareEnabled ) {
			setIsCloudflareEnabled( false );
			handleFieldChange( '', () => {
				handleSubmitForm();
			} );
		} else {
			setIsCloudflareEnabled( true );
		}
	};

	const renderForm = () => {
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';

		const nudgeTitle = translate( 'Available with Premium plans or higher' );

		const plan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: TYPE_PREMIUM,
		} );

		const nudge = (
			<UpsellNudge
				description={ translate(
					'Choose an additional analytics tool to connect and get unique insights about your site traffic.'
				) }
				event={ 'cloudflare_analytics_settings' }
				feature={ FEATURE_CLOUDFLARE_ANALYTICS }
				plan={ plan }
				href={ null }
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
					title={ translate( 'Cloudflare' ) }
				/>

				<CompactCard>
					<div className="analytics site-settings__analytics">
						<div className="analytics site-settings__analytics-illustration">
							<img src={ cloudflareIllustration } alt="" />
						</div>
						<div className="analytics site-settings__analytics-text">
							<p className="analytics site-settings__analytics-title">
								{ translate( 'Cloudflare Analytics' ) }
							</p>
							<p>
								{ translate(
									"Privacy-first metrics with unmatched accuracy that won't track your visitors."
								) }
							</p>
							<p>
								<a
									onClick={ recordSupportLinkClick }
									href="https://www.CLOUDFLARELINK.com"
									target="_blank"
									rel="noreferrer"
								>
									{ translate( 'Learn more' ) }
								</a>
							</p>
						</div>
					</div>
					{ isCloudflareEnabled && (
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
					) }
				</CompactCard>
				{ showUpgradeNudge && site && site.plan ? (
					nudge
				) : (
					<CompactCard>
						<div className="analytics site-settings__analytics">
							<FormToggle
								checked={ isCloudflareEnabled }
								disabled={ isRequestingSettings || isSavingSettings }
								onChange={ () => handleFormToggle( ! isCloudflareEnabled ) }
							>
								{ translate( 'Add Cloudflare' ) }
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
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isAnalyticsEligible = hasSiteAnalyticsFeature( site );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		path,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
		showUpgradeNudge: ! isAnalyticsEligible,
		enableForm: isAnalyticsEligible,
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
