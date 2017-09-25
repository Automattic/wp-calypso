/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { FEATURE_VIDEO_UPLOADS, FEATURE_AUDIO_UPLOADS } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import ListPlanPromo from './list-plan-promo';

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

export const MediaLibraryUpgradeNudge = ( { translate, filter, site } ) => (
	<div className="media-library__videopress-nudge-container">
		<ListPlanPromo
			site={ site }
			filter={ filter }
			>
			<UpgradeNudge
				className="media-library__videopress-nudge-regular"
				title={ getTitle( filter, translate ) }
				message={ getSubtitle( filter, translate ) }
				feature={ 'audio' === filter ? FEATURE_AUDIO_UPLOADS : FEATURE_VIDEO_UPLOADS }
				event="calypso_media_uploads_upgrade_nudge"
			/>
		</ListPlanPromo>
	</div>
);

MediaLibraryUpgradeNudge.propTypes = {
	site: PropTypes.object,
	translate: PropTypes.func,
	filter: PropTypes.string
};

MediaLibraryUpgradeNudge.defaultProps = {
	translate: identity,
	filter: 'video'
};

export default localize( MediaLibraryUpgradeNudge );
