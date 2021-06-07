/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ReaderFeaturedVideoBlock from 'calypso/blocks/reader-featured-video';

const exampleVideo = {
	autoplayIframe:
		'<iframe data-wpcom-embed-url="https://www.youtube.com/watch?v=jtQ98OZrW5M" class="youtube-player" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/jtQ98OZrW5M?version=3&amp;rel=1&amp;fs=1&amp;autohide=2&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1&amp;wmode=transparent&amp;autoplay=1" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>',
	aspectRatio: 1.641025641025641,
	height: 390,
	iframe:
		'<iframe data-wpcom-embed-url="https://www.youtube.com/watch?v=jtQ98OZrW5M" class="youtube-player" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/jtQ98OZrW5M?version=3&amp;rel=1&amp;fs=1&amp;autohide=2&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1&amp;wmode=transparent" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>',
	mediaType: 'video',
	src:
		'https://www.youtube.com/embed/jtQ98OZrW5M?version=3&rel=1&fs=1&autohide=2&showsearch=0&showinfo=1&iv_load_policy=1&wmode=transparent',
	thumbnailUrl: 'https://img.youtube.com/vi/jtQ98OZrW5M/mqdefault.jpg',
	type: 'youtube',
	width: 640,
};

const ReaderFeaturedVideo = () => (
	<div className="reader-featured-video-example design-assets__group">
		<div>
			<h3>With play button</h3>
			<ReaderFeaturedVideoBlock { ...exampleVideo } videoEmbed={ exampleVideo } />
		</div>
		<div>
			<h3>Without play button</h3>
			<ReaderFeaturedVideoBlock
				{ ...exampleVideo }
				videoEmbed={ exampleVideo }
				allowPlaying={ false }
			/>
		</div>
	</div>
);

ReaderFeaturedVideo.displayName = 'ReaderFeaturedVideo';

export default ReaderFeaturedVideo;
