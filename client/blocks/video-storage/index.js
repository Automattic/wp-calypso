/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PlanStorageBar from 'blocks/plan-storage/bar';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import {
	getSitePlanSlug,
	getSiteSlug,
} from 'state/sites/selectors';

function VideoStorage( {
	mediaStorage,
	sitePlanSlug,
	siteSlug,
} ) {
	return (
		<PlanStorageBar
			siteSlug={ siteSlug }
			sitePlanSlug={ sitePlanSlug }
			mediaStorage={ mediaStorage }
		/>
	);
}

VideoStorage.propTypes = {
	siteId: PropTypes.number,
};

export default connect( ( state, { siteId } ) => ( {
	mediaStorage: getMediaStorage( state, siteId ),
	sitePlanSlug: getSitePlanSlug( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
} ) )( VideoStorage );
