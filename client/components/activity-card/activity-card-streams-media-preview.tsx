/**
 * External dependencies
 */
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import type { Activity } from './types';

interface Props {
	streams: Activity[];
}

const MAX_THUMBNAILS_COUNT = 3;
const MAX_DESKTOP_THUMBNAILS_COUNT = 5;

const ActivityCardStreamsMediaPreview: FunctionComponent< Props > = ( { streams } ) => {
	const imgSrcs = streams
		.map( ( { activityMedia } ) => activityMedia?.medium_url )
		.filter( ( imgSrc ): imgSrc is string => !! imgSrc );

	const isDesktop = useDesktopBreakpoint();
	const maxImages = isDesktop ? MAX_DESKTOP_THUMBNAILS_COUNT : MAX_THUMBNAILS_COUNT;
	const imageCount = imgSrcs.length < maxImages ? imgSrcs.length : maxImages;

	return (
		<div className="activity-card__streams-media-preview">
			{ imgSrcs.slice( 0, imageCount ).map( ( imgSrc, index ) => (
				<div key={ `activity-card__streams-media-preview-img-${ index }` }>
					<img src={ imgSrc } alt={ `streams preview ${ index }` } />
				</div>
			) ) }
		</div>
	);
};

export default ActivityCardStreamsMediaPreview;
