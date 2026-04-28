import type { SocialEmbedAudio } from '../../types';

interface Props {
	embed: SocialEmbedAudio;
}

export function PostCardEmbedAudio( { embed }: Props ) {
	return (
		// Mastodon audio attachments don't carry caption tracks, so a
		// <track kind="captions"> is impossible here. The alt text is
		// surfaced via aria-label as the next-best accessible name.
		// eslint-disable-next-line jsx-a11y/media-has-caption
		<audio
			className="social-post-card-embed-audio"
			src={ embed.src }
			aria-label={ embed.alt }
			controls
			preload="metadata"
		/>
	);
}
