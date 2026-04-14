import { useEffect, useRef } from 'preact/hooks';
import { PostItem } from './post-item';

export function PostFeed( {
	posts,
	title,
	subtitle,
	onLoadMore,
	loadingMore,
	hasMore,
	layout,
	onLayoutChange,
} ) {
	const sentinelRef = useRef( null );
	const filtered = posts.filter( ( p ) => p.title && p.title.trim() );

	useEffect( () => {
		if ( ! sentinelRef.current || ! onLoadMore ) {
			return;
		}

		const observer = new IntersectionObserver(
			( entries ) => {
				if ( entries[ 0 ].isIntersecting && hasMore && ! loadingMore ) {
					onLoadMore();
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe( sentinelRef.current );

		return () => observer.disconnect();
	}, [ onLoadMore, hasMore, loadingMore ] );

	return (
		<div class="post-feed">
			<div class="post-feed__header">
				<div class="post-feed__header-top">
					<div>
						<h2 class="post-feed__title">{ title }</h2>
						{ subtitle && <p class="post-feed__subtitle">{ subtitle }</p> }
					</div>
					<div class="post-feed__layout-toggle">
						<button
							class={ `post-feed__layout-btn${
								layout === 'grid' ? ' post-feed__layout-btn--active' : ''
							}` }
							onClick={ () => onLayoutChange( 'grid' ) }
							aria-label="Grid layout"
							title="Grid"
						>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<rect x="3" y="3" width="7" height="7" rx="1" />
								<rect x="14" y="3" width="7" height="7" rx="1" />
								<rect x="3" y="14" width="7" height="7" rx="1" />
								<rect x="14" y="14" width="7" height="7" rx="1" />
							</svg>
						</button>
						<button
							class={ `post-feed__layout-btn${
								layout === 'list' ? ' post-feed__layout-btn--active' : ''
							}` }
							onClick={ () => onLayoutChange( 'list' ) }
							aria-label="List layout"
							title="List"
						>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<rect x="3" y="4" width="18" height="4" rx="1" />
								<rect x="3" y="10" width="18" height="4" rx="1" />
								<rect x="3" y="16" width="18" height="4" rx="1" />
							</svg>
						</button>
					</div>
				</div>
			</div>
			<div class={ `post-feed__grid${ layout === 'list' ? ' post-feed__grid--list' : '' }` }>
				{ filtered.map( ( post ) => (
					<PostItem key={ post.ID || post.URL } post={ post } />
				) ) }
			</div>
			{ hasMore && (
				<div ref={ sentinelRef } class="post-feed__sentinel">
					{ loadingMore && <div class="post-feed__loading-more">Loading more posts...</div> }
				</div>
			) }
		</div>
	);
}
