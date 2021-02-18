/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { hasSiteAnalyticsFeature } from './utils';
import wrapSettingsForm from './wrap-settings-form';
import { Card } from '@automattic/components';
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
import FormAnalyticsStores from './form-analytics-stores';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
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

const validateGoogleAnalyticsCode = ( code ) =>
	! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i );

export class GoogleAnalyticsForm extends Component {
	state = {
		isCodeValid: true,
		loggedGoogleAnalyticsModified: false,
	};

	handleFieldChange = ( key, value ) => {
		const { fields, updateFields } = this.props;
		const updatedWgaFields = Object.assign( {}, fields.wga || {}, { [ key ]: value } );
		updateFields( { wga: updatedWgaFields } );
	};

	handleCodeChange = ( event ) => {
		const code = event.target.value.trim();

		this.setState( {
			isCodeValid: validateGoogleAnalyticsCode( code ),
		} );
		this.handleFieldChange( 'code', code );
	};

	handleToggleChange = ( key ) => {
		const { fields, path } = this.props;
		const value = fields.wga ? ! fields.wga[ key ] : false;

		this.props.recordTracksEvent( 'calypso_google_analytics_setting_changed', { key, path } );

		this.handleFieldChange( key, value );
	};

	handleAnonymizeChange = () => {
		this.handleToggleChange( 'anonymize_ip' );
	};

	isSubmitButtonDisabled() {
		const { isRequestingSettings, isSavingSettings } = this.props;
		return (
			isRequestingSettings ||
			isSavingSettings ||
			! this.state.isCodeValid ||
			! this.props.enableForm
		);
	}

	form() {
		const {
			enableForm,
			eventTracker,
			fields,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			path,
			showUpgradeNudge,
			site,
			sitePlugins,
			siteId,
			siteIsJetpack,
			translate,
			trackTracksEvent,
			uniqueEventTracker,
		} = this.props;
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const analyticsSupportUrl = siteIsJetpack
			? 'https://jetpack.com/support/google-analytics/'
			: 'https://wordpress.com/support/google-analytics/';

		const wooCommercePlugin = find( sitePlugins, { slug: 'woocommerce' } );
		const wooCommerceActive = wooCommercePlugin ? wooCommercePlugin.active : false;

		const nudgeTitle = siteIsJetpack
			? translate( 'Connect your site to Google Analytics' )
			: translate( 'Connect your site to Google Analytics in seconds with the Premium plan' );

		const plan = siteIsJetpack
			? OPTIONS_JETPACK_SECURITY
			: findFirstSimilarPlanKey( site.plan.product_slug, {
					type: TYPE_PREMIUM,
					...( siteIsJetpack ? { term: TERM_ANNUALLY } : {} ),
			  } );

		const href = siteIsJetpack
			? `/checkout/${ site.slug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_GOOGLE_ANALYTICS ] }`
			: null;

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
				href={ href }
				showIcon={ true }
				title={ nudgeTitle }
			/>
		);

		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				<SettingsSectionHeader
					disabled={ this.isSubmitButtonDisabled() }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton={ ! showUpgradeNudge }
					title={ translate( 'Google Analytics' ) }
				/>

				{ showUpgradeNudge && site && site.plan ? (
					nudge
				) : (
					<Card className="analytics-settings site-settings__analytics-settings">
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
								onChange={ this.handleCodeChange }
								placeholder={ placeholderText }
								disabled={ isRequestingSettings || ! enableForm }
								onFocus={ () => {
									trackTracksEvent( 'calypso_google_analytics_key_field_focused', { path } );
									eventTracker( 'Focused Analytics Key Field' )();
								} }
								onKeyPress={ () => {
									if ( ! this.state.loggedGoogleAnalyticsModified ) {
										trackTracksEvent( 'calypso_google_analytics_key_field_modified', { path } );
										this.setState( { loggedGoogleAnalyticsModified: true } );
									}
									uniqueEventTracker( 'Typed In Analytics Key Field' )();
								} }
								isError={ ! this.state.isCodeValid }
							/>
							{ ! this.state.isCodeValid && (
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
									onChange={ this.handleAnonymizeChange }
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
							<FormAnalyticsStores
								fields={ fields }
								handleToggleChange={ this.handleToggleChange }
							/>
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
					</Card>
				) }
			</form>
		);
	}

	render() {
		// we need to check that site has loaded first... a placeholder would be better,
		// but returning null is better than a fatal error for now
		if ( ! this.props.site ) {
			return null;
		}
		// Only show Google Analytics for users with a premium or above plan.
		return this.form();
	}
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
)( GoogleAnalyticsForm );
