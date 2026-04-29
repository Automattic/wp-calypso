import { ImageCarousel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SocialEmbedImages } from '../../types';
import type { ReactNode } from 'react';

interface PostCardEmbedImagesProps {
	embed: SocialEmbedImages;
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

					const ariaLabel = image.alt
						? ( translate( 'View image: %(alt)s', {
								args: { alt: image.alt },
								comment:
									'Accessible label for opening a Bluesky post image in the full-size carousel; uses the per-image alt text.',
						  } ) as string )
						: ( translate( 'View image %(index)d of %(count)d', {
								args: { index: index + 1, count: embed.images.length },
								comment:
									'Accessible label fallback for opening a Bluesky post image in the full-size carousel when no alt text is available.',
						  } ) as string );
					return (
						<button
							key={ image.thumb }
							type="button"
							className={ cellClassName }
							style={ cellStyle }
							aria-label={ ariaLabel }
							onClick={ () => setOpenIndex( index ) }
						>
							{ cellContent }
						</button>
					);
				} ) }
			</div>
			{ openIndex !== null &&
				// Portal to <body>: position: fixed is broken by transformed/contain ancestors elsewhere on the page.
				createPortal(
					<ImageCarousel
						images={ carouselImages }
						initialIndex={ openIndex }
						onClose={ () => setOpenIndex( null ) }
					/>,
					document.body
				) }
		</>
	);
}
