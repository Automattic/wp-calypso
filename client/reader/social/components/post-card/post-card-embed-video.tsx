import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import type { SocialEmbedVideo } from '../../types';

interface PostCardEmbedVideoProps {
	embed: SocialEmbedVideo;
	expanded?: boolean;
}

const HLS_MIME = 'application/vnd.apple.mpegurl';

export function PostCardEmbedVideo( { embed, expanded }: PostCardEmbedVideoProps ) {
	const translate = useTranslate();
	const videoRef = useRef< HTMLVideoElement >( null );
	// Tracks user-initiated expansion: clicking the thumbnail in a
	// non-target thread node should expand the player inline, not navigate
	// via the card-link overlay. We also use this to autoplay only on
	// click — prop-driven expansion (the thread root) keeps its existing
	// "render player but wait for the user to hit play" behaviour.
	const [ userExpanded, setUserExpanded ] = useState( false );
	const shouldAutoPlayRef = useRef( false );
	const isExpanded = expanded || userExpanded;

	const aspectRatioCss = embed.aspect_ratio
		? `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }`
		: undefined;
	const containerStyle = aspectRatioCss ? { aspectRatio: aspectRatioCss } : undefined;

	useEffect( () => {
		if ( ! isExpanded ) {
			return;
		}
		const video = videoRef.current;
		if ( ! video ) {
			return;
		}
		const playIfRequested = () => {
			if ( shouldAutoPlayRef.current ) {
				shouldAutoPlayRef.current = false;
				// Browsers permit play() inside the user-gesture window
				// opened by the click that flipped userExpanded. If the
				// promise rejects (autoplay policy revoked across an
				// async boundary on stricter mobile engines, source not
				// yet attached, etc.) the native controls remain
				// available as the user-visible recovery path.
				video.play().catch( () => {} );
			}
		};
		// Safari + iOS WebKit play HLS natively; setting src is enough.
		if ( video.canPlayType( HLS_MIME ) ) {
			video.src = embed.playlist;
			playIfRequested();
			return () => {
				// Switching threads while audio plays would otherwise leave
				// the previous track buffered for a frame.
				video.pause();
				video.removeAttribute( 'src' );
				video.load();
				// Drop any unconsumed autoplay intent so a later effect run
				// (e.g. embed.playlist changing in-place) doesn't autoplay
				// without a fresh user gesture.
				shouldAutoPlayRef.current = false;
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
			playIfRequested();
		} )();
		return () => {
			cancelled = true;
			hls?.destroy();
			video.pause();
			shouldAutoPlayRef.current = false;
		};
	}, [ isExpanded, embed.playlist ] );

	const accessibleLabel = embed.alt || String( translate( 'Bluesky video' ) );

	if ( isExpanded ) {
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

	const playLabel = String(
		translate( 'Play video: %(label)s', {
			args: { label: accessibleLabel },
			comment:
				'Accessible label for the play button overlaid on a Bluesky/Mastodon video thumbnail; %(label)s is the video alt text or a generic fallback.',
		} )
	);

	return (
		<button
			type="button"
			className="social-post-card-embed-video social-post-card-embed-video--thumbnail"
			style={ containerStyle }
			aria-label={ playLabel }
			onClick={ () => {
				shouldAutoPlayRef.current = true;
				setUserExpanded( true );
			} }
		>
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
		</button>
	);
}
