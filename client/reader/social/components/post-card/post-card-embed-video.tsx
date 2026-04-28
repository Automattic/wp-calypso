import { useTranslate } from 'i18n-calypso';
import { buildBskyEmbedSrc } from './build-bsky-embed-src';
import type { AtmosphereEmbedVideo } from '@automattic/api-core';

interface PostCardEmbedVideoProps {
	embed: AtmosphereEmbedVideo;
	expanded?: boolean;
	parentUrl?: string;
}

export function PostCardEmbedVideo( { embed, expanded, parentUrl }: PostCardEmbedVideoProps ) {
	const translate = useTranslate();
	const aspectRatioCss = embed.aspect_ratio
		? `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }`
		: undefined;
	const containerStyle = aspectRatioCss ? { aspectRatio: aspectRatioCss } : undefined;

	const embedSrc = expanded && parentUrl ? buildBskyEmbedSrc( parentUrl ) : null;

	if ( embedSrc ) {
		return (
			<div className="social-post-card-embed-video" style={ containerStyle }>
				<iframe
					className="social-post-card-embed-video__iframe"
					src={ embedSrc }
					title={ embed.alt || String( translate( 'Bluesky video' ) ) }
					sandbox="allow-scripts allow-same-origin allow-popups"
					allow="autoplay; fullscreen; picture-in-picture"
					loading="lazy"
					referrerPolicy="strict-origin-when-cross-origin"
				/>
			</div>
		);
	}

	return (
		<div className="social-post-card-embed-video" style={ containerStyle }>
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
