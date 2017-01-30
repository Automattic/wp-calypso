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
import UpgradeNudge from 'my-sites/upgrade-nudge';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import {
	isBusiness,
	isEnterprise,
	isJetpackBusiness
} from 'lib/products-values';
import { removeNotice, errorNotice } from 'state/notices/actions';
import { isJetpackModuleActive, isJetpackMinimumVersion } from 'state/sites/selectors';
import { isEnabled } from 'config';
import { FEATURE_GOOGLE_ANALYTICS } from 'lib/plans/constants';

const validateGoogleAnalyticsCode = code => ! code || code.match( /^UA-\d+-\d+$/i );
const hasBusinessPlan = overSome( isBusiness, isEnterprise, isJetpackBusiness );

class GoogleAnalyticsForm extends Component {
	state = {
		isCodeValid: true
	};

	handleCodeChange = ( event ) => {
		const code = event.target.value;
		const isCodeValid = validateGoogleAnalyticsCode( code );
		if ( ! isCodeValid ) {
			this.props.errorNotice(
				this.props.translate( 'Invalid Google Analytics Tracking ID.' ),
				{ id: 'google-analytics-validation' }
			);
		} else if ( isCodeValid ) {
			this.props.removeNotice( 'google-analytics-validation' );
		}
		this.setState( {
			isCodeValid
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
			translate,
			uniqueEventTracker,
		} = this.props;

		const {
			domain = '',
			slug = '',
			jetpack = false,
		} = site;

		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const isJetpackUnsupported = jetpack && ! jetpackVersionSupportsModule && isEnabled( 'jetpack/google-analytics' );

		return (
			<form id="site-settings" onSubmit={ handleSubmitForm }>

				{ showUpgradeNudge &&
					<UpgradeNudge
						title={ translate( 'Add Google Analytics' ) }
						message={ jetpack
							? translate( 'Upgrade to the Professional Plan and include your own analytics tracking ID.' )
							: translate( 'Upgrade to the Business Plan and include your own analytics tracking ID.' )
						}
						feature={ FEATURE_GOOGLE_ANALYTICS }
						event="google_analytics_settings"
						icon="stats-alt"
						jetpack= { jetpack }
					/>
				}

				{ isJetpackUnsupported && ! showUpgradeNudge &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Google Analytics require a newer version of Jetpack.' ) } >
						<NoticeAction href={ `/plugins/jetpack/${ slug }` }>
							{ translate( 'Update Now' ) }
						</NoticeAction>
					</Notice>
				}

				{ jetpack && ! jetpackModuleActive && ! isJetpackUnsupported && ! showUpgradeNudge &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'The Google Analytics module is disabled in Jetpack.' ) } >
						<NoticeAction href={ '//' + domain + '/wp-admin/admin.php?page=jetpack#/engagement' }>
							{ translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				}

				<SectionHeader label={ translate( 'Analytics Settings' ) }>
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
				</SectionHeader>
				<Card className="analytics-settings">
					<fieldset>
						<label htmlFor="wgaCode">{ translate( 'Google Analytics Tracking ID', { context: 'site setting' } ) }</label>
						<input
							name="wgaCode"
							id="wgaCode"
							type="text"
							value={ fields.wga ? fields.wga.code : '' }
							onChange={ this.handleCodeChange }
							placeholder={ placeholderText }
							disabled={ isRequestingSettings || ! enableForm }
							onClick={ eventTracker( 'Clicked Analytics Key Field' ) }
							onKeyPress={ uniqueEventTracker( 'Typed In Analytics Key Field' ) }
						/>
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
							'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} with different insights into your traffic.' +
							' WordPress.com stats and Google Analytics use different methods to identify and track activity on your site, so they will ' +
							'normally show slightly different totals for your visits, views, etc.',
							{
								components: {
									a: <a href={ '/stats/' + domain } />
								}
							}
						) }
					</p>
					<p>
					{ translate( 'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
						{
							components: {
								a: <a href="http://en.support.wordpress.com/google-analytics/" target="_blank" rel="noopener noreferrer" />
							}
						}
					) }
					</p>
				</Card>
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

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;

	const isGoogleAnalyticsEligible = site && site.plan && hasBusinessPlan( site.plan );
	const jetpackModuleActive = isJetpackModuleActive( state, site.ID, 'google-analytics' );
	const jetpackVersionSupportsModule = isJetpackMinimumVersion( state, site.ID, '4.5-beta1' );
	const googleAnalyticsEnabled = site && (
		! site.jetpack ||
		( site.jetpack && jetpackModuleActive && jetpackVersionSupportsModule && isEnabled( 'jetpack/google-analytics' ) )
	);

	return {
		selectedSite: site,
		showUpgradeNudge: ! isGoogleAnalyticsEligible,
		enableForm: isGoogleAnalyticsEligible && googleAnalyticsEnabled,
		jetpackModuleActive,
		jetpackVersionSupportsModule,
	};
};

const connectComponent = connect(
	mapStateToProps,
	{ errorNotice, removeNotice },
	null,
	{ pure: false }
);

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings ),
)( GoogleAnalyticsForm );
