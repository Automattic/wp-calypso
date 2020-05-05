/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, flowRight, partialRight, pick, overSome } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import { Card } from '@automattic/components';
import ExternalLink from 'components/external-link';
import SupportInfo from 'components/support-info';
import UpsellNudge from 'blocks/upsell-nudge';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getPlugins } from 'state/plugins/installed/selectors';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import FormAnalyticsStores from './form-analytics-stores';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import { isPremium, isBusiness, isEnterprise, isVipPlan, isEcommerce } from 'lib/products-values';
import { recordTracksEvent } from 'state/analytics/actions';
import { isJetpackSite } from 'state/sites/selectors';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { FEATURE_GOOGLE_ANALYTICS, TYPE_PREMIUM, TERM_ANNUALLY } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'lib/i18n-utils';

const validateGoogleAnalyticsCode = ( code ) => ! code || code.match( /^UA-\d+-\d+$/i );
const hasPlanWithAnalytics = overSome(
	isPremium,
	isBusiness,
	isEcommerce,
	isEnterprise,
	isVipPlan
);

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
			? translate(
					'Connect your site to Google Analytics in seconds with Jetpack Premium or Professional'
			  )
			: translate( 'Connect your site to Google Analytics in seconds with the Premium plan' );

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
					<UpsellNudge
						description={ translate(
							"Add your unique tracking ID to monitor your site's performance in Google Analytics."
						) }
						event={ 'google_analytics_settings' }
						feature={ FEATURE_GOOGLE_ANALYTICS }
						plan={ findFirstSimilarPlanKey( site.plan.product_slug, {
							type: TYPE_PREMIUM,
							...( siteIsJetpack ? { term: TERM_ANNUALLY } : {} ),
						} ) }
						showIcon={ true }
						title={ nudgeTitle }
					/>
				) : (
					<Card className="analytics-settings site-settings__analytics-settings">
						{ siteIsJetpack && (
							<fieldset>
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
							</fieldset>
						) }

						<fieldset>
							<FormLabel htmlFor="wgaCode">
								{ translate( 'Google Analytics Tracking ID', { context: 'site setting' } ) }
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
									text={ translate( 'Invalid Google Analytics Tracking ID.' ) }
								/>
							) }
							<ExternalLink
								icon
								href="https://support.google.com/analytics/answer/1032385?hl=en"
								target="_blank"
								rel="noopener noreferrer"
							>
								{ translate( 'Where can I find my Tracking ID?' ) }
							</ExternalLink>
						</fieldset>
						{ siteIsJetpack && (
							<fieldset>
								<CompactFormToggle
									checked={ fields.wga ? Boolean( fields.wga.anonymize_ip ) : false }
									disabled={ isRequestingSettings || ! enableForm }
									onChange={ this.handleAnonymizeChange }
								>
									{ translate( 'Anonymize IP addresses' ) }
								</CompactFormToggle>
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
							</fieldset>
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
	const isGoogleAnalyticsEligible = site && site.plan && hasPlanWithAnalytics( site.plan );
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
