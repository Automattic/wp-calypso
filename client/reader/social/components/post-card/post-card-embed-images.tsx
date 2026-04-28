import clsx from 'clsx';
import type { AtmosphereEmbedImages } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PostCardEmbedImagesProps {
	embed: AtmosphereEmbedImages;
	// When true, image cells render as inert <div>s instead of <a>s pointing
	// at fullsize. Used inside a compact (quote-embed) card so the outer
	// quote anchor doesn't get nested-<a> markup. The whole quoted post card
	// remains clickable as a single unit via the outer anchor.
	compact?: boolean;
}

export function PostCardEmbedImages( { embed, compact }: PostCardEmbedImagesProps ) {
	const count = Math.min( embed.images.length, 4 );
	const isSingle = count === 1;
	return (
		<div
			className={ clsx(
				'social-post-card-embed-images',
				`social-post-card-embed-images--count-${ count }`
			) }
		>
			{ embed.images.slice( 0, 4 ).map( ( image ) => {
				const cellStyle =
					isSingle && image.aspect_ratio
						? {
								aspectRatio: `${ image.aspect_ratio.width } / ${ image.aspect_ratio.height }`,
						  }
						: undefined;
				const cellClassName = 'social-post-card-embed-images__item';
				const cellContent: ReactNode = <img src={ image.thumb } alt={ image.alt } loading="lazy" />;

				if ( compact ) {
					return (
						<div key={ image.thumb } className={ cellClassName } style={ cellStyle }>
							{ cellContent }
						</div>
					);
				}

				return (
					<a
						key={ image.thumb }
						className={ cellClassName }
						href={ image.fullsize }
						target="_blank"
						rel="noopener noreferrer"
						// Only honour the per-image aspect ratio for single-image
						// embeds. Multi-image grids use uniform cells (set in CSS) so
						// the layout stays even when individual images differ in
						// shape. matching bsky.app's tile behaviour.
						style={ cellStyle }
					>
						{ cellContent }
					</a>
				);
			} ) }
		</div>
	);
}
