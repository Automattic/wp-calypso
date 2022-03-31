import {
	findFirstSimilarPlanKey,
	TYPE_PRO,
	FEATURE_CLOUDFLARE_ANALYTICS,
	FEATURE_GOOGLE_ANALYTICS,
} from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { pick } from 'lodash';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo-small.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';

import './style.scss';

const validateTrackingId = ( code ) =>
	! code || code.match( /^[a-fA-F0-9]+$/i ) || code.match( /(.*?)(token":\s")(.*?)(")/ );

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
		if ( fields?.jetpack_cloudflare_analytics?.code ) {
			setIsCloudflareEnabled( true );
		} else {
			setIsCloudflareEnabled( false );
		}
	}, [ fields ] );

	const handleFieldChange = ( value, callback = () => {} ) => {
		const updatedCloudflareFields = Object.assign( {}, fields.cloudflare || {}, {
			code: value,
		} );
		updateFields( { jetpack_cloudflare_analytics: updatedCloudflareFields }, callback );
	};

	const recordSupportLinkClick = () => {
		trackTracksEvent( 'calypso_traffic_settings_cloudflare_support_click', {
			plan: site.plan.product_slug,
		} );
	};

	const handleCodeChange = ( event ) => {
		const code = event.target.value.trim();
		setIsCodeValid( validateTrackingId( code ) );
		handleFieldChange( code );
	};

	const handleFieldFocus = () => {
		trackTracksEvent( 'calypso_jetpack_cloudflare_analytics_key_field_focused', { path } );
		eventTracker( 'Focused Cloudflare Analytics Key Field' )();
	};

	const handleFieldKeypress = () => {
		if ( ! loggedCloudflareAnalyticsModified ) {
			trackTracksEvent( 'calypso_jetpack_cloudflare_analytics_key_field_modified', { path } );
			setLoggedCloudflareAnalyticsModified( true );
		}
		uniqueEventTracker( 'Typed In Analytics Key Field' )();
	};

	const processCloudflareCode = () => {
		const token = fields.jetpack_cloudflare_analytics?.code?.match( /(.*?)(token":\s")(.*?)(")/ );
		if ( token ) {
			handleFieldChange( token[ 3 ] );
		}
	};

	const handleFormToggle = () => {
		if ( isCloudflareEnabled ) {
			setIsCloudflareEnabled( false );
			handleFieldChange( '', () => {
				handleSubmitForm();
			} );
			trackTracksEvent( 'calypso_traffic_settings_cloudflare_disable_cloudflare', {
				plan: site.plan.product_slug,
			} );
		} else {
			setIsCloudflareEnabled( true );
			trackTracksEvent( 'calypso_traffic_settings_cloudflare_enable_cloudflare', {
				plan: site.plan.product_slug,
			} );
		}
	};

	const renderForm = () => {
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';

		const nudgeTitle = translate( 'Available with the Pro plan' );

		const plan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: TYPE_PRO,
		} );

		const nudge = (
			<UpsellNudge
				description={ translate(
					'Choose an additional analytics tool to connect and get unique insights about your site traffic.'
				) }
				event={ 'jetpack_cloudflare_analytics_settings' }
				tracksClickProperties={ { plan: site.plan.product_slug } }
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
								{ translate( 'Cloudflare Web Analytics' ) }
							</p>
							<p>
								{ translate(
									"Privacy-first metrics with unmatched accuracy that won't track your visitors."
								) }
							</p>
							<p>
								<a
									onClick={ recordSupportLinkClick }
									href="https://www.cloudflare.com/pg-lp/cloudflare-for-wordpress-dot-com?utm_source=wordpress.com&utm_medium=affiliate&utm_campaign=paygo_2021-02_a8_pilot&utm_content=traffic"
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
								{ translate( 'Site Tag', { context: 'site setting' } ) }
							</FormLabel>
							<FormTextInput
								name="cloudflareCode"
								id="cloudflareCode"
								value={
									fields.jetpack_cloudflare_analytics
										? fields.jetpack_cloudflare_analytics.code
										: ''
								}
								onChange={ handleCodeChange }
								placeholder={ placeholderText }
								disabled={ isRequestingSettings || ! enableForm }
								onFocus={ handleFieldFocus }
								onKeyPress={ handleFieldKeypress }
								isError={ ! isCodeValid }
								onBlur={ processCloudflareCode }
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
							<ToggleControl
								checked={ isCloudflareEnabled }
								disabled={ isRequestingSettings || isSavingSettings || ! enableForm }
								onChange={ handleFormToggle }
								label={ translate( 'Add Cloudflare' ) }
							/>
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
	const isAnalyticsEligible = hasActiveSiteFeature( state, siteId, FEATURE_GOOGLE_ANALYTICS );
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

const connectComponent = connect( mapStateToProps, mapDispatchToProps );

const getFormSettings = ( settings ) => pick( settings, [ 'jetpack_cloudflare_analytics' ] );

export default connectComponent(
	wrapSettingsForm( getFormSettings )( CloudflareAnalyticsSettings )
);
