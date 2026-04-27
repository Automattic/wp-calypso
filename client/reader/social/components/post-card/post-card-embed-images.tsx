import clsx from 'clsx';
import type { AtmosphereEmbedImages } from '@automattic/api-core';

interface PostCardEmbedImagesProps {
	embed: AtmosphereEmbedImages;
}

export function PostCardEmbedImages( { embed }: PostCardEmbedImagesProps ) {
	const count = Math.min( embed.images.length, 4 );
	return (
		<div
			className={ clsx(
				'social-post-card-embed-images',
				`social-post-card-embed-images--count-${ count }`
			) }
		>
			{ embed.images.slice( 0, 4 ).map( ( image ) => (
				<a
					key={ image.thumb }
					className="social-post-card-embed-images__item"
					href={ image.fullsize }
					target="_blank"
					rel="noopener noreferrer"
					style={
						image.aspect_ratio
							? {
									aspectRatio: `${ image.aspect_ratio.width } / ${ image.aspect_ratio.height }`,
							  }
							: undefined
					}
				>
					<img src={ image.thumb } alt={ image.alt } loading="lazy" />
				</a>
			) ) }
		</div>
	);
}
