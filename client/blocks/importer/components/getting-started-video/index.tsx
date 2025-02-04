import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import ReaderFeaturedVideoBlock from 'calypso/blocks/reader-featured-video';

import './style.scss';

const GettingStartedVideo: React.FunctionComponent = () => {
	const { __ } = useI18n();
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
				{ createInterpolateElement(
					__( 'Watch <strong>Getting started on WordPress.com</strong> while you wait' ),
					{
						strong: createElement( 'strong' ),
					}
				) }
			</p>
			<ReaderFeaturedVideoBlock { ...video } videoEmbed={ video } isExpanded />
		</div>
	);
};

export default GettingStartedVideo;
