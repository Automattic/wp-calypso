import type { SocialEmbedGifv } from '../../types';

interface Props {
	embed: SocialEmbedGifv;
}

export function PostCardEmbedGifv( { embed }: Props ) {
	const aspectStyle = embed.aspect_ratio
		? { aspectRatio: `${ embed.aspect_ratio.width } / ${ embed.aspect_ratio.height }` }
		: undefined;
	return (
		<video
			className="social-post-card-embed-gifv"
			src={ embed.src }
			poster={ embed.thumbnail }
			aria-label={ embed.alt }
			autoPlay
			muted
			loop
			playsInline
			preload="metadata"
			style={ aspectStyle }
		/>
	);
}
