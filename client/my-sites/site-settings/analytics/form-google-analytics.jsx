/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { find, flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { hasSiteAnalyticsFeature } from '../utils';
import wrapSettingsForm from '../wrap-settings-form';
import { CompactCard } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import SupportInfo from 'calypso/components/support-info';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormToggle from 'calypso/components/forms/form-toggle';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import FormAnalyticsStores from '../form-analytics-stores';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo-small.svg';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { FEATURE_GOOGLE_ANALYTICS, TYPE_PREMIUM, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import { findFirstSimilarPlanKey } from 'calypso/lib/plans';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import {
	OPTIONS_JETPACK_SECURITY,
	PRODUCT_UPSELLS_BY_FEATURE,
} from 'calypso/my-sites/plans/jetpack-plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

const validateGoogleAnalyticsCode = ( code ) =>
	! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i );
export function GoogleAnalyticsSettings( {
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
	siteIsJetpack,
	site,
	siteId,
	sitePlugins,
} ) {
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ isGoogleEnabled, setIsGoogleEnabled ] = useState( false );
	const [ loggedGoogleAnalyticsModified, setLoggedGoogleAnalyticsModified ] = useState( false );

	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;
	const upsellHref = siteIsJetpack
		? `/checkout/${ site.slug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_GOOGLE_ANALYTICS ] }`
		: null;
	const analyticsSupportUrl = siteIsJetpack
		? 'https://jetpack.com/support/google-analytics/'
		: 'https://wordpress.com/support/google-analytics/';
	const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
	const nudgeTitle = siteIsJetpack
		? translate( 'Connect your site to Google Analytics' )
		: translate( 'Connect your site to Google Analytics in seconds with the Premium plan' );
	const wooCommercePlugin = find( sitePlugins, { slug: 'woocommerce' } );
	const wooCommerceActive = wooCommercePlugin ? wooCommercePlugin.active : false;

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
	const handleToggleChange = ( key ) => {
		const value = fields.wga ? ! fields.wga[ key ] : false;

		recordTracksEvent( 'calypso_google_analytics_setting_changed', { key, path } );

		handleFieldChange( key, value );
	};

	const handleAnonymizeChange = () => {
		this.handleToggleChange( 'anonymize_ip' );
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
		const plan = siteIsJetpack
			? OPTIONS_JETPACK_SECURITY
			: findFirstSimilarPlanKey( site.plan.product_slug, {
					type: TYPE_PREMIUM,
					...( siteIsJetpack ? { term: TERM_ANNUALLY } : {} ),
			  } );

		const nudge = (
			<UpsellNudge
				description={
					siteIsJetpack
						? translate( "Monitor your site's views, clicks, and other important metrics" )
						: translate(
								"Add your unique Measurement ID to monitor your site's performance in Google Analytics."
						  )
				}
				event={ 'google_analytics_settings' }
				feature={ FEATURE_GOOGLE_ANALYTICS }
				plan={ plan }
				href={ upsellHref }
				showIcon={ true }
				title={ nudgeTitle }
			/>
		);
		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

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
							<img src={ cloudflareIllustration } alt="" />
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
							{ siteIsJetpack && (
								<FormFieldset>
									<SupportInfo
										text={ translate(
											'Reports help you track the path visitors take' +
												' through your site, and goal conversion lets you' +
												' measure how visitors complete specific tasks.'
										) }
										link="https://jetpack.com/support/google-analytics/"
									/>
									<JetpackModuleToggle
										siteId={ siteId }
										moduleSlug="google-analytics"
										label={ translate(
											'Track your WordPress site statistics with Google Analytics.'
										) }
										disabled={ isRequestingSettings || isSavingSettings }
									/>
								</FormFieldset>
							) }

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
							{ siteIsJetpack && (
								<FormFieldset>
									<FormToggle
										checked={ fields.wga ? Boolean( fields.wga.anonymize_ip ) : false }
										disabled={ isRequestingSettings || ! enableForm }
										onChange={ handleAnonymizeChange }
									>
										{ translate( 'Anonymize IP addresses' ) }
									</FormToggle>
									<FormSettingExplanation>
										{ translate(
											'Enabling this option is mandatory in certain countries due to national ' +
												'privacy laws.'
										) }
										<ExternalLink
											icon
											href="https://support.google.com/analytics/answer/2763052"
											target="_blank"
											rel="noopener noreferrer"
										>
											{ translate( 'Learn more' ) }
										</ExternalLink>
									</FormSettingExplanation>
								</FormFieldset>
							) }
							{ siteIsJetpack && wooCommerceActive && (
								<FormAnalyticsStores fields={ fields } handleToggleChange={ handleToggleChange } />
							) }
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
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isGoogleAnalyticsEligible = hasSiteAnalyticsFeature( site );
	const jetpackModuleActive = isJetpackModuleActive( state, siteId, 'google-analytics' );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const googleAnalyticsEnabled = site && ( ! siteIsJetpack || jetpackModuleActive );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		enableForm: isGoogleAnalyticsEligible && googleAnalyticsEnabled,
		path,
		showUpgradeNudge: ! isGoogleAnalyticsEligible,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps, null, { pure: false } );

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( GoogleAnalyticsSettings );
