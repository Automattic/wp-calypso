import type { SocialEmbedAudio } from '../../types';

interface Props {
	embed: SocialEmbedAudio;
}

export function PostCardEmbedAudio( { embed }: Props ) {
	return (
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
