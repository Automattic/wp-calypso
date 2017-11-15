/** @format */

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
import Banner from 'components/banner';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import InfoPopover from 'components/info-popover';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import { FEATURE_WORDADS_INSTANT, PLAN_JETPACK_PREMIUM } from 'lib/plans/constants';

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
			<Banner
				description={ translate(
					'Add advertising to your site through our WordAds program and earn money from impressions.'
				) }
				event={ 'calypso_wordads_settings_upgrade_nudge' }
				feature={ FEATURE_WORDADS_INSTANT }
				plan={ PLAN_JETPACK_PREMIUM }
				title={ translate( 'Enable WordAds by upgrading to Jetpack Premium' ) }
			/>
		);
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<CompactFormToggle
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</CompactFormToggle>
		);
	}

	renderContent() {
		const { translate } = this.props;

		return (
			<div>
				<div className="site-settings__info-link-container">
					<InfoPopover position="left">
						<ExternalLink href="https://jetpack.com/support/ads" icon target="_blank">
							{ translate( 'Learn more about Ads.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

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
		const { selectedSiteId, selectedSiteSlug, wordadsModuleActive, translate } = this.props;
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
				</Card>

				{ wordadsModuleActive && (
					<CompactCard href={ `/ads/earnings/${ selectedSiteSlug }` }>
						{ translate( 'View your earnings' ) }
					</CompactCard>
				) }
			</div>
		);
	}

	render() {
		const { hasWordadsFeature, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Ads' ) } />

				{ hasWordadsFeature ? this.renderSettings() : this.renderUpgradeBanner() }
			</div>
		);
	}
}

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSiteSlug = getSelectedSiteSlug( state );
	const hasWordadsFeature = hasFeature( state, selectedSiteId, FEATURE_WORDADS_INSTANT );

	return {
		hasWordadsFeature,
		selectedSiteId,
		selectedSiteSlug,
		wordadsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'wordads' ),
	};
} )( localize( JetpackAds ) );
