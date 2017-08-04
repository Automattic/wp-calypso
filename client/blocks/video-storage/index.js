/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import {
	every,
	some,
	get,
} from 'lodash';

/**
 * Internal dependencies
 */
import PlanStorageBar from 'blocks/plan-storage/bar';
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	getSitePlanSlug,
	getSiteSlug,
} from 'state/sites/selectors';
import {
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
} from 'lib/plans/constants';

function VideoStorage( {
	className,
	hasUnlimitedStorage,
	mediaStorage,
	siteId,
	sitePlanSlug,
	siteSlug,
} ) {
	if ( ! siteId || hasUnlimitedStorage ) {
		return null;
	}

	const isStorageDataValid = every( [
		get( mediaStorage, 'max_storage_bytes', -1 ) > -1,
		get( mediaStorage, 'storage_used_bytes', -1 ) > -1,
	] );

	return (
		<div className={ classnames( 'video-storage', className ) }>
			<QueryMediaStorage siteId={ siteId } />
			{ isStorageDataValid && <PlanStorageBar
				className="video-storage__bar"
				siteSlug={ siteSlug }
				sitePlanSlug={ sitePlanSlug }
				mediaStorage={ mediaStorage }
			/> }
		</div>
	);
}

VideoStorage.propTypes = {
	siteId: PropTypes.number,
	className: PropTypes.string,

	// Connected props
	hasUnlimitedStorage: PropTypes.bool,
	mediaStorage: PropTypes.shape( {
		max_storage_bytes: PropTypes.number.isRequired,
		storage_used_bytes: PropTypes.number.isRequired,
	} ),
	sitePlanSlug: PropTypes.string,
	siteSlug: PropTypes.string,
};

export default connect( ( state, { siteId } ) => ( {
	mediaStorage: getMediaStorage( state, siteId ),
	sitePlanSlug: getSitePlanSlug( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	hasUnlimitedStorage: some( [
		hasFeature( state, siteId, FEATURE_UNLIMITED_STORAGE ),
		hasFeature( state, siteId, FEATURE_VIDEO_UPLOADS_JETPACK_PRO ),
	] )
} ) )( VideoStorage );
