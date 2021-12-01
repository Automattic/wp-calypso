import { createRef, useEffect, useState } from 'react';

const VideoPlayer = ( {
	completedSeconds,
	videoUrl,
	onVideoPlayStatusChanged,
	isPlaying,
	poster = undefined,
} ) => {
	const [ addTimeUpdateHandler, setAddTimeUpdateHandler ] = useState( true );

	const videoRef = createRef();

	const markVideoAsComplete = () => {
		if ( videoRef.current.currentTime < completedSeconds ) {
			return;
		}
		setAddTimeUpdateHandler( false );
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
