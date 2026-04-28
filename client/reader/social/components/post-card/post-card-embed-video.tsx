import type { AtmosphereEmbedVideo } from '@automattic/api-core';

interface PostCardEmbedVideoProps {
	embed: AtmosphereEmbedVideo;
}

export function PostCardEmbedVideo( { embed }: PostCardEmbedVideoProps ) {
	return (
		<div
			className="social-post-card-embed-video"
			style={
				embed.aspect_ratio
					? {
							aspectRatio: `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }`,
					  }
					: undefined
			}
		>
			<img
				className="social-post-card-embed-video__thumbnail"
				src={ embed.thumbnail }
				alt={ embed.alt || '' }
				loading="lazy"
			/>
			<span className="social-post-card-embed-video__play" aria-hidden="true">
				▶
			</span>
		</div>
	);
}
