import { useEffect, useState } from 'react';

const VideoPlayer = ( { completedSeconds, videoRef, videoUrl, isPlaying, poster = undefined } ) => {
	const [ addTimeUpdateHandler, setAddTimeUpdateHandler ] = useState( true );

	const markVideoAsComplete = () => {
		if ( videoRef.current.currentTime < completedSeconds ) {
			return;
		}
		setAddTimeUpdateHandler( false );
	};

	useEffect( () => {
		if ( isPlaying ) {
			videoRef.current.play();
		}
	} );

	return (
		<div key={ videoUrl } className="videos-ui__video">
			<video
				controls
				ref={ videoRef }
				poster={ poster }
				autoPlay={ isPlaying }
				onTimeUpdate={ addTimeUpdateHandler ? markVideoAsComplete : undefined }
			>
				<source src={ videoUrl } />{ ' ' }
				{ /* @TODO: check if tracks are available, the linter demands one */ }
				<track src="caption.vtt" kind="captions" srcLang="en" label="english_captions" />
			</video>
		</div>
	);
};

export default VideoPlayer;
