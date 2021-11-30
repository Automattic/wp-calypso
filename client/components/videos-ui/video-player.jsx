import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const VideoPlayer = ( { videoData, videoRef, isPlaying, course } ) => {
	const [ addTimeUpdateHandler, setAddTimeUpdateHandler ] = useState( true );

	const markVideoAsComplete = () => {
		if ( videoRef.current.currentTime < videoData.completed_seconds ) {
			return;
		}
		recordTracksEvent( 'calypso_courses_video_completed', {
			course: course.slug,
			video: videoData.slug,
		} );
		setAddTimeUpdateHandler( false );
	};

	useEffect( () => {
		if ( isPlaying ) {
			videoRef.current.play();
		}
	} );

	return (
		<div key={ videoData.url } className="videos-ui__video">
			<video
				controls
				ref={ videoRef }
				poster={ videoData.poster }
				autoPlay={ isPlaying }
				onTimeUpdate={ addTimeUpdateHandler ? markVideoAsComplete : undefined }
			>
				<source src={ videoData.url } />{ ' ' }
				{ /* @TODO: check if tracks are available, the linter demands one */ }
				<track src="caption.vtt" kind="captions" srcLang="en" label="english_captions" />
			</video>
		</div>
	);
};

export default VideoPlayer;
