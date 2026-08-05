import { Icon, video } from '@wordpress/icons';
import { useState } from 'react';

import './stats-list-video-thumbnail.scss';

export default function StatsListVideoThumbnail( { poster }: { poster?: string | null } ) {
	// Posters of private videos come back as tokenless CDN URLs that the CDN
	// rejects (STATS-374), so fall back to the placeholder rather than showing
	// a broken image.
	const [ failedPoster, setFailedPoster ] = useState< string | null >( null );
	const posterUrl = poster && poster !== failedPoster ? poster : null;

	return (
		<span className="stats-list__video-thumbnail">
			{ posterUrl ? (
				<img
					className="stats-list__video-thumbnail-image"
					src={ posterUrl }
					alt=""
					loading="lazy"
					onError={ () => setFailedPoster( posterUrl ) }
				/>
			) : (
				<Icon icon={ video } size={ 16 } />
			) }
		</span>
	);
}
