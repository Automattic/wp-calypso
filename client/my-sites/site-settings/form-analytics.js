/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick, overSome } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import ExternalLink from 'components/external-link';
import Banner from 'components/banner';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import {
	isBusiness,
	isEnterprise,
	isJetpackBusiness
} from 'lib/products-values';
import { activateModule } from 'state/jetpack/modules/actions';
import { getSiteOption, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { FEATURE_GOOGLE_ANALYTICS, PLAN_BUSINESS } from 'lib/plans/constants';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

const validateGoogleAnalyticsCode = code => ! code || code.match( /^UA-\d+-\d+$/i );
const hasBusinessPlan = overSome( isBusiness, isEnterprise, isJetpackBusiness );

class GoogleAnalyticsForm extends Component {
	state = {
		isCodeValid: true
	};

	handleCodeChange = ( event ) => {
		const code = event.target.value;

		this.setState( {
			isCodeValid: validateGoogleAnalyticsCode( code )
		} );
		this.props.updateFields( { wga: { code } } );
	};

	isSubmitButtonDisabled() {
		const { isRequestingSettings, isSavingSettings } = this.props;
		return isRequestingSettings || isSavingSettings || ! this.state.isCodeValid || ! this.props.enableForm;
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
			siteId,
			siteIsJetpack,
			siteSlug,
			translate,
			uniqueEventTracker,
		} = this.props;
		const activateGoogleAnalytics = () => this.props.activateModule( siteId, 'google-analytics' );
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const isJetpackUnsupported = siteIsJetpack && ! jetpackVersionSupportsModule;
		const analyticsSupportUrl = siteIsJetpack
			? 'https://jetpack.com/support/google-analytics/'
			: 'https://support.wordpress.com/google-analytics/';

		return (
			<form id="site-settings" onSubmit={ handleSubmitForm }>
				{
					siteIsJetpack &&
					<QueryJetpackModules siteId={ siteId } />
				}

				{ isJetpackUnsupported && ! showUpgradeNudge &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Google Analytics require a newer version of Jetpack.' ) } >
						<NoticeAction href={ `/plugins/jetpack/${ siteSlug }` }>
							{ translate( 'Update Now' ) }
						</NoticeAction>
					</Notice>
				}

				{ siteIsJetpack && jetpackModuleActive === false && ! isJetpackUnsupported && ! showUpgradeNudge &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'The Google Analytics module is disabled in Jetpack.' ) } >
						<NoticeAction onClick={ activateGoogleAnalytics }>
							{ translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				}

				<SectionHeader label={ translate( 'Google Analytics' ) }>
					{
						! showUpgradeNudge &&
						<Button
							primary
							compact
							disabled={ this.isSubmitButtonDisabled() }
							onClick={ handleSubmitForm }
						>
							{
								isSavingSettings
										? translate( 'Saving…' )
										: translate( 'Save Settings' )
							}
						</Button>
					}
				</SectionHeader>

				{ showUpgradeNudge
					? (
						<Banner
							description={ siteIsJetpack
								? translate( 'Upgrade to the Professional Plan and include your own analytics tracking ID.' )
								: translate( 'Upgrade to the Business Plan and include your own analytics tracking ID.' )
							}
							event={ 'google_analytics_settings' }
							feature={ FEATURE_GOOGLE_ANALYTICS }
							plan={ PLAN_BUSINESS }
							title={ translate( 'Add Google Analytics' ) }
						/>
					)
					: (
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
								{
									! this.state.isCodeValid &&
									<FormTextValidation isError={ true } text={ translate( 'Invalid Google Analytics Tracking ID.' ) } />
								}
								<ExternalLink
									icon
									href="https://support.google.com/analytics/answer/1032385?hl=en"
									target="_blank"
									rel="noopener noreferrer"
								>
									{ translate( 'Where can I find my Tracking ID?' ) }
								</ExternalLink>
							</fieldset>
							<p>
								{ translate(
									'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} ' +
									'with different insights into your traffic. WordPress.com stats and Google Analytics ' +
									'use different methods to identify and track activity on your site, so they will ' +
									'normally show slightly different totals for your visits, views, etc.',
									{
										components: {
											a: <a href={ '/stats/' + site.domain } />
										}
									}
								) }
							</p>
							<p>
							{ translate( 'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
								{
									components: {
										a: <a href={ analyticsSupportUrl } target="_blank" rel="noopener noreferrer" />
									}
								}
							) }
							</p>
						</Card>
					)
				}
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

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isGoogleAnalyticsEligible = site && site.plan && hasBusinessPlan( site.plan );
	const jetpackManagementUrl = getSiteOption( state, siteId, 'admin_url' );
	const jetpackModuleActive = isJetpackModuleActive( state, siteId, 'google-analytics' );
	const jetpackVersionSupportsModule = isJetpackMinimumVersion( state, siteId, '4.6-alpha' );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const googleAnalyticsEnabled = site && (
		! siteIsJetpack ||
		( siteIsJetpack && jetpackModuleActive && jetpackVersionSupportsModule )
	);

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
	};
};

const connectComponent = connect(
	mapStateToProps, {
		activateModule
	},
	null,
	{ pure: false }
);

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings ),
)( GoogleAnalyticsForm );
