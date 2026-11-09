import { POCKETCAST_DEFAULT_HEIGHT, POCKETCAST_DEFAULT_WIDTH } from '@automattic/api-core';
import { readerThumbnailQuery } from '@automattic/api-queries';
import { getUrlParts } from '@automattic/calypso-url';
import { useQuery } from '@tanstack/react-query';
import { throttle } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';
import playIconImage from 'calypso/assets/images/reader/play-icon.webp';
import readerPocketCastImage from 'calypso/assets/images/reader/reader-pocket-cast.svg';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import getEmbedMetadata from 'calypso/lib/get-video-id';
import {
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
} from 'calypso/reader/data/post/sizes';
import EmbedHelper from 'calypso/reader/embed-helper';

import './style.scss';

interface VideoEmbed {
	src?: string;
	type?: string;
	mediaType?: string;
	iframe?: string;
	width?: number | string;
	height?: number | string;
	aspectRatio?: number;
}

interface ReaderFeaturedVideoProps {
	videoEmbed: VideoEmbed;
	iframe?: string;
	autoplayIframe?: string;
	allowPlaying?: boolean;
	onThumbnailClick?: () => void;
	className?: string;
	href?: string;
	isExpanded?: boolean;
	isCompactPost?: boolean;
	hasExcerpt?: boolean;
}

function normalizeEmbedDimensions( embed: VideoEmbed ): VideoEmbed {
	if ( embed.width === 0 && embed.height === 0 ) {
		return {
			...embed,
			width: READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
			height: READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
			aspectRatio:
				READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH /
				READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
		};
	}
	return embed;
}

function getEmbedHtml( html: string | undefined ) {
	return html
		? new DOMParser().parseFromString( html, 'text/html' ).body.firstElementChild?.outerHTML
		: undefined;
}

export default function ReaderFeaturedVideo( {
	videoEmbed,
	iframe,
	autoplayIframe,
	allowPlaying = true,
	onThumbnailClick,
	className = '',
	href,
	isExpanded,
	isCompactPost,
	hasExcerpt,
}: ReaderFeaturedVideoProps ) {
	const { __ } = useI18n();
	const videoEmbedRef = useRef< HTMLDivElement >( null );
	const embed = useMemo( () => normalizeEmbedDimensions( videoEmbed ), [ videoEmbed ] );
	const { service, id } = ( embed.src && getEmbedMetadata( embed.src ) ) || {};
	const { data: fetchedThumbnailUrl, isSuccess } = useQuery( readerThumbnailQuery( service, id ) );
	let thumbnailUrl = fetchedThumbnailUrl;
	// Only apply the placeholder once the query has settled successfully.
	if ( embed.type === 'pocketcasts' && isSuccess && ! thumbnailUrl ) {
		thumbnailUrl = `${ readerPocketCastImage }?w=${ POCKETCAST_DEFAULT_WIDTH }&h=${ POCKETCAST_DEFAULT_HEIGHT }`;
	}

	const rawHtml = thumbnailUrl ? autoplayIframe : iframe;
	const html = useMemo( () => getEmbedHtml( rawHtml ), [ rawHtml ] );
	const videoMarkup = useMemo( () => ( { __html: html ?? '' } ), [ html ] );
	const resizeVideo = useMemo(
		() =>
			throttle( () => {
				const container = videoEmbedRef.current;
				const player = container?.querySelector( 'iframe' );
				if ( ! container || ! player ) {
					return;
				}
				const availableWidth = container.parentElement?.parentElement?.offsetWidth;
				const getEmbedSize = EmbedHelper.getEmbedSizingFunction( embed );
				Object.assign( player.style, {
					...getEmbedSize( availableWidth ),
					borderRadius: '6px',
				} );
			}, 100 ),
		[ embed ]
	);

	useEffect( () => {
		resizeVideo();
	} );

	useEffect( () => {
		if ( allowPlaying ) {
			window.addEventListener( 'resize', resizeVideo );
		}
		return () => {
			window.removeEventListener( 'resize', resizeVideo );
			resizeVideo.cancel();
		};
	}, [ allowPlaying, resizeVideo ] );

	const classNames = clsx( className, 'reader-featured-video', {
		'is-pocketcasts': embed.type === 'pocketcasts',
	} );

	if ( ! isExpanded && thumbnailUrl ) {
		let imageWidth = embed.width;
		let imageHeight = embed.height;
		if ( embed.type === 'pocketcasts' ) {
			const { searchParams } = getUrlParts( thumbnailUrl );
			imageWidth = searchParams.get( 'w' ) ?? undefined;
			imageHeight = searchParams.get( 'h' ) ?? undefined;
		}

		return (
			<ReaderFeaturedImage
				canonicalMedia={ embed }
				imageUrl={ thumbnailUrl }
				onClick={ ( event: React.MouseEvent< HTMLAnchorElement > ) => {
					if ( allowPlaying ) {
						event.preventDefault();
						onThumbnailClick?.();
					}
				} }
				className={ classNames }
				href={ href }
				fetched
				isCompactPost={ isCompactPost }
				hasExcerpt={ hasExcerpt }
				imageWidth={ imageWidth }
				imageHeight={ imageHeight }
			>
				{ allowPlaying && (
					<img
						className="reader-featured-video__play-icon"
						src={ playIconImage }
						title={ __( 'Play Video' ) }
						alt={ __( 'Play button' ) }
					/>
				) }
			</ReaderFeaturedImage>
		);
	}

	return (
		<div className={ classNames }>
			{ thumbnailUrl && (
				<div
					ref={ videoEmbedRef }
					className="reader-featured-video__video"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ videoMarkup }
				/>
			) }
		</div>
	);
}
