import { useReducedMotion } from '@wordpress/compose';
import type { SocialEmbedGifv } from '../../types';

interface Props {
	embed: SocialEmbedGifv;
}

export function PostCardEmbedGifv( { embed }: Props ) {
	const reduceMotion = useReducedMotion();
	const aspectStyle = embed.aspect_ratio
		? { aspectRatio: `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }` }
		: undefined;

	// `aria-label=""` is invalid; omit when alt is empty so the element
	// has no accessible name rather than a broken empty one.
	const labelProps = embed.alt ? { 'aria-label': embed.alt } : {};

	if ( reduceMotion ) {
		// Honour prefers-reduced-motion: render a static poster + native
		// controls instead of an autoplay loop. The user can still
		// initiate playback if they want.
		return (
			// eslint-disable-next-line jsx-a11y/media-has-caption -- Mastodon gifvs are silent loops with no caption tracks.
			<video
				className="social-post-card-embed-gifv"
				src={ embed.src }
				poster={ embed.thumbnail }
				controls
				preload="metadata"
				style={ aspectStyle }
				{ ...labelProps }
			/>
		);
	}

	return (
		// eslint-disable-next-line jsx-a11y/media-has-caption -- Mastodon gifvs are silent loops with no caption tracks.
		<video
			className="social-post-card-embed-gifv"
			src={ embed.src }
			poster={ embed.thumbnail }
			autoPlay
			muted
			loop
			playsInline
			preload="metadata"
			style={ aspectStyle }
			{ ...labelProps }
		/>
	);
}
