/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { Card, CompactCard } from '@automattic/components';
import FormToggle from 'calypso/components/forms/form-toggle';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { FEATURE_WORDADS_INSTANT, PLAN_JETPACK_SECURITY_DAILY } from 'calypso/lib/plans/constants';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getCustomizerUrl } from 'calypso/state/sites/selectors';

class JetpackAds extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		handleAutosavingToggle: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	isFormPending() {
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderUpgradeBanner() {
		const { translate } = this.props;

		return (
			<UpsellNudge
				description={ translate(
					'Add advertising to your site through our WordAds program and earn money from impressions.'
				) }
				event={ 'calypso_wordads_settings_upgrade_nudge' }
				feature={ FEATURE_WORDADS_INSTANT }
				plan={ PLAN_JETPACK_SECURITY_DAILY }
				title={ translate( 'Enable WordAds by upgrading to a Jetpack Security or Complete plan' ) }
				showIcon
			/>
		);
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<FormToggle
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</FormToggle>
		);
	}

	renderContent() {
		const { translate } = this.props;

		return (
			<div>
				<SupportInfo
					text={ translate(
						'Displays high-quality ads on your site that allow you to earn income.'
					) }
					link="https://jetpack.com/support/ads/"
				/>
				<div>
					{ translate(
						'Show ads on the first article on your home page or at the end of every page and post. ' +
							'Place additional ads at the top of your site and to any widget area to increase your earnings.'
					) }
				</div>
				<FormSettingExplanation>
					{ translate(
						'By activating ads, you agree to the Automattic Ads {{link}}Terms of Service{{/link}}.',
						{
							components: {
								link: (
									<ExternalLink
										href="https://wordpress.com/automattic-ads-tos/"
										icon={ false }
										target="_blank"
									/>
								),
							},
						}
					) }
				</FormSettingExplanation>
			</div>
		);
	}

	renderSettings() {
		const {
			fields,
			onChangeField,
			selectedSiteId,
			selectedSiteSlug,
			wordadsModuleActive,
			translate,
			siteIsAtomic,
			widgetsUrl,
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<div>
				<Card className="site-settings__card site-settings__traffic-settings">
					<FormFieldset>
						{ this.renderContent() }

						<br />

						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="wordads"
							label={ translate( 'Enable ads and display an ad below each post' ) }
							disabled={ formPending }
						/>

						<div className="site-settings__child-settings">
							{ this.renderToggle(
								'enable_header_ad',
								! wordadsModuleActive,
								translate( 'Display an additional ad at the top of each page' )
							) }
						</div>
					</FormFieldset>

					<hr />
					<FormSectionHeading>{ translate( 'Privacy and Consent' ) }</FormSectionHeading>
					<FormFieldset>
						<SupportInfo
							text={ translate(
								'Enables a targeted advertising opt-out link for California consumers, as required by the California Consumer Privacy Act (CCPA).'
							) }
							link={
								siteIsAtomic
									? 'https://wordpress.com/support/your-wordpress-com-site-and-the-ccpa/'
									: 'https://jetpack.com/support/ads/'
							}
						/>
						{ this.renderToggle(
							'wordads_ccpa_enabled',
							! wordadsModuleActive,
							translate( 'Enable targeted advertising to California site visitors (CCPA)' )
						) }

						<div className="site-settings__child-settings">
							<FormSettingExplanation>
								{ translate(
									'For more information about the California Consumer Privacy Act (CCPA) and how it pertains to your site, please consult our {{a}}CCPA guide for site owners{{/a}}.',
									{
										components: {
											a: (
												<a
													href={
														siteIsAtomic
															? 'https://wordpress.com/support/your-wordpress-com-site-and-the-ccpa/'
															: 'https://jetpack.com/support/ads/'
													}
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
							</FormSettingExplanation>
						</div>
					</FormFieldset>

					{ fields.wordads_ccpa_enabled && (
						<div className="site-settings__child-settings">
							<FormFieldset>
								<FormLabel>{ translate( 'Do Not Sell Link' ) }</FormLabel>
								<span>
									{ translate(
										'CCPA requires that you place a "Do Not Sell My Personal Information" link on every page of your site where targeted advertising will appear. You can use the {{a}}Do Not Sell Link (CCPA) Widget{{/a}}, or the {{code}}[ccpa-do-not-sell-link]{{/code}} shortcode to automatically place this link on your site. Note: the link will always display to logged in administrators regardless of geolocation.',
										{
											components: {
												a: <a href={ widgetsUrl } target="_blank" rel="noopener noreferrer" />,
												code: <code />,
											},
										}
									) }
								</span>
								<FormSettingExplanation>
									{ translate(
										'Failure to add this link will result in non-compliance with CCPA.'
									) }
								</FormSettingExplanation>
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="ccpa-privacy-policy-url">
									{ translate( 'Privacy Policy URL' ) }
								</FormLabel>
								<FormTextInput
									name="ccpa_privacy_policy_url"
									id="ccpa-privacy-policy-url"
									value={ fields.wordads_ccpa_privacy_policy_url || '' }
									onChange={ onChangeField( 'wordads_ccpa_privacy_policy_url' ) }
									disabled={ formPending }
									placeholder="https://"
								/>
								<FormSettingExplanation>
									{ translate(
										'Adds a link to your privacy policy to the bottom of the CCPA notice popup (optional).'
									) }
								</FormSettingExplanation>
							</FormFieldset>
						</div>
					) }
				</Card>

				{ wordadsModuleActive && (
					<CompactCard href={ `/earn/ads-earnings/${ selectedSiteSlug }` }>
						{ translate( 'View your earnings' ) }
					</CompactCard>
				) }
			</div>
		);
	}

	render() {
		const { hasWordadsFeature, isSavingSettings, onSubmitForm, translate } = this.props;

		return (
			<div>
				<SettingsSectionHeader
					disabled={ this.isFormPending() }
					isSaving={ isSavingSettings }
					onButtonClick={ onSubmitForm }
					showButton={ hasWordadsFeature }
					title={ translate( 'Ads' ) }
				/>

				{ hasWordadsFeature ? this.renderSettings() : this.renderUpgradeBanner() }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSiteSlug = getSelectedSiteSlug( state );
	const hasWordadsFeature = hasFeature( state, selectedSiteId, FEATURE_WORDADS_INSTANT );

	return {
		hasWordadsFeature,
		selectedSiteId,
		selectedSiteSlug,
		wordadsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'wordads' ),
		siteIsAtomic: isSiteAutomatedTransfer( state, selectedSiteId ),
		widgetsUrl: getCustomizerUrl( state, selectedSiteId, 'widgets' ),
	};
} )( localize( JetpackAds ) );
