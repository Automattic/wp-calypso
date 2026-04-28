import { ImageCarousel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import type { AtmosphereEmbedImages } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PostCardEmbedImagesProps {
	embed: AtmosphereEmbedImages;
	// When true, image cells render as inert <div>s instead of clickable
	// buttons. Used inside a compact (quote-embed) card so the outer quote
	// anchor doesn't get nested-interactive markup. The whole quoted post
	// remains clickable as a single unit via the outer anchor.
	compact?: boolean;
}

export function PostCardEmbedImages( { embed, compact }: PostCardEmbedImagesProps ) {
	const translate = useTranslate();
	const [ openIndex, setOpenIndex ] = useState< number | null >( null );

	const carouselImages = useMemo(
		() =>
			embed.images.map( ( image ) => ( {
				src: image.fullsize,
				alt: image.alt,
			} ) ),
		[ embed.images ]
	);

	const count = Math.min( embed.images.length, 4 );
	const isSingle = count === 1;

	return (
		<>
			<div
				className={ clsx(
					'social-post-card-embed-images',
					`social-post-card-embed-images--count-${ count }`
				) }
			>
				{ embed.images.slice( 0, 4 ).map( ( image, index ) => {
					const cellStyle =
						isSingle && image.aspect_ratio
							? {
									aspectRatio: `${ image.aspect_ratio.width } / ${ image.aspect_ratio.height }`,
							  }
							: undefined;
					const cellClassName = 'social-post-card-embed-images__item';
					const cellContent: ReactNode = (
						<img src={ image.thumb } alt={ image.alt } loading="lazy" />
					);

					if ( compact ) {
						return (
							<div key={ image.thumb } className={ cellClassName } style={ cellStyle }>
								{ cellContent }
							</div>
						);
					}

					return (
						<button
							key={ image.thumb }
							type="button"
							className={ cellClassName }
							style={ cellStyle }
							aria-label={ translate( 'View image %(index)d of %(count)d', {
								args: { index: index + 1, count: embed.images.length },
								comment:
									'Accessible label for opening a Bluesky post image in the full-size carousel.',
							} ) }
							onClick={ () => setOpenIndex( index ) }
						>
							{ cellContent }
						</button>
					);
				} ) }
			</div>
			{ openIndex !== null && (
				<ImageCarousel
					images={ carouselImages }
					initialIndex={ openIndex }
					onClose={ () => setOpenIndex( null ) }
				/>
			) }
		</>
	);
}
