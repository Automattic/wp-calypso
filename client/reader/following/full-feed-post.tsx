import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ReaderFullPostContentShell } from 'calypso/blocks/reader-full-post/content-shell';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import readerContentWidth from 'calypso/reader/lib/content-width';
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
const CONTENT_OBSERVER_ROOT_MARGIN = '1200px 0px';

type ReaderFullFeedPost = Partial< TrackPostData > & {
	author?: {
		display_name?: string;
		login?: string;
		name?: string;
		nice_name?: string;
	};
	content?: string;
	date?: string;
	discussion?: {
		comment_count?: number;
		comments_open?: boolean;
	};
	global_ID?: string;
	is_error?: boolean;
	is_external?: boolean;
	is_jetpack?: boolean;
	is_reddit_post?: boolean;
	_seen?: boolean;
	better_excerpt?: string;
	excerpt?: string;
	featured_image?: string;
	site_name?: string;
	title?: string;
	URL?: string;
	use_excerpt?: boolean;
};

function getAuthorName( post: ReaderFullFeedPost ): string | undefined {
	return (
		post.author?.name || post.author?.display_name || post.author?.nice_name || post.author?.login
	);
}

function getPostTrackingProps( post: ReaderFullFeedPost ) {
	return {
		blog_id: ! post.is_external && post.site_ID && post.site_ID > 0 ? post.site_ID : undefined,
		feed_id: post.feed_ID && post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID && post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		post_id: ! post.is_external && post.ID && post.ID > 0 ? post.ID : undefined,
	};
}

function getShortTitle( title: string ) {
	if ( title.length <= FLOATING_COLLAPSE_TITLE_LENGTH ) {
		return title;
	}

	return `${ title.slice( 0, FLOATING_COLLAPSE_TITLE_LENGTH - 3 ) }...`;
}

function getFullFeedPostKey( post: ReaderFullFeedPost ) {
	if ( post.global_ID ) {
		return post.global_ID;
	}

	return `${ post.feed_ID || post.site_ID }-${ post.feed_item_ID || post.ID }`;
}

function getPostForFullPostNavigation( post: ReaderFullFeedPost ) {
	if ( post.feed_ID && ! post.feed_item_ID && post.ID ) {
		return {
			...post,
			feed_item_ID: post.ID,
		};
	}

	return post;
}

export type { ReaderFullFeedPost };

interface FullFeedPostProps {
	activeFloatingCollapsePostKey?: string | null;
	onFloatingCollapseChange?: ( postKey: string, isVisible: boolean ) => void;
	post: ReaderFullFeedPost;
	scrollContainer?: HTMLElement | null;
}

export function FullFeedPost( {
	activeFloatingCollapsePostKey = null,
	onFloatingCollapseChange,
	post,
	scrollContainer = null,
}: FullFeedPostProps ) {
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
	const [ inactiveContentHeight, setInactiveContentHeight ] = useState( COLLAPSED_CONTENT_HEIGHT );
	const [ isContentActive, setIsContentActive ] = useState(
		() => typeof IntersectionObserver === 'undefined'
	);
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
	const postKey = getFullFeedPostKey( post );
	const titleId = `full-feed-post-${ post.feed_ID || post.site_ID }-${
		post.feed_item_ID || post.ID
	}`;
	const contentId = `${ titleId }-content`;

	const measureContent = useCallback( () => {
		const contentElement = contentElementRef.current;
		if ( ! contentElement ) {
			return;
		}

		const measuredContentHeight = contentElement.scrollHeight;
		const nextIsExpandable = measuredContentHeight > COLLAPSED_CONTENT_HEIGHT;
		setInactiveContentHeight( Math.min( measuredContentHeight, COLLAPSED_CONTENT_HEIGHT ) );
		setIsExpandable( nextIsExpandable );

		if ( ! nextIsExpandable ) {
			setIsExpanded( false );
		}
	}, [] );

	const postRef = useCallback( ( node: HTMLElement | null ) => {
		articleElementRef.current = node;
	}, [] );

	useEffect( () => {
		if ( ! isContentActive ) {
			return;
		}

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
	}, [ isContentActive, measureContent, post.content ] );

	useEffect( () => {
		const articleElement = articleElementRef.current;
		if ( ! articleElement || typeof IntersectionObserver === 'undefined' ) {
			setIsContentActive( true );
			return;
		}

		const observer = new IntersectionObserver(
			( entries ) => {
				const [ entry ] = entries;
				setIsContentActive( isExpanded || !! entry?.isIntersecting );
			},
			{
				root: scrollContainer,
				rootMargin: CONTENT_OBSERVER_ROOT_MARGIN,
			}
		);

		observer.observe( articleElement );

		return () => observer.disconnect();
	}, [ isExpanded, scrollContainer ] );

	const updateFloatingCollapseVisibility = useCallback( () => {
		const articleElement = articleElementRef.current;
		const contentElement = contentElementRef.current;
		const expandActionsElement = expandActionsElementRef.current;
		const scrollRootRect = scrollContainer?.getBoundingClientRect();
		const viewportTop = scrollRootRect?.top ?? 0;
		const viewportBottom =
			scrollRootRect?.bottom ?? window.innerHeight ?? document.documentElement.clientHeight;
		const viewportHeight = viewportBottom - viewportTop;
		const articleRect = articleElement?.getBoundingClientRect();
		const contentRect = contentElement?.getBoundingClientRect();
		const expandActionsRect = expandActionsElement?.getBoundingClientRect();
		const viewportInset = Math.min(
			FLOATING_COLLAPSE_MAX_VIEWPORT_INSET,
			viewportHeight * FLOATING_COLLAPSE_VIEWPORT_INSET_RATIO
		);
		const isContentVisible =
			!! contentRect &&
			contentRect.top < viewportBottom - viewportInset &&
			contentRect.bottom > viewportTop + viewportInset;
		const isInlineCollapseInViewport =
			!! expandActionsRect &&
			expandActionsRect.top < viewportBottom &&
			expandActionsRect.bottom > viewportTop;
		const nextIsVisible = isContentVisible && ! isInlineCollapseInViewport;
		const nextLeft = articleRect ? Math.round( articleRect.left + articleRect.width / 2 ) : null;

		setIsFloatingCollapseVisible( ( currentIsVisible ) =>
			currentIsVisible === nextIsVisible ? currentIsVisible : nextIsVisible
		);
		setFloatingCollapseLeft( ( currentLeft ) =>
			currentLeft === nextLeft ? currentLeft : nextLeft
		);
		onFloatingCollapseChange?.( postKey, nextIsVisible );
	}, [ onFloatingCollapseChange, postKey, scrollContainer ] );

	useEffect( () => {
		if ( ! isExpanded || ! isExpandable ) {
			setIsFloatingCollapseVisible( false );
			onFloatingCollapseChange?.( postKey, false );
			return;
		}

		updateFloatingCollapseVisibility();
		let animationFrameId: number | null = null;
		const updateOnAnimationFrame = () => {
			if ( animationFrameId !== null ) {
				return;
			}
			animationFrameId = window.requestAnimationFrame( () => {
				animationFrameId = null;
				updateFloatingCollapseVisibility();
			} );
		};
		const scrollTarget = scrollContainer ?? window;

		scrollTarget.addEventListener( 'scroll', updateOnAnimationFrame );
		window.addEventListener( 'resize', updateOnAnimationFrame );

		return () => {
			if ( animationFrameId !== null ) {
				window.cancelAnimationFrame( animationFrameId );
			}
			scrollTarget.removeEventListener( 'scroll', updateOnAnimationFrame );
			window.removeEventListener( 'resize', updateOnAnimationFrame );
			onFloatingCollapseChange?.( postKey, false );
		};
	}, [
		isExpandable,
		isExpanded,
		onFloatingCollapseChange,
		postKey,
		scrollContainer,
		updateFloatingCollapseVisibility,
	] );

	const isContentCollapsed = isExpandable && ! isExpanded;

	const expandPost = useCallback( () => {
		setIsExpanded( true );
		recordReaderTracksEvent(
			'calypso_reader_full_feed_post_expanded',
			getPostTrackingProps( post )
		);
	}, [ post, recordReaderTracksEvent ] );

	const handleCommentClick = useCallback( () => {
		const postForNavigation = getPostForFullPostNavigation( post );

		recordReaderTracksEvent(
			'calypso_reader_full_feed_comments_button_clicked',
			getPostTrackingProps( post )
		);
		showFullPost( { post: postForNavigation, comments: true } );
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

	const shortTitle = getShortTitle( title );
	const floatingCollapseLabel = translate( 'Collapse: %(title)s', {
		args: { title: shortTitle },
	} );
	const fullPostContentClasses = {
		'reader-full-post': true,
		'is-reddit-post': post.is_reddit_post,
		[ `blog-${ post.site_ID }` ]: !! post.site_ID,
		[ `feed-${ post.feed_ID }` ]: !! post.feed_ID,
	};
	const isFloatingCollapseActive =
		( activeFloatingCollapsePostKey ?? postKey ) === postKey && isFloatingCollapseVisible;
	const floatingCollapse =
		isFloatingCollapseActive && typeof document !== 'undefined'
			? createPortal(
					<div
						className="full-feed-post__floating-collapse"
						style={
							floatingCollapseLeft !== null ? { insetInlineStart: floatingCollapseLeft } : undefined
						}
					>
						<Button
							variant="secondary"
							onClick={ collapsePost }
							aria-controls={ contentId }
							aria-expanded
						>
							<span className="full-feed-post__floating-collapse-label">
								{ floatingCollapseLabel }
							</span>
						</Button>
					</div>,
					document.body
			  )
			: null;

	return (
		<>
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
								id={ contentId }
								ref={ contentElementRef }
								className={ clsx( 'full-feed-post__content', fullPostContentClasses, {
									'is-collapsed': isContentCollapsed,
									'is-clickable': isContentCollapsed,
									'is-content-inactive': ! isContentActive,
								} ) }
								role={ isContentActive ? 'region' : undefined }
								aria-label={ isContentActive ? translate( 'Post content' ) : undefined }
								aria-hidden={ isContentActive ? undefined : true }
								style={
									{
										'--full-feed-post-preview-height': `${ COLLAPSED_CONTENT_HEIGHT }px`,
										'--full-feed-post-inactive-height': `${ inactiveContentHeight }px`,
									} as CSSProperties
								}
							>
								<ReaderFullPostContentShell
									isActive={ isContentActive }
									maxWidth={ readerContentWidth() }
									post={ post }
									siteName={ post.site_name }
								/>
								{ isContentCollapsed && <div className="full-feed-post__fade" /> }
							</div>
							{ isExpandable && (
								<div
									className="full-feed-post__expand-actions"
									ref={ expandActionsElementRef }
									role="group"
									aria-label={ translate( 'Post expansion controls' ) }
								>
									{ isExpanded ? (
										<Button
											variant="secondary"
											onClick={ collapsePost }
											aria-controls={ contentId }
											aria-expanded
											aria-label={ translate( 'Collapse: %(title)s', {
												args: { title: shortTitle },
											} ) }
										>
											{ translate( 'Collapse' ) }
										</Button>
									) : (
										<Button
											variant="primary"
											onClick={ expandPost }
											aria-controls={ contentId }
											aria-expanded={ false }
											aria-label={ translate( 'Read more: %(title)s', {
												args: { title: shortTitle },
											} ) }
										>
											{ translate( 'Read more' ) }
										</Button>
									) }
								</div>
							) }
							<div
								className="full-feed-post__engagement"
								role="group"
								aria-label={ translate( 'Actions for %(title)s', { args: { title } } ) }
							>
								<ReaderPostActions
									post={ post }
									onCommentClick={ handleCommentClick }
									commentsApiDisabled={ commentsApiDisabled }
									className="full-feed-post__reader-actions"
									likeContext="full-feed"
									markLikedPostSeen={ false }
									showFreshlyPressed={ false }
								/>
							</div>
						</VStack>
					</CardBody>
				</Card>
			</article>
			{ floatingCollapse }
		</>
	);
}
