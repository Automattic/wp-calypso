/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded';
import { PLAN_PREMIUM, FEATURE_VIDEO_UPLOADS, FEATURE_AUDIO_UPLOADS } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';

function getTitle( filter, translate ) {
	if ( filter === 'audio' ) {
		return translate( 'Upgrade to the Premium Plan and Enable Audio Uploads' );
	}

	return translate( 'Upgrade to a Premium Plan and Enable VideoPress' );
}

function getSubtitle( filter, translate ) {
	if ( filter === 'audio' ) {
		return translate( 'By upgrading to the Premium plan you\'ll enable audio upload support on your site.' );
	}

	return translate( 'By upgrading to a Premium Plan you\'ll enable VideoPress support on your site.' );
}

function getBenefits( filter, translate ) {
	if ( filter === 'audio' ) {
		return [
			translate(
				'Add support for podcasting to your site, including a built-in audio player.',
				{ comment: 'Perk for upgrading to premium plan' }
			),
			translate(
				'Upload audio files that use any major audio file format.',
				{ comment: 'Perk for upgrading to premium plan' }
			),
			translate(
				'Get more than four times the storage space for all of your media files.',
				{ comment: 'Perk for upgrading to premium plan' }
			)
		];
	}

	return [
		translate(
			'Upload videos to your site with an interface designed specifically for WordPress.',
			{ comment: 'Perk for upgrading to premium plan' }
		),
		translate(
			'Present videos using a lightweight and responsive player that is ad-free and unbranded.',
			{ comment: 'Perk for upgrading to premium plan' }
		),
		translate(
			'See where your videos have been shared as well as stats for individual and overall video plays.',
			{ comment: 'Perk for upgrading to premium plan' }
		)
	];
}

export const MediaLibraryUpgradeNudge = ( { translate, filter } ) => (
	<div className="media-library__videopress-nudge-container">
		<UpgradeNudgeExpanded
			plan={ PLAN_PREMIUM }
			title={ getTitle( filter, translate ) }
			subtitle={ getSubtitle( filter, translate ) }
			highlightedFeature={ 'audio' === filter ? FEATURE_AUDIO_UPLOADS : FEATURE_VIDEO_UPLOADS }
			eventName="calypso_media_uploads_upgrade_nudge_impression"
			benefits={ getBenefits( filter, translate ) }
			testedRegularNudge={
				<UpgradeNudge
					title={ getTitle( filter, translate ) }
					message={ getSubtitle( filter, translate ) }
					feature={ 'audio' === filter ? FEATURE_AUDIO_UPLOADS : FEATURE_VIDEO_UPLOADS }
					event="calypso_media_uploads_upgrade_nudge_impression"
				/>
			}
		/>
	</div>
);

MediaLibraryUpgradeNudge.propTypes = {
	translate: PropTypes.func,
	filter: React.PropTypes.string
};

MediaLibraryUpgradeNudge.defaultProps = {
	translate: identity,
	filter: 'video'
};

export default localize( MediaLibraryUpgradeNudge );
