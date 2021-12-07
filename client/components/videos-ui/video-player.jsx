import { createRef, useEffect, useState } from 'react';

const VideoPlayer = ( {
	videoData,
	isPlaying,
	course,
	onVideoPlayStatusChanged,
	onVideoCompleted,
} ) => {
	const [ shouldCheckForVideoComplete, setShouldCheckForVideoComplete ] = useState( true );

	const videoRef = createRef();

	const markVideoAsComplete = () => {
		if ( videoRef.current.currentTime < videoData.completed_seconds ) {
			return;
		}
		onVideoCompleted( videoData );
		setShouldCheckForVideoComplete( false );
	};

	const trackPlayClick = () => {
		recordTracksEvent( 'calypso_courses_video_player_play_click', {
			course: course.slug,
			video: videoData.slug,
		} );
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
		</div>
	);
};

export default VideoPlayer;
