/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { find } from 'lodash';
import { CompactCard } from '@automattic/components';
import {
	FEATURE_GOOGLE_ANALYTICS,
	PLAN_JETPACK_SECURITY_DAILY,
} from '@automattic/calypso-products';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import SupportInfo from 'calypso/components/support-info';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import FormAnalyticsStores from '../form-analytics-stores';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import googleIllustration from 'calypso/assets/images/illustrations/google-analytics-logo.svg';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

const GoogleAnalyticsJetpackForm = ( {
	displayForm,
	enableForm,
	fields,
	handleCodeChange,
	handleFieldChange,
	handleFieldFocus,
	handleFieldKeypress,
	handleSubmitForm,
	isCodeValid,
	isRequestingSettings,
	isSavingSettings,
	isSubmitButtonDisabled,
	jetpackModuleActive,
	path,
	placeholderText,
	recordSupportLinkClick,
	setDisplayForm,
	showUpgradeNudge,
	site,
	siteId,
	sitePlugins,
	translate,
} ) => {
	const upsellHref = `/checkout/${ site.slug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_GOOGLE_ANALYTICS ] }`;
	const analyticsSupportUrl = 'https://jetpack.com/support/google-analytics/';
	const nudgeTitle = translate( 'Connect your site to Google Analytics' );
	const wooCommercePlugin = find( sitePlugins, { slug: 'woocommerce' } );
	const wooCommerceActive = wooCommercePlugin ? wooCommercePlugin.active : false;

	useEffect( () => {
		if ( jetpackModuleActive ) {
			setDisplayForm( true );
		} else {
			setDisplayForm( false );
		}
	}, [ jetpackModuleActive, setDisplayForm ] );

	const handleToggleChange = ( key ) => {
		const value = fields.wga ? ! fields.wga[ key ] : false;
		recordTracksEvent( 'calypso_google_analytics_setting_changed', { key, path } );
		handleFieldChange( key, value );
	};

	const handleAnonymizeChange = () => {
		handleToggleChange( 'anonymize_ip' );
	};

	const renderForm = () => {
		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				<QueryJetpackModules siteId={ siteId } />

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
					{ displayForm && (
						<div className="analytics site-settings__analytics-form-content">
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
							<FormFieldset>
								<ToggleControl
									checked={ fields.wga ? Boolean( fields.wga.anonymize_ip ) : false }
									disabled={ isRequestingSettings || ! enableForm }
									onChange={ handleAnonymizeChange }
									label={ translate( 'Anonymize IP addresses' ) }
								/>
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
							{ wooCommerceActive && (
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
					<UpsellNudge
						description={ translate(
							"Monitor your site's views, clicks, and other important metrics"
						) }
						event={ 'google_analytics_settings' }
						feature={ FEATURE_GOOGLE_ANALYTICS }
						plan={ PLAN_JETPACK_SECURITY_DAILY }
						href={ upsellHref }
						showIcon={ true }
						title={ nudgeTitle }
					/>
				) : (
					<CompactCard>
						<div className="analytics site-settings__analytics">
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
									label={ translate( 'Add Google' ) }
									disabled={ isRequestingSettings || isSavingSettings }
								/>
							</FormFieldset>
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
export default GoogleAnalyticsJetpackForm;
