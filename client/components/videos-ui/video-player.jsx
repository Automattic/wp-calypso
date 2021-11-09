import { useEffect } from 'react';

const VideoPlayer = ( { videoRef, videoUrl, isPlaying } ) => {
	useEffect( () => {
		if ( isPlaying ) {
			videoRef.current.play();
		}
	} );

	return (
		<div key={ videoUrl } className="videos-ui__video">
			<video ref={ videoRef } controls autoPlay={ isPlaying }>
				<source src={ videoUrl } />{ ' ' }
				{ /* @TODO: check if tracks are available, the linter demands one */ }
				<track src="caption.vtt" kind="captions" srcLang="en" label="english_captions" />
			</video>
		</div>
	);
};

export default VideoPlayer;
