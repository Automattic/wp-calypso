import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { createRef, useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const VideoPlayer = ( {
	videoData,
	isPlaying,
	course,
	onVideoPlayStatusChanged,
	onVideoCompleted,
	intent,
} ) => {
	const translate = useTranslate();
	const [ shouldCheckForVideoComplete, setShouldCheckForVideoComplete ] = useState( true );

	const videoRef = createRef();
	const resourceLinks = videoData.resource_links || [];

	const markVideoAsComplete = () => {
		if ( videoRef.current.currentTime < videoData.completed_seconds ) {
			return;
		}
		onVideoCompleted( videoData );
		setShouldCheckForVideoComplete( false );
	};

	useEffect( () => {
		if ( videoRef.current ) {
			videoRef.current.onplay = () => {
				onVideoPlayStatusChanged( true );
			};

			videoRef.current.onpause = () => {
				onVideoPlayStatusChanged( false );
			};
		}
	} );

	useEffect( () => {
		if ( isPlaying ) {
			videoRef.current.play();
		}
	} );

	useEffect( () => {
		setShouldCheckForVideoComplete( true );
	}, [ course?.slug, videoData?.slug ] );

	const trackPlayClick = () => {
		recordTracksEvent( 'calypso_courses_video_player_play_click', {
			course: course.slug,
			video: videoData.slug,
			...( intent ? { intent } : [] ),
		} );
	};

	const trackResourceLinkClick = ( url ) => {
		recordTracksEvent( 'calypso_courses_video_resource_link_click', {
			course: course.slug,
			video: videoData.slug,
			url,
		} );
	};

	return (
		<div key={ videoData.url } className="videos-ui__video">
			<video
				controls
				ref={ videoRef }
				poster={ videoData.poster }
				autoPlay={ isPlaying }
				onPlay={ trackPlayClick }
				onTimeUpdate={ shouldCheckForVideoComplete ? markVideoAsComplete : undefined }
			>
				<source src={ videoData.url } />{ ' ' }
				{ /* @TODO: check if tracks are available, the linter demands one */ }
				<track src="caption.vtt" kind="captions" srcLang="en" label="english_captions" />
			</video>

			{ resourceLinks.length > 0 && (
				<div className="videos-ui__resource-links">
					<h3>{ translate( 'Resource links' ) }</h3>
					<ul>
						{ resourceLinks.map( ( link, index ) => (
							<li key={ index }>
								<ExternalLink
									href={ link.url }
									target="_blank"
									icon
									onClick={ () => trackResourceLinkClick( link.url ) }
								>
									{ link.text }
								</ExternalLink>
							</li>
						) ) }
					</ul>
				</div>
			) }
		</div>
	);
};

export default VideoPlayer;
