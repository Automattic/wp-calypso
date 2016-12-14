/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import notices from 'notices';
import debugFactory from 'debug';
import { overSome } from 'lodash';

/**
 * Internal dependencies
 */
import formBase from './form-base';
import { protectForm } from 'lib/protect-form';
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
import { isJetpackModuleActive, isJetpackMinimumVersion } from 'state/sites/selectors';
import { isEnabled } from 'config';
import { FEATURE_GOOGLE_ANALYTICS } from 'lib/plans/constants';

const debug = debugFactory( 'calypso:my-sites:site-settings' );
const googleAnalyticsCodeValidator = code => ! code || code.match( /^UA-\d+-\d+$/i );
const hasBusinessPlan = overSome( isBusiness, isEnterprise, isJetpackBusiness );

const GoogleAnalyticsForm = React.createClass( {

	displayName: 'SiteSettingsFormAnalytics',

	mixins: [ formBase ],

	getInitialState() {
		return {
			isCodeValid: true
		};
	},

	resetState() {
		this.replaceState( {
			wga: {
				code: null
			},
			fetchingSettings: true
		} );
		debug( 'resetting state' );
	},

	getSettingsFromSite( siteInstance ) {
		const site = siteInstance || this.props.site;
		const settings = {
			wga: {
				code: ''
			},
			fetchingSettings: site.fetchingSettings
		};

		if ( site.settings ) {
			debug( 'site settings fetched' );
			settings.wga = site.settings.wga;
		}

		return settings;
	},

	handleCodeChange( event ) {
		const code = event.target.value;
		const isCodeValid = googleAnalyticsCodeValidator( code );
		let notice = this.state.notice;

		if ( ! isCodeValid && ! notice ) {
			notice = notices.error( this.translate( 'Invalid Google Analytics Tracking ID.' ) );
		} else if ( isCodeValid && notice ) {
			notices.removeNotice( notice );
			notice = null;
		}

		this.setState( {
			wga: {
				code: event.target.value
			},
			isCodeValid: isCodeValid,
			notice: notice
		} );
	},

	isSubmitButtonDisabled() {
		return this.state.fetchingSettings || this.state.submittingForm || ! this.state.isCodeValid || ! this.props.enableForm;
	},

	onClickAnalyticsInput() {
		this.recordEvent( 'Clicked Analytics Key Field' );
	},

	onKeyPressAnalyticsInput() {
		this.recordEventOnce( 'typedAnalyticsKey', 'Typed In Analytics Key Field' );
	},

	form() {
		var placeholderText = '';

		if ( this.state.fetchingSettings ) {
			placeholderText = this.translate( 'Loading' );
		}

		const {
			site,
			enableForm,
			showUpgradeNudge,
			jetpackModuleActive,
			jetpackVersionSupportsModule,
		} = this.props;

		const {
			domain = '',
			slug = '',
			jetpack = false,
		} = site;

		const isJetpackUnsupported = jetpack && ! jetpackVersionSupportsModule && isEnabled( 'jetpack/google-analytics' );

		return (
			<form id="site-settings" onSubmit={ this.handleSubmitForm } onChange={ this.props.markChanged }>

				{ showUpgradeNudge &&
					<UpgradeNudge
						title={ this.translate( 'Add Google Analytics' ) }
						message={ this.translate( 'Upgrade to the business plan and include your own analytics tracking ID.' ) }
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
						text={ this.translate( 'Google Analytics require a newer version of Jetpack.' ) } >
						<NoticeAction href={ `/plugins/jetpack/${ slug }` }>
							{ this.translate( 'Update Now' ) }
						</NoticeAction>
					</Notice>
				}

				{ jetpack && ! jetpackModuleActive && ! isJetpackUnsupported && ! showUpgradeNudge &&
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ this.translate( 'Google Analytics module is disabled in Jetpack.' ) } >
						<NoticeAction href={ '//' + domain + '/wp-admin/admin.php?page=jetpack#/engagement' }>
							{ this.translate( 'Enable' ) }
						</NoticeAction>
					</Notice>
				}

				<SectionHeader label={ this.translate( 'Analytics Settings' ) }>
					<Button
						primary
						compact
						disabled={ this.isSubmitButtonDisabled() }
						onClick={ this.handleSubmitForm }
						>{
							this.state.submittingForm
									? this.translate( 'Saving…' )
									: this.translate( 'Save Settings' )
						}
					</Button>
				</SectionHeader>
				<Card className="analytics-settings">
					<fieldset>
						<label htmlFor="wgaCode">{ this.translate( 'Google Analytics Tracking ID', { context: 'site setting' } ) }</label>
						<input
							name="wgaCode"
							id="wgaCode"
							type="text"
							value={ this.state.wga.code }
							onChange={ this.handleCodeChange }
							placeholder={ placeholderText }
							disabled={ this.state.fetchingSettings || ! enableForm }
							onClick={ this.onClickAnalyticsInput }
							onKeyPress={ this.onKeyPressAnalyticsInput }
						/>
						<ExternalLink
							icon={ true }
							href="https://support.google.com/analytics/answer/1032385?hl=en"
							target="_blank"
							rel="noopener noreferrer"
						>
							{ this.translate( 'Where can I find my Tracking ID?' ) }
						</ExternalLink>
					</fieldset>
					<p>
						{ this.translate(
							'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} with different insights into your traffic.' +
							' WordPress.com stats and Google Analytics use different methods to identify and track activity on your site, so they will ' +
							'normally show slightly different totals for your visits, views, etc.',
							{
								components: {
									a: <a href={ '/stats/' + this.props.site.domain } />
								}
							}
						) }
					</p>
					<p>
					{ this.translate( 'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
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
	},

	render() {
		// we need to check that site has loaded first... a placeholder would be better,
		// but returning null is better than a fatal error for now
		if ( ! this.props.site ) {
			return null;
		}
		// Only show Google Analytics for business users.
		return this.form();
	}
} );

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

export default connect(
	mapStateToProps,
	null,
	null,
	{ pure: false }
)( protectForm( GoogleAnalyticsForm ) );
