import { FEATURE_VIDEO_UPLOADS, FEATURE_AUDIO_UPLOADS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ListPlanPromo from './list-plan-promo';

function getTitle( filter, translate ) {
	if ( filter === 'audio' ) {
		return translate( 'Upgrade to the Pro Plan to Enable Audio Uploads' );
	}

	return translate( 'Upgrade to the Pro Plan to Enable VideoPress' );
}

function getSubtitle( filter, translate ) {
	if ( filter === 'audio' ) {
		return translate(
			"By upgrading to the Pro plan, you'll enable audio upload support on your site."
		);
	}

	return translate(
		"By upgrading to the Pro plan, you'll enable VideoPress support on your site."
	);
}

export const MediaLibraryUpgradeNudge = ( { translate, filter, site } ) => (
	<div className="media-library__videopress-nudge-container">
		<ListPlanPromo site={ site } filter={ filter }>
			<UpsellNudge
				className="media-library__videopress-nudge-regular"
				title={ getTitle( filter, translate ) }
				description={ getSubtitle( filter, translate ) }
				feature={ 'audio' === filter ? FEATURE_AUDIO_UPLOADS : FEATURE_VIDEO_UPLOADS }
				event="calypso_media_uploads_upgrade_nudge"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksClickName="calypso_upgrade_nudge_cta_click"
				showIcon={ true }
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
