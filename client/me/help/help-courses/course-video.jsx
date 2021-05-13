/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

export default localize( ( props ) => {
	const { youtubeId } = props;

	return (
		<div className="help-courses__course-video">
			<div className="help-courses__course-video-embed">
				<iframe
					className="help-courses__course-video-embed-iframe"
					src={ `https://www.youtube.com/embed/${ youtubeId }?rel=0&showinfo=0` }
					allowFullScreen
				/>
			</div>
		</div>
	);
} );
