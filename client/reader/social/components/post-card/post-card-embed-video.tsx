import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import type { SocialEmbedVideo } from '../../types';

interface PostCardEmbedVideoProps {
	embed: SocialEmbedVideo;
	expanded?: boolean;
}

const HLS_MIME = 'application/vnd.apple.mpegurl';

export function PostCardEmbedVideo( { embed, expanded }: PostCardEmbedVideoProps ) {
	const translate = useTranslate();
	const videoRef = useRef< HTMLVideoElement >( null );
	const aspectRatioCss = embed.aspect_ratio
		? `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }`
		: undefined;
	const containerStyle = aspectRatioCss ? { aspectRatio: aspectRatioCss } : undefined;

	useEffect( () => {
		if ( ! expanded ) {
			return;
		}
		const video = videoRef.current;
		if ( ! video ) {
			return;
		}
		// Safari + iOS WebKit play HLS natively; setting src is enough.
		if ( video.canPlayType( HLS_MIME ) ) {
			video.src = embed.playlist;
			return () => {
				// Switching threads while audio plays would otherwise leave
				// the previous track buffered for a frame.
				video.pause();
				video.removeAttribute( 'src' );
				video.load();
			};
		}
		// Other browsers: lazy-load hls.js (kept out of the timeline chunk).
		let cancelled = false;
		let hls: { destroy: () => void } | null = null;
		( async () => {
			const { default: Hls } = await import( 'hls.js' );
			if ( cancelled || ! Hls.isSupported() ) {
				return;
			}
			// `enableWorker: false` keeps transmuxing on the main thread so
			// we don't have to widen the page CSP with `worker-src blob:` —
			// hls.js's worker is loaded from a `blob:` URL it builds at
			// runtime, which would otherwise be blocked. The main-thread
			// path is fine for Bluesky's short-form videos.
			const instance = new Hls( { enableWorker: false } );
			hls = instance;
			instance.loadSource( embed.playlist );
			instance.attachMedia( video );
		} )();
		return () => {
			cancelled = true;
			hls?.destroy();
			video.pause();
		};
	}, [ expanded, embed.playlist ] );

	const accessibleLabel = embed.alt || String( translate( 'Bluesky video' ) );

	if ( expanded ) {
		return (
			<div className="social-post-card-embed-video" style={ containerStyle }>
				{ /* eslint-disable-next-line jsx-a11y/media-has-caption -- Bluesky's video upload flow does not produce captions. */ }
				<video
					ref={ videoRef }
					className="social-post-card-embed-video__player"
					poster={ embed.thumbnail }
					controls
					playsInline
					preload="metadata"
					aria-label={ accessibleLabel }
				/>
			</div>
		);
	}

	return (
		<div className="social-post-card-embed-video" style={ containerStyle }>
			<img
				className="social-post-card-embed-video__thumbnail"
				src={ embed.thumbnail }
				// Fall back to the generic "Bluesky video" label when the post
				// has no alt text — Bluesky doesn't always carry one, and an
				// empty alt would mark the image decorative, leaving
				// screen-reader users with no signal that the card has video.
				alt={ accessibleLabel }
				loading="lazy"
			/>
			<span className="social-post-card-embed-video__play" aria-hidden="true">
				▶
			</span>
		</div>
	);
}
