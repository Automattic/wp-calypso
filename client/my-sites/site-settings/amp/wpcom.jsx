import { FEATURE_SFTP, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './wpcom.scss';

class AmpWpcom extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,
		trackEvent: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	handleToggle = () => {
		const { fields, submitForm, trackEvent, updateFields } = this.props;
		const ampEnabled = ! fields.amp_is_enabled;
		this.props.recordTracksEvent( 'calypso_seo_settings_amp_updated', {
			amp_is_enabled: ampEnabled,
		} );
		updateFields( { amp_is_enabled: ampEnabled }, () => {
			submitForm();
			trackEvent( 'Toggled AMP Toggle' );
		} );
	};

	handleCustomize = () => {
		this.props.trackEvent( 'Clicked AMP Customize button' );
		page( '/customize/amp/' + this.props.siteSlug );
	};

	renderUpgradeNotice() {
		const { hasSftpFeature, siteSlug, translate } = this.props;

		if ( hasSftpFeature ) {
			return (
				<UpsellNudge
					title={ translate( 'Install AMP plugin.' ) }
					description={ translate( 'Install AMP plugin to use AMP features.' ) }
					plan={ PLAN_WPCOM_PRO }
					href={ `/plugins/amp/${ siteSlug }` }
					forceHref={ true }
					showIcon={ true }
					forceDisplay
				/>
			);
		}

		return (
			<UpsellNudge
				title={ translate( 'Available on the Pro plan' ) }
				description={ translate( 'Upgrade to the Pro plan to install AMP plugin.' ) }
				plan={ PLAN_WPCOM_PRO }
				href={ `/checkout/${ siteSlug }/pro` }
				showIcon={ true }
				forceDisplay
				tracksImpressionName="calypso_settings_amp_upsell_impression"
				tracksClickName="calypso_settings_amp_upsell_click"
				event="calypso_settings_amp_upsell"
			/>
		);
	}

	render() {
		const {
			fields: {
				amp_is_supported: ampIsSupported,
				amp_is_deprecated: ampIsDeprecated,
				amp_is_enabled: ampIsEnabled,
			},
			isRequestingSettings,
			isSavingSettings,
			siteSlug,
			translate,
		} = this.props;

		const isDisabled = isRequestingSettings || isSavingSettings;
		const isCustomizeEnabled = ! isDisabled && ampIsEnabled;

		if ( ! ampIsSupported ) {
			return null;
		}

		if ( ampIsDeprecated ) {
			return (
				<div className="amp__main site-settings__traffic-settings">
					<SettingsSectionHeader title={ translate( 'Accelerated Mobile Pages (AMP)' ) } />
					{ this.renderUpgradeNotice() }
				</div>
			);
		}

		return (
			<div className="amp__main site-settings__traffic-settings">
				<SettingsSectionHeader title={ translate( 'Accelerated Mobile Pages (AMP)' ) } />

				<CompactCard className="amp__explanation site-settings__amp-explanation">
					<ToggleControl
						checked={ !! ampIsEnabled }
						disabled={ isDisabled }
						onChange={ this.handleToggle }
						label={ translate( 'Improve the loading speed of your site on phones and tablets' ) }
					/>
					<FormSettingExplanation isIndented>
						{ translate(
							'Your WordPress.com site supports the use of {{a}}Accelerated Mobile Pages{{/a}}, ' +
								'a Google-led initiative that dramatically speeds up loading times on mobile devices.',
							{
								components: {
									a: (
										<a
											href={ localizeUrl(
												'https://wordpress.com/support/google-amp-accelerated-mobile-pages/'
											) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>
				</CompactCard>

				{ isCustomizeEnabled && (
					<CompactCard href={ '/customize/amp/' + siteSlug }>
						{ translate( 'Edit the design of your Accelerated Mobile Pages' ) }
					</CompactCard>
				) }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );

		return {
			siteSlug: getSelectedSiteSlug( state ),
			hasSftpFeature,
		};
	},
	{ recordTracksEvent }
)( localize( AmpWpcom ) );
