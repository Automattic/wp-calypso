/** @format */

/**
 * External dependencies
 */
import config from 'config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, flowRight, partialRight, pick, overSome } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import ExternalLink from 'components/external-link';
import Banner from 'components/banner';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getPlugins } from 'state/plugins/installed/selectors';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import FormAnalyticsStores from './form-analytics-stores';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { isBusiness, isEnterprise, isJetpackBusiness } from 'lib/products-values';
import { activateModule } from 'state/jetpack/modules/actions';
import {
	getSiteOption,
	isJetpackMinimumVersion,
	isJetpackSite,
	siteSupportsGoogleAnalyticsIPAnonymization,
	siteSupportsGoogleAnalyticsBasicEcommerceTracking,
} from 'state/sites/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { FEATURE_GOOGLE_ANALYTICS, PLAN_BUSINESS } from 'lib/plans/constants';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

const validateGoogleAnalyticsCode = code => ! code || code.match( /^UA-\d+-\d+$/i );
const hasBusinessPlan = overSome( isBusiness, isEnterprise, isJetpackBusiness );

class GoogleAnalyticsForm extends Component {
	state = {
		isCodeValid: true,
	};

	handleFieldChange = ( key, value ) => {
		const { fields, updateFields } = this.props;
		const updatedWgaFields = Object.assign( {}, fields.wga || {}, { [ key ]: value } );
		updateFields( { wga: updatedWgaFields } );
	};

	handleCodeChange = event => {
		const code = event.target.value;

		this.setState( {
			isCodeValid: validateGoogleAnalyticsCode( code ),
		} );
		this.handleFieldChange( 'code', code );
	};

	handleToggleChange = key => {
		const { fields } = this.props;
		const value = fields.wga ? ! fields.wga[ key ] : false;
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
			jetpackModuleActive,
			jetpackVersionSupportsModule,
			showUpgradeNudge,
			site,
			sitePlugins,
			siteId,
			siteIsJetpack,
			siteSlug,
			siteSupportsBasicEcommerceTracking,
			siteSupportsIPAnonymization,
			translate,
			uniqueEventTracker,
		} = this.props;
		const activateGoogleAnalytics = () => this.props.activateModule( siteId, 'google-analytics' );
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const isJetpackUnsupported = siteIsJetpack && ! jetpackVersionSupportsModule;
		const analyticsSupportUrl = siteIsJetpack
			? 'https://jetpack.com/support/google-analytics/'
			: 'https://support.wordpress.com/google-analytics/';

		const wooCommercePlugin = find( sitePlugins, { slug: 'woocommerce' } );
		const wooCommerceActive = wooCommercePlugin ? wooCommercePlugin.active : false;
		const showAnalyticsForStores =
			config.isEnabled( 'jetpack/google-analytics-for-stores' ) &&
			siteIsJetpack &&
			wooCommerceActive &&
			siteSupportsBasicEcommerceTracking;
		const showAnonymizeIP =
			config.isEnabled( 'jetpack/google-analytics-anonymize-ip' ) &&
			siteIsJetpack &&
			siteSupportsIPAnonymization;

		return (
			<form id="site-settings" onSubmit={ handleSubmitForm }>
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				{ isJetpackUnsupported &&
					! showUpgradeNudge && (
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ translate( 'Google Analytics require a newer version of Jetpack.' ) }
						>
							<NoticeAction href={ `/plugins/jetpack/${ siteSlug }` }>
								{ translate( 'Update Now' ) }
							</NoticeAction>
						</Notice>
					) }

				{ siteIsJetpack &&
					jetpackModuleActive === false &&
					! isJetpackUnsupported &&
					! showUpgradeNudge && (
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ translate( 'The Google Analytics module is disabled in Jetpack.' ) }
						>
							<NoticeAction onClick={ activateGoogleAnalytics }>
								{ translate( 'Enable' ) }
							</NoticeAction>
						</Notice>
					) }

				<SectionHeader label={ translate( 'Google Analytics' ) }>
					{ ! showUpgradeNudge && (
						<Button
							primary
							compact
							disabled={ this.isSubmitButtonDisabled() }
							onClick={ handleSubmitForm }
						>
							{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
						</Button>
					) }
				</SectionHeader>

				{ showUpgradeNudge ? (
					<Banner
						description={
							siteIsJetpack
								? translate(
										'Upgrade to the Professional Plan and include your own analytics tracking ID.'
									)
								: translate(
										'Upgrade to the Business Plan and include your own analytics tracking ID.'
									)
						}
						event={ 'google_analytics_settings' }
						feature={ FEATURE_GOOGLE_ANALYTICS }
						plan={ PLAN_BUSINESS }
						title={ translate( 'Add Google Analytics' ) }
					/>
				) : (
					<Card className="analytics-settings site-settings__analytics-settings">
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
								onClick={ eventTracker( 'Clicked Analytics Key Field' ) }
								onKeyPress={ uniqueEventTracker( 'Typed In Analytics Key Field' ) }
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
						{ showAnonymizeIP && (
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
								</FormSettingExplanation>
							</fieldset>
						) }
						{ showAnalyticsForStores && (
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
										a: <a href={ analyticsSupportUrl } target="_blank" rel="noopener noreferrer" />,
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
		// Only show Google Analytics for business users.
		return this.form();
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isGoogleAnalyticsEligible = site && site.plan && hasBusinessPlan( site.plan );
	const jetpackManagementUrl = getSiteOption( state, siteId, 'admin_url' );
	const jetpackModuleActive = isJetpackModuleActive( state, siteId, 'google-analytics' );
	const jetpackVersionSupportsModule = isJetpackMinimumVersion( state, siteId, '4.6-alpha' );
	const siteSupportsIPAnonymization = siteSupportsGoogleAnalyticsIPAnonymization( state, siteId );
	const siteSupportsBasicEcommerceTracking = siteSupportsGoogleAnalyticsBasicEcommerceTracking(
		state,
		siteId
	);
	const siteIsJetpack = isJetpackSite( state, siteId );
	const googleAnalyticsEnabled =
		site &&
		( ! siteIsJetpack || ( siteIsJetpack && jetpackModuleActive && jetpackVersionSupportsModule ) );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];

	return {
		site,
		siteId,
		siteSlug,
		siteIsJetpack,
		showUpgradeNudge: ! isGoogleAnalyticsEligible,
		enableForm: isGoogleAnalyticsEligible && googleAnalyticsEnabled,
		jetpackManagementUrl,
		jetpackModuleActive,
		jetpackVersionSupportsModule,
		sitePlugins,
		siteSupportsBasicEcommerceTracking,
		siteSupportsIPAnonymization,
	};
};

const connectComponent = connect(
	mapStateToProps,
	{
		activateModule,
	},
	null,
	{ pure: false }
);

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight( connectComponent, wrapSettingsForm( getFormSettings ) )(
	GoogleAnalyticsForm
);
