import React from 'react';
import ReaderFeaturedVideoBlock from 'calypso/blocks/reader-featured-video';

import './style.scss';

const GettingStartedVideo: React.FunctionComponent = () => {
	const video = {
		autoplayIframe:
			'<iframe src="https://www.youtube.com/embed/twGLN4lug-I" width="768px" height="426px" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
		iframe:
			'<iframe src="https://www.youtube.com/embed/twGLN4lug-I" width="768px" height="426px" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
		src: 'https://youtu.be/twGLN4lug-I',
		aspectRatio: 1.8,
		width: '100%',
		height: 'auto',
	};

	return (
		<div className="getting-started-video">
			<p>
				Watch <strong>Getting started on WordPress.com</strong> while you wait
			</p>
			<ReaderFeaturedVideoBlock { ...video } videoEmbed={ video } isExpanded={ true } />
		</div>
	);
};

export default GettingStartedVideo;
