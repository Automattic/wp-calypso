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
import UpsellNudge from 'blocks/upsell-nudge';
import { Card } from '@automattic/components';
import filesize from 'filesize';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import SupportInfo from 'components/support-info';
import { planHasFeature } from 'lib/plans';
import {
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	TERM_ANNUALLY,
} from 'lib/plans/constants';
import getMediaStorageLimit from 'state/selectors/get-media-storage-limit';
import getMediaStorageUsed from 'state/selectors/get-media-storage-used';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug, getSiteSlug } from 'state/sites/selectors';
import QueryMediaStorage from 'components/data/query-media-storage';
import PlanStorageBar from 'blocks/plan-storage/bar';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { OPTIONS_JETPACK_SECURITY } from 'my-sites/plans-v2/constants';
import { getPathToDetails } from 'my-sites/plans-v2/utils';

class MediaSettingsPerformance extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		// Connected props
		isVideoPressActive: PropTypes.bool,
		isVideoPressAvailable: PropTypes.bool,
		mediaStorageLimit: PropTypes.number,
		mediaStorageUsed: PropTypes.number,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	renderVideoSettings() {
		const {
			isRequestingSettings,
			isSavingSettings,
			isVideoPressAvailable,
			siteId,
			translate,
		} = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			isVideoPressAvailable && (
				<FormFieldset className="site-settings__formfieldset jetpack-video-hosting-settings">
					<SupportInfo
						text={ translate( 'Hosts your video files on the global WordPress.com servers.' ) }
						link="https://jetpack.com/support/videopress/"
					/>
					<JetpackModuleToggle
						siteId={ siteId }
						moduleSlug="videopress"
						label={ translate( 'Enable fast, ad-free video hosting' ) }
						disabled={ isRequestingOrSaving }
					/>
					{ this.props.isVideoPressActive && this.renderVideoStorageIndicator() }
				</FormFieldset>
			)
		);
	}

	renderVideoStorageIndicator() {
		const {
			mediaStorageLimit,
			mediaStorageUsed,
			siteId,
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
						max_storage_bytes: mediaStorageLimit,
						storage_used_bytes: mediaStorageUsed,
					} }
				/>
			) );

		return (
			<div className="site-settings__videopress-storage">
				<QueryMediaStorage siteId={ siteId } />
				{ renderedStorageInfo }
			</div>
		);
	}

	renderVideoUpgradeNudge() {
		const { isVideoPressAvailable, siteSlug, translate } = this.props;

		return (
			! isVideoPressAvailable && (
				<UpsellNudge
					title={ translate( 'Get unlimited video hosting' ) }
					description={ translate(
						'Tired of ads in your videos? Get high-speed video right on your site'
					) }
					event={ 'jetpack_video_settings' }
					feature={ FEATURE_VIDEO_UPLOADS_JETPACK_PRO }
					showIcon={ true }
					href={ getPathToDetails(
						'/plans',
						{},
						OPTIONS_JETPACK_SECURITY,
						TERM_ANNUALLY,
						siteSlug
					) }
				/>
			)
		);
	}

	render() {
		const { isVideoPressAvailable, sitePlanSlug } = this.props;

		if ( ! sitePlanSlug ) {
			return null;
		}

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				{ isVideoPressAvailable && <Card>{ this.renderVideoSettings() }</Card> }
				{ this.renderVideoUpgradeNudge() }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const sitePlanSlug = getSitePlanSlug( state, selectedSiteId );
	const isVideoPressAvailable =
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS ) ||
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ) ||
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PRO );

	return {
		isVideoPressActive: isJetpackModuleActive( state, selectedSiteId, 'videopress' ),
		isVideoPressAvailable,
		mediaStorageLimit: getMediaStorageLimit( state, selectedSiteId ),
		mediaStorageUsed: getMediaStorageUsed( state, selectedSiteId ),
		sitePlanSlug,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( MediaSettingsPerformance ) );
