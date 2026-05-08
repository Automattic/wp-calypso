import { EmbedContainer } from '@automattic/components';
import { useEffect, useRef } from 'react';
import ReaderFullPostFeaturedImage from 'calypso/blocks/reader-full-post/featured-image';
import WPiFrameResize from 'calypso/blocks/reader-full-post/wp-iframe-resize';
import AutoDirection from 'calypso/components/auto-direction';
import PostExcerpt from 'calypso/components/post-excerpt';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import PostExcerptLink from 'calypso/reader/post-excerpt-link';
import ContentProcessor from './content-processor';

import './style.scss';

type ReaderFullPostContentShellPost = {
	better_excerpt?: string;
	content?: string;
	excerpt?: string;
	featured_image?: string;
	URL?: string;
	use_excerpt?: boolean;
};

interface ReaderFullPostContentShellProps {
	isActive?: boolean;
	maxWidth: number;
	post: ReaderFullPostContentShellPost;
	siteName?: string;
}

export function ReaderFullPostContentShell( {
	isActive = true,
	maxWidth,
	post,
	siteName,
}: ReaderFullPostContentShellProps ) {
	const postContentWrapper = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		if ( ! isActive || post.use_excerpt ) {
			return;
		}

		const stopResize = postContentWrapper.current && WPiFrameResize( postContentWrapper.current );

		return () => stopResize?.();
	}, [ isActive, post.content, post.use_excerpt ] );

	if ( ! isActive ) {
		return <div className="reader-full-post__story-content-container" aria-hidden="true" />;
	}

	const featuredImage = post.featured_image && ! isFeaturedImageInContent( post ) && (
		<ReaderFullPostFeaturedImage post={ post } maxWidth={ maxWidth } />
	);

	if ( post.use_excerpt ) {
		return (
			<>
				{ featuredImage }
				<PostExcerpt content={ post.better_excerpt ? post.better_excerpt : post.excerpt } />
				<PostExcerptLink siteName={ siteName } postUrl={ post.URL } />
			</>
		);
	}

	return (
		<>
			{ featuredImage }
			<EmbedContainer>
				<AutoDirection>
					<div ref={ postContentWrapper } className="reader-full-post__story-content-container">
						<ContentProcessor content={ post.content } />
					</div>
				</AutoDirection>
			</EmbedContainer>
		</>
	);
}
