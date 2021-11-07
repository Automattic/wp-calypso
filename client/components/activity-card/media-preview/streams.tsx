import { useDesktopBreakpoint } from '@automattic/viewport-react';
import * as React from 'react';
import type { Activity } from '../types';

interface OwnProps {
	streams: Activity[];
}

const useMaxImages = () => {
	const MOBILE = 3;
	const DESKTOP = 5;

	const isDesktop = useDesktopBreakpoint();
	return isDesktop ? DESKTOP : MOBILE;
};

const StreamsMediaPreview: React.FC< OwnProps > = ( { streams } ) => {
	const maxImages = useMaxImages();

	const imgSrcs = streams
		.map( ( { activityMedia } ) => activityMedia?.medium_url )
		.filter( ( imgSrc ): imgSrc is string => !! imgSrc );

	const imageCount = imgSrcs.length < maxImages ? imgSrcs.length : maxImages;

	return (
		<div className="media-preview__streams">
			{ imgSrcs.slice( 0, imageCount ).map( ( imgSrc, index ) => (
				<div key={ `media-preview__streams-img-${ index }` }>
					<img src={ imgSrc } alt={ `streams preview ${ index }` } />
				</div>
			) ) }
		</div>
	);
};

export default StreamsMediaPreview;
