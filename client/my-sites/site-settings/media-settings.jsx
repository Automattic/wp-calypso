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
import filesize from 'filesize';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import {
	PLAN_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
} from 'lib/plans/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode
} from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getMediaStorageLimit,
	getMediaStorageUsed,
} from 'state/selectors';
import {
	getSitePlanSlug,
	getSiteSlug,
} from 'state/sites/selectors';
import { updateSettings } from 'state/jetpack/settings/actions';
import QueryMediaStorage from 'components/data/query-media-storage';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import PlanStorageBar from 'blocks/plan-storage/bar';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

class MediaSettings extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		onChangeField: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,

		// Connected props
		carouselActive: PropTypes.bool.isRequired,
		isVideoPressActive: PropTypes.bool,
		isVideoPressAvailable: PropTypes.bool,
		mediaStorageLimit: PropTypes.number,
		mediaStorageUsed: PropTypes.number,
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
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

		return isVideoPressAvailable && (
			<FormFieldset className="site-settings__formfieldset has-divider is-top-only">
				<div className="site-settings__info-link-container">
					<InfoPopover position="left">
						<ExternalLink target="_blank" icon href="https://jetpack.com/support/videopress/" >
							{ translate( 'Learn more about VideoPress.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
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
			mediaStorageLimit,
			mediaStorageUsed,
			siteId,
			sitePlanSlug,
			siteSlug,
			translate,
		} = this.props;

		// The API may use -1 for both values to indicate special cases
		const isStorageDataValid = (
			null !== mediaStorageUsed &&
			null !== mediaStorageLimit &&
			mediaStorageUsed > -1
		);
		const isStorageUnlimited = mediaStorageLimit === -1;

		const renderedStorageInfo = isStorageDataValid && (
			isStorageUnlimited
				? (
					<FormSettingExplanation className="site-settings__videopress-storage-used">
						{ translate( '%(size)s uploaded, unlimited storage available', {
							args: {
								size: filesize( mediaStorageUsed ),
							}
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
				)
		);

		return (
			<div className="site-settings__videopress-storage">
				<QueryMediaStorage siteId={ siteId } />
				{ renderedStorageInfo }
			</div>
		);
	}

	renderVideoUpgradeNudge() {
		const {
			isVideoPressAvailable,
			translate,
		} = this.props;

		return ! isVideoPressAvailable && (
			<Banner
				event={ 'jetpack_video_settings' }
				feature={ FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM }
				plan={ PLAN_JETPACK_PREMIUM }
				title={ translate( 'Host fast, high-quality, ad-free video.' ) }
			/>
		);
	}

	render() {
		const {
			carouselActive,
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			photonModuleUnavailable,
			selectedSiteId,
			siteId,
			translate
		} = this.props;
		const labelClassName = isSavingSettings || ! carouselActive ? 'is-disabled' : null;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<Card>
					<QueryJetpackConnection siteId={ selectedSiteId } />
					<FormFieldset>
						<div className="site-settings__info-link-container">
							<InfoPopover position="left">
								<ExternalLink target="_blank" icon href="https://jetpack.com/support/photon" >
									{ translate( 'Learn more' ) }
								</ExternalLink>
							</InfoPopover>
						</div>
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="photon"
							label={ translate( 'Speed up images and photos' ) }
							description={ translate( 'Must be enabled to use tiled galleries.' ) }
							disabled={ isRequestingOrSaving || photonModuleUnavailable }
							/>
					</FormFieldset>
					<FormFieldset className="site-settings__formfieldset has-divider is-top-only">
						<div className="site-settings__info-link-container">
							<InfoPopover position="left">
								<ExternalLink target="_blank" icon href="https://jetpack.com/support/carousel" >
									{ translate( 'Learn more about Carousel.' ) }
								</ExternalLink>
							</InfoPopover>
						</div>
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="carousel"
							label={ translate( 'Transform standard image galleries into full-screen slideshows' ) }
							disabled={ isRequestingOrSaving }
						/>
						<div className="site-settings__child-settings">
							<CompactFormToggle
								checked={ fields.carousel_display_exif || false }
								disabled={ isRequestingOrSaving || ! carouselActive }
								onChange={ handleAutosavingToggle( 'carousel_display_exif' ) } >
								{ translate( 'Show photo metadata in carousel, when available' ) }
							</CompactFormToggle>
							<FormLabel className={ labelClassName } htmlFor="carousel_background_color">
								{ translate( 'Background color' ) }
							</FormLabel>
							<FormSelect
								name="carousel_background_color"
								id="carousel_background_color"
								value={ fields.carousel_background_color || 'black' }
								onChange={ onChangeField( 'carousel_background_color' ) }
								disabled={ isRequestingOrSaving || ! carouselActive } >
								<option value="black" key="carousel_background_color_black">
									{ translate( 'Black' ) }
								</option>
								<option value="white" key="carousel_background_color_white">
									{ translate( 'White' ) }
								</option>
							</FormSelect>
						</div>
					</FormFieldset>
					{ this.renderVideoSettings() }
				</Card>
				{ this.renderVideoUpgradeNudge() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const sitePlanSlug = getSitePlanSlug( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, selectedSiteId, 'photon' );
		const isVideoPressAvailable = (
			hasFeature( state, selectedSiteId, FEATURE_VIDEO_UPLOADS ) ||
			hasFeature( state, selectedSiteId, FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ) ||
			hasFeature( state, selectedSiteId, FEATURE_VIDEO_UPLOADS_JETPACK_PRO )
		);

		return {
			carouselActive: !! isJetpackModuleActive( state, selectedSiteId, 'carousel' ),
			isVideoPressActive: isJetpackModuleActive( state, selectedSiteId, 'videopress' ),
			isVideoPressAvailable,
			mediaStorageLimit: getMediaStorageLimit( state, selectedSiteId ),
			mediaStorageUsed: getMediaStorageUsed( state, selectedSiteId ),
			photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			selectedSiteId,
			sitePlanSlug,
			siteSlug: getSiteSlug( state, selectedSiteId ),
		};
	},
	{
		updateSettings
	}
)( localize( MediaSettings ) );
