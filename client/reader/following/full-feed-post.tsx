import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import ContentProcessor from 'calypso/blocks/reader-full-post/content-processor';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { getPostUrl } from 'calypso/reader/route';
import { getPostTitleFallback, showFullPost } from 'calypso/reader/utils';
import { useSelector } from 'calypso/state';
import { isCommentsApiDisabled } from 'calypso/state/comments/selectors/get-comments-api-disabled';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { TrackPostData } from 'calypso/state/reader/analytics/types';

const COLLAPSED_CONTENT_HEIGHT = 900;
const FLOATING_COLLAPSE_MAX_VIEWPORT_INSET = 96;
const FLOATING_COLLAPSE_VIEWPORT_INSET_RATIO = 0.08;
const FLOATING_COLLAPSE_TITLE_LENGTH = 36;

type ReaderFullFeedPost = Partial< TrackPostData > & {
	author?: {
		display_name?: string;
		login?: string;
		name?: string;
		nice_name?: string;
	};
	content?: string;
	date?: string;
	global_ID?: string;
	site_name?: string;
	title?: string;
	URL?: string;
};

function getAuthorName( post: ReaderFullFeedPost ): string | undefined {
	return (
		post.author?.name || post.author?.display_name || post.author?.nice_name || post.author?.login
	);
}

function getPostTrackingProps( post: ReaderFullFeedPost ) {
	return {
		blog_id: post.site_ID,
		feed_id: post.feed_ID,
		feed_item_id: post.feed_item_ID,
		post_id: post.ID,
	};
}

function getShortTitle( title: string ) {
	if ( title.length <= FLOATING_COLLAPSE_TITLE_LENGTH ) {
		return title;
	}

	return `${ title.slice( 0, FLOATING_COLLAPSE_TITLE_LENGTH - 3 ) }...`;
}

function findScrollableContainer( node: HTMLElement | null ): HTMLElement | null {
	let element = node?.parentElement ?? null;

	while ( element && element !== document.body ) {
		const style = window.getComputedStyle( element );
		const overflowY = style.overflowY || style.overflow;

		if (
			element.scrollHeight > element.clientHeight &&
			[ 'auto', 'scroll' ].includes( overflowY )
		) {
			return element;
		}

		element = element.parentElement;
	}

	return null;
}

export type { ReaderFullFeedPost };

export function FullFeedPost( { post }: { post: ReaderFullFeedPost } ) {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const commentsApiDisabled = useSelector(
		( state ) =>
			!! post.site_ID && ! post.is_external && isCommentsApiDisabled( state, post.site_ID )
	);
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isExpandable, setIsExpandable ] = useState( false );
	const [ isFloatingCollapseVisible, setIsFloatingCollapseVisible ] = useState( false );
	const [ floatingCollapseLeft, setFloatingCollapseLeft ] = useState< number | null >( null );
	const articleElementRef = useRef< HTMLElement | null >( null );
	const contentElementRef = useRef< HTMLDivElement | null >( null );
	const expandActionsElementRef = useRef< HTMLDivElement | null >( null );
	const shouldScrollToCollapsedActionsRef = useRef( false );

	const postUrl = getPostUrl( post );
	const title = getPostTitleFallback(
		{
			title: post.title ?? '',
			excerpt: '',
			content: post.content ?? '',
		},
		translate( 'Untitled post' )
	);
	const authorName = getAuthorName( post );
	const postDate = post.date
		? new Intl.DateTimeFormat( undefined, { dateStyle: 'medium' } ).format( new Date( post.date ) )
		: null;
	const titleId = `full-feed-post-${ post.feed_ID || post.site_ID }-${
		post.feed_item_ID || post.ID
	}`;

	const measureContent = useCallback( () => {
		const contentElement = contentElementRef.current;
		if ( ! contentElement ) {
			return;
		}

		const nextIsExpandable = contentElement.scrollHeight > COLLAPSED_CONTENT_HEIGHT;
		setIsExpandable( nextIsExpandable );

		if ( ! nextIsExpandable ) {
			setIsExpanded( false );
		}
	}, [] );

	const postRef = useCallback( ( node: HTMLElement | null ) => {
		articleElementRef.current = node;
	}, [] );

	useEffect( () => {
		measureContent();

		const animationFrameId =
			typeof window.requestAnimationFrame === 'function'
				? window.requestAnimationFrame( measureContent )
				: null;
		const contentElement = contentElementRef.current;
		const resizeObserver =
			typeof ResizeObserver !== 'undefined' && contentElement
				? new ResizeObserver( measureContent )
				: null;

		window.addEventListener( 'resize', measureContent );
		if ( resizeObserver && contentElement ) {
			resizeObserver.observe( contentElement );
		}

		return () => {
			if ( animationFrameId !== null ) {
				window.cancelAnimationFrame( animationFrameId );
			}
			window.removeEventListener( 'resize', measureContent );
			resizeObserver?.disconnect();
		};
	}, [ measureContent, post.content ] );

	const updateFloatingCollapseVisibility = useCallback( () => {
		const articleElement = articleElementRef.current;
		const contentElement = contentElementRef.current;
		const expandActionsElement = expandActionsElementRef.current;
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
		const articleRect = articleElement?.getBoundingClientRect();
		const contentRect = contentElement?.getBoundingClientRect();
		const expandActionsRect = expandActionsElement?.getBoundingClientRect();
		const viewportInset = Math.min(
			FLOATING_COLLAPSE_MAX_VIEWPORT_INSET,
			viewportHeight * FLOATING_COLLAPSE_VIEWPORT_INSET_RATIO
		);
		const isContentVisible =
			!! contentRect &&
			contentRect.top < viewportHeight - viewportInset &&
			contentRect.bottom > viewportInset;
		const isInlineCollapseInViewport =
			!! expandActionsRect &&
			expandActionsRect.top < viewportHeight &&
			expandActionsRect.bottom > 0;
		const nextIsVisible = isContentVisible && ! isInlineCollapseInViewport;
		const nextLeft = articleRect ? Math.round( articleRect.left + articleRect.width / 2 ) : null;

		setIsFloatingCollapseVisible( ( currentIsVisible ) =>
			currentIsVisible === nextIsVisible ? currentIsVisible : nextIsVisible
		);
		setFloatingCollapseLeft( ( currentLeft ) =>
			currentLeft === nextLeft ? currentLeft : nextLeft
		);
	}, [] );

	useEffect( () => {
		if ( ! isExpanded || ! isExpandable ) {
			setIsFloatingCollapseVisible( false );
			return;
		}

		updateFloatingCollapseVisibility();
		const scrollableContainer = findScrollableContainer( articleElementRef.current );
		const visibilityIntervalId = window.setInterval( updateFloatingCollapseVisibility, 150 );

		scrollableContainer?.addEventListener( 'scroll', updateFloatingCollapseVisibility );
		document.addEventListener( 'scroll', updateFloatingCollapseVisibility, true );
		window.addEventListener( 'resize', updateFloatingCollapseVisibility );

		return () => {
			window.clearInterval( visibilityIntervalId );
			scrollableContainer?.removeEventListener( 'scroll', updateFloatingCollapseVisibility );
			document.removeEventListener( 'scroll', updateFloatingCollapseVisibility, true );
			window.removeEventListener( 'resize', updateFloatingCollapseVisibility );
		};
	}, [ isExpandable, isExpanded, updateFloatingCollapseVisibility ] );

	const isContentCollapsed = isExpandable && ! isExpanded;

	const expandPost = useCallback( () => {
		setIsExpanded( true );
		recordReaderTracksEvent(
			'calypso_reader_full_feed_post_expanded',
			getPostTrackingProps( post ),
			{ post: post as TrackPostData }
		);
	}, [ post, recordReaderTracksEvent ] );

	const handleCommentClick = useCallback( () => {
		recordReaderTracksEvent(
			'calypso_reader_full_feed_comments_button_clicked',
			getPostTrackingProps( post ),
			{ post: post as TrackPostData }
		);
		showFullPost( { post, comments: true } );
	}, [ post, recordReaderTracksEvent ] );

	useEffect( () => {
		const contentElement = contentElementRef.current;
		if ( ! isContentCollapsed || ! contentElement ) {
			return;
		}

		const handleContentClick = ( event: globalThis.MouseEvent ) => {
			const selection = window.getSelection?.();
			const isSelectingText = !! selection?.toString();
			const target = event.target;
			const isInteractiveElement =
				target instanceof Element &&
				!! target.closest(
					'a, button, input, textarea, select, label, [role="button"], [contenteditable="true"], audio, video, iframe'
				);

			if ( isSelectingText || isInteractiveElement ) {
				return;
			}

			expandPost();
		};

		contentElement.addEventListener( 'click', handleContentClick );

		return () => contentElement.removeEventListener( 'click', handleContentClick );
	}, [ expandPost, isContentCollapsed ] );

	useEffect( () => {
		if ( isExpanded || ! shouldScrollToCollapsedActionsRef.current ) {
			return;
		}

		shouldScrollToCollapsedActionsRef.current = false;
		const expandActionsElement = expandActionsElementRef.current;
		expandActionsElement?.scrollIntoView?.( {
			behavior: 'smooth',
			block: 'center',
		} );
		expandActionsElement?.querySelector< HTMLButtonElement >( 'button' )?.focus( {
			preventScroll: true,
		} );
	}, [ isExpanded ] );

	const collapsePost = () => {
		shouldScrollToCollapsedActionsRef.current = true;
		setIsExpanded( false );
	};

	const floatingCollapseTitle = post.title ? getShortTitle( title ) : null;
	const floatingCollapseLabel = floatingCollapseTitle
		? translate( 'Collapse: %(title)s', { args: { title: floatingCollapseTitle } } )
		: translate( 'Collapse' );

	return (
		<article ref={ postRef } className="full-feed-post" aria-labelledby={ titleId }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<header className="full-feed-post__header">
							<h2 className="full-feed-post__title" id={ titleId }>
								<a href={ postUrl }>{ title }</a>
							</h2>
							<div className="full-feed-post__meta">
								{ post.site_name && <span>{ post.site_name }</span> }
								{ authorName && <span>{ authorName }</span> }
								{ post.date && (
									<a href={ postUrl }>
										<time dateTime={ post.date }>{ postDate }</time>
									</a>
								) }
							</div>
						</header>
						<div
							ref={ contentElementRef }
							className={ clsx( 'full-feed-post__content', {
								'is-collapsed': isContentCollapsed,
								'is-clickable': isContentCollapsed,
							} ) }
						>
							<ContentProcessor content={ post.content } />
							{ isContentCollapsed && <div className="full-feed-post__fade" /> }
						</div>
						{ isExpandable && (
							<div className="full-feed-post__expand-actions" ref={ expandActionsElementRef }>
								{ isExpanded ? (
									<Button variant="secondary" onClick={ collapsePost }>
										{ translate( 'Collapse' ) }
									</Button>
								) : (
									<Button variant="primary" onClick={ expandPost }>
										{ translate( 'Read more' ) }
									</Button>
								) }
							</div>
						) }
						<div className="full-feed-post__engagement">
							<ReaderPostActions
								post={ post }
								fullPost
								onCommentClick={ handleCommentClick }
								commentsApiDisabled={ commentsApiDisabled }
								className="full-feed-post__reader-actions"
								showFreshlyPressed={ false }
							/>
						</div>
						{ isFloatingCollapseVisible && (
							<div
								className="full-feed-post__floating-collapse"
								style={ floatingCollapseLeft !== null ? { left: floatingCollapseLeft } : undefined }
							>
								<Button variant="secondary" onClick={ collapsePost }>
									<span className="full-feed-post__floating-collapse-label">
										{ floatingCollapseLabel }
									</span>
								</Button>
							</div>
						) }
					</VStack>
				</CardBody>
			</Card>
		</article>
	);
}
