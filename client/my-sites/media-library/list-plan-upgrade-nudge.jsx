import {
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	WPCOM_FEATURES_UPLOAD_VIDEO_FILES,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import ListPlanPromo from './list-plan-promo';

export const MediaLibraryUpgradeNudge = ( { translate, filter = 'video', site } ) => {
	const commonEventProps = {
		cta_name: 'calypso_media_uploads_upgrade_nudge',
		cta_feature:
			'audio' === filter ? WPCOM_FEATURES_UPLOAD_AUDIO_FILES : WPCOM_FEATURES_UPLOAD_VIDEO_FILES,
		cta_size: 'regular',
	};

	const handleClick = () => {
		const planSlug = 'audio' === filter ? PLAN_PERSONAL : PLAN_PREMIUM;
		const checkoutUrl = addQueryArgs( `/checkout/${ site.slug }/${ planSlug }`, {
			redirect_to: `/media/${ filter }/${ site.slug }?upgrade=success`,
		} );

		recordTracksEvent( 'calypso_upgrade_nudge_cta_click', commonEventProps );
		page.redirect( checkoutUrl );
	};

	if ( ! site ) {
		return null;
	}

	return (
		<div className="media-library__videopress-nudge-container">
			<ListPlanPromo site={ site } filter={ filter }>
				<Button variant="primary" onClick={ handleClick }>
					{ translate( 'Upgrade now' ) }
				</Button>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ commonEventProps }
				/>
			</ListPlanPromo>
		</div>
	);
};

MediaLibraryUpgradeNudge.propTypes = {
	site: PropTypes.object,
	translate: PropTypes.func,
	filter: PropTypes.string,
};

export default localize( MediaLibraryUpgradeNudge );
