/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import CourseVideo from './course-video';
import { Card } from '@automattic/components';

export default localize( ( props ) => {
	const { videos, translate } = props;

	if ( videos.length === 0 ) {
		return null;
	}

	return (
		<div className="help-courses__course-videos">
			<Card compact className="help-courses__course-videos-label">
				{ translate( 'Latest course' ) }
			</Card>
			{ videos.map( ( video, key ) => (
				<CourseVideo { ...video } key={ key } />
			) ) }
		</div>
	);
} );
