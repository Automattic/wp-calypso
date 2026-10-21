import type { SocialEmbedAudio } from '../../types';

interface Props {
	embed: SocialEmbedAudio;
}

export function PostCardEmbedAudio( { embed }: Props ) {
	// `aria-label=""` is invalid; omit when alt is empty so the element
	// has no accessible name rather than a broken empty one.
	const labelProps = embed.alt ? { 'aria-label': embed.alt } : {};
	return (
		// Mastodon audio attachments don't carry caption tracks, so a
		// <track kind="captions"> is impossible here. The alt text is
		// surfaced via aria-label as the next-best accessible name.
		// eslint-disable-next-line jsx-a11y/media-has-caption
		<audio
			className="social-post-card-embed-audio"
			src={ embed.src }
			controls
			preload="metadata"
			{ ...labelProps }
		/>
	);
}
