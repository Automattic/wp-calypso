/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded';
import { PLAN_PREMIUM, FEATURE_VIDEO_UPLOADS, FEATURE_AUDIO_UPLOADS } from 'lib/plans/constants';

export const MediaLibraryUpgradeNudge = ( { translate, filter } ) => {
	let title = translate( 'Upgrade to a Premium Plan and Enable VideoPress' );
	let subtitle = translate( `By upgrading to a Premium Plan you'll enable VideoPress support on your site.` );
	let highlightedFeature = FEATURE_VIDEO_UPLOADS;
	let benefits = [
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

	if ( 'audio' === filter ) {
		title = translate( 'Upgrade to the Premium Plan and Enable Audio Uploads' );
		subtitle = translate( `By upgrading to the Premium plan you'll enable audio upload support on your site.` );
		highlightedFeature = FEATURE_AUDIO_UPLOADS;
		benefits = [
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

	return (
		<div className="media-library__videopress-nudge-container">
			<UpgradeNudgeExpanded
				plan={ PLAN_PREMIUM }
				title={ title }
				subtitle={ subtitle }
				highlightedFeature={ highlightedFeature }
				eventName="calypso_media_uploads_upgrade_nudge_impression"
				benefits={ benefits }
			/>
		</div>
	);
};

MediaLibraryUpgradeNudge.propTypes = {
	translate: PropTypes.func,
	filter: React.PropTypes.string
};

MediaLibraryUpgradeNudge.defaultProps = {
	translate: identity,
	filter: 'video'
};

export default localize( MediaLibraryUpgradeNudge );
