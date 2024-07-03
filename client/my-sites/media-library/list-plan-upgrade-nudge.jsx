import {
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	WPCOM_FEATURES_UPLOAD_VIDEO_FILES,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ListPlanPromo from './list-plan-promo';

function getTitle( filter, translate ) {
	if ( filter === 'audio' ) {
		/* translators: %(planName)s is the short-hand version of the Personal plan name */
		return translate( 'Upgrade to the %(planName)s Plan to Enable Audio Uploads', {
			args: { planName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
		} );
	}
	/* translators: %(planName)s is the short-hand version of the Premium plan name */
	return translate( 'Upgrade to the %(planName)s Plan to Enable VideoPress', {
		args: { planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
	} );
}

function getSubtitle( filter, translate ) {
	if ( filter === 'audio' ) {
		return translate(
			/* translators: %(planName)s is the short-hand version of the Personal plan name */
			"By upgrading to the %(planName)s plan, you'll enable audio upload support on your site.",
			{
				args: { planName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
			}
		);
	}
	/* translators: %(planName)s is the short-hand version of the Premium plan name */
	return translate(
		"By upgrading to the %(planName)s plan, you'll enable VideoPress support on your site.",
		{
			args: { planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
		}
	);
}

export const MediaLibraryUpgradeNudge = ( { translate, filter, site } ) => (
	<div className="media-library__videopress-nudge-container">
		<ListPlanPromo site={ site } filter={ filter }>
			<UpsellNudge
				className="media-library__videopress-nudge-regular"
				title={ getTitle( filter, translate ) }
				description={ getSubtitle( filter, translate ) }
				feature={
					'audio' === filter ? WPCOM_FEATURES_UPLOAD_AUDIO_FILES : WPCOM_FEATURES_UPLOAD_VIDEO_FILES
				}
				event="calypso_media_uploads_upgrade_nudge"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksClickName="calypso_upgrade_nudge_cta_click"
				showIcon
			/>
		</ListPlanPromo>
	</div>
);

MediaLibraryUpgradeNudge.propTypes = {
	site: PropTypes.object,
	translate: PropTypes.func,
	filter: PropTypes.string,
};

MediaLibraryUpgradeNudge.defaultProps = {
	filter: 'video',
};

export default localize( MediaLibraryUpgradeNudge );
