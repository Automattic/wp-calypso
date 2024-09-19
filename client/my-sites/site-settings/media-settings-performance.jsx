import {
	PRODUCT_JETPACK_VIDEOPRESS,
	WPCOM_FEATURES_VIDEOPRESS,
	WPCOM_FEATURES_VIDEOPRESS_UNLIMITED_STORAGE,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import filesize from 'filesize';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanStorageBar from 'calypso/blocks/plan-storage/bar';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import withMediaStorage from 'calypso/data/media-storage/with-media-storage';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSitePlanSlug, getSiteSlug } from 'calypso/state/sites/selectors';

class MediaSettingsPerformance extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		siteIsAtomic: PropTypes.bool,

		// Connected props
		isVideoPressActive: PropTypes.bool,
		hasVideoPress: PropTypes.bool,
		mediaStorageLimit: PropTypes.number,
		mediaStorageUsed: PropTypes.number,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	renderVideoSettings() {
		const { isRequestingSettings, isSavingSettings, siteIsAtomic, siteId, translate } = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<FormFieldset className="site-settings__formfieldset jetpack-video-hosting-settings">
				<SupportInfo
					text={ translate( 'Hosts your video files on the global WordPress.com servers.' ) }
					link={
						siteIsAtomic
							? localizeUrl( 'https://wordpress.com/support/videopress/' )
							: 'https://jetpack.com/support/videopress/'
					}
					privacyLink={ ! siteIsAtomic }
				/>
				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="videopress"
					label={ translate( 'Enable fast, ad-free video hosting' ) }
					disabled={ isRequestingOrSaving }
				/>
				{ this.props.isVideoPressActive && this.renderVideoStorageIndicator() }
			</FormFieldset>
		);
	}

	renderVideoStorageIndicator() {
		const {
			hasVideoPress,
			mediaStorageLimit,
			mediaStorageUsed,
			sitePlanSlug,
			siteSlug,
			translate,
		} = this.props;

		// The API may use -1 for both values to indicate special cases
		const isStorageDataValid =
			null !== mediaStorageUsed && null !== mediaStorageLimit && mediaStorageUsed > -1;
		const isStorageUnlimited = mediaStorageLimit === -1;

		const renderedStorageInfo =
			isStorageDataValid &&
			hasVideoPress &&
			( isStorageUnlimited ? (
				<FormSettingExplanation className="site-settings__videopress-storage-used">
					{ translate( '%(size)s uploaded, unlimited storage available', {
						args: {
							size: filesize( mediaStorageUsed ),
						},
					} ) }
				</FormSettingExplanation>
			) : (
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ sitePlanSlug }
					mediaStorage={ {
						maxStorageBytes: mediaStorageLimit,
						storageUsedBytes: mediaStorageUsed,
					} }
				/>
			) );

		return <div className="site-settings__videopress-storage">{ renderedStorageInfo }</div>;
	}

	renderVideoUpgradeNudge() {
		const { hasVideoPress, mediaStorageUsed, siteSlug, translate } = this.props;

		const upsellMessage =
			0 === mediaStorageUsed
				? translate(
						'1 free video available. Upgrade now to unlock more videos and 1TB of storage.'
				  )
				: translate(
						'You have used your free video. Upgrade now to unlock more videos and 1TB of storage.'
				  );
		return (
			! hasVideoPress && (
				<UpsellNudge
					title={ upsellMessage }
					event="jetpack_video_settings"
					feature={ WPCOM_FEATURES_VIDEOPRESS }
					showIcon
					href={ `/checkout/${ siteSlug }/${ PRODUCT_JETPACK_VIDEOPRESS }` }
				/>
			)
		);
	}

	render() {
		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<Card>{ this.renderVideoSettings() }</Card>
				{ this.renderVideoUpgradeNudge() }
			</div>
		);
	}
}

export default withMediaStorage(
	connect( ( state, { mediaStorage, siteId } ) => {
		return {
			isVideoPressActive: isJetpackModuleActive( state, siteId, 'videopress' ),
			hasVideoPress:
				siteHasFeature( state, siteId, WPCOM_FEATURES_VIDEOPRESS ) ||
				siteHasFeature( state, siteId, WPCOM_FEATURES_VIDEOPRESS_UNLIMITED_STORAGE ),
			mediaStorageLimit: mediaStorage?.maxStorageBytes ?? null,
			mediaStorageUsed: mediaStorage?.storageUsedBytes ?? null,
			sitePlanSlug: getSitePlanSlug( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
		};
	} )( localize( MediaSettingsPerformance ) )
);
