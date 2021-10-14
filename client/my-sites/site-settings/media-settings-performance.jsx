import {
	isJetpackVideoPress,
	planHasFeature,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import filesize from 'filesize';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanStorageBar from 'calypso/blocks/plan-storage/bar';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryMediaStorage from 'calypso/components/data/query-media-storage';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getMediaStorageLimit from 'calypso/state/selectors/get-media-storage-limit';
import getMediaStorageUsed from 'calypso/state/selectors/get-media-storage-used';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
			isVideoPressFreeTier,
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
			! isVideoPressFreeTier &&
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

		return <div className="site-settings__videopress-storage">{ renderedStorageInfo }</div>;
	}

	renderVideoUpgradeNudge() {
		const { isVideoPressFreeTier, mediaStorageUsed, siteSlug, translate } = this.props;

		const upsellMessage =
			0 === mediaStorageUsed
				? translate(
						'1 free video available. Upgrade now to unlock more videos and 1TB of storage.'
				  )
				: translate(
						'You have used your free video. Upgrade now to unlock more videos and 1TB of storage.'
				  );
		return (
			isVideoPressFreeTier && (
				<UpsellNudge
					title={ upsellMessage }
					event={ 'jetpack_video_settings' }
					feature={ FEATURE_JETPACK_VIDEOPRESS }
					showIcon={ true }
					href={ `/checkout/${ siteSlug }/${ FEATURE_JETPACK_VIDEOPRESS }` }
				/>
			)
		);
	}

	render() {
		const { isVideoPressAvailable, siteId, sitePlanSlug } = this.props;

		if ( ! sitePlanSlug ) {
			return null;
		}

		return (
			<div className="site-settings__module-settings site-settings__media-settings">
				<QueryMediaStorage siteId={ siteId } />
				{ isVideoPressAvailable && <Card>{ this.renderVideoSettings() }</Card> }
				{ this.renderVideoUpgradeNudge() }
			</div>
		);
	}
}
const checkForJetpackVideoPressProduct = ( purchase ) =>
	purchase.active && isJetpackVideoPress( purchase );

/**
 * Security Daily plan no longer includes VideoPress as of end of day Oct 6 2021 UTC.
 * This check enforces the upsell appears only for customers that purchased Security Daily after that date.
 *
 * @param {*} purchase
 * @returns bool
 */
const checkForLegacySecurityDailyPlan = ( purchase ) =>
	purchase.active &&
	( PLAN_JETPACK_SECURITY_DAILY_MONTHLY === purchase.productSlug ||
		PLAN_JETPACK_SECURITY_DAILY === purchase.productSlug ) &&
	moment( purchase.subscribedDate ).isBefore( moment.utc( '2021-10-07' ) );

const checkForActiveJetpackVideoPressPurchases = ( purchase ) =>
	checkForJetpackVideoPressProduct( purchase ) || checkForLegacySecurityDailyPlan( purchase );

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const sitePlanSlug = getSitePlanSlug( state, selectedSiteId );
	const isVideoPressAvailable =
		isJetpackSite( state, selectedSiteId ) ||
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS ) ||
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ) ||
		planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PRO );

	return {
		isVideoPressActive: isJetpackModuleActive( state, selectedSiteId, 'videopress' ),
		isVideoPressAvailable,
		isVideoPressFreeTier:
			isJetpackSite( state, selectedSiteId ) &&
			! isSiteAutomatedTransfer( state, selectedSiteId ) &&
			! getSitePurchases( state, selectedSiteId ).find(
				checkForActiveJetpackVideoPressPurchases
			) &&
			// These features are used in current plans that include VP
			! planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS ) &&
			! planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ) &&
			! planHasFeature( sitePlanSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PRO ),
		mediaStorageLimit: getMediaStorageLimit( state, selectedSiteId ),
		mediaStorageUsed: getMediaStorageUsed( state, selectedSiteId ),
		sitePlanSlug,
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( MediaSettingsPerformance ) );
