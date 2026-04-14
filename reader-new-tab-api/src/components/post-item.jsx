function timeAgo( dateString ) {
	const seconds = Math.floor( ( Date.now() - new Date( dateString ) ) / 1000 );
	const intervals = [
		{ label: 'y', seconds: 31536000 },
		{ label: 'mo', seconds: 2592000 },
		{ label: 'd', seconds: 86400 },
		{ label: 'h', seconds: 3600 },
		{ label: 'm', seconds: 60 },
	];
	for ( const interval of intervals ) {
		const count = Math.floor( seconds / interval.seconds );
		if ( count >= 1 ) {
			return `${ count }${ interval.label } ago`;
		}
	}
	return 'just now';
}

function stripHtml( html ) {
	const div = document.createElement( 'div' );
	div.innerHTML = html;
	return div.textContent || '';
}

function getFeaturedImage( post ) {
	if ( post.featured_image ) {
		return post.featured_image;
	}
	if ( post.post_thumbnail?.URL ) {
		return post.post_thumbnail.URL;
	}
	const attachments = post.attachments;
	if ( attachments ) {
		const first = Object.values( attachments )[ 0 ];
		if ( first?.URL && first?.mime_type?.startsWith( 'image/' ) ) {
			return first.URL;
		}
	}
	return null;
}

export function PostItem( { post } ) {
	const title = stripHtml( post.title || '' );
	const excerpt = stripHtml( post.excerpt || '' ).slice( 0, 200 );
	const siteName = post.site_name || 'Unknown site';
	const avatarUrl = post.author?.avatar_URL || '';
	const date = post.date ? timeAgo( post.date ) : '';
	const featuredImage = getFeaturedImage( post );
	const postUrl = post.URL || post.short_URL || '';
	const mshot = postUrl
		? `https://s0.wp.com/mshots/v1/${ encodeURIComponent( postUrl ) }?w=600&h=338`
		: null;
	const cardImage = featuredImage || mshot;
	const readerUrl =
		post.feed_ID && post.feed_item_ID
			? `https://wordpress.com/read/feeds/${ post.feed_ID }/posts/${ post.feed_item_ID }`
			: `https://wordpress.com/read/blogs/${ post.site_ID }/posts/${ post.ID }`;
	const likes = post.like_count || 0;
	const comments = post.discussion?.comment_count ?? post.comment_count ?? 0;

	return (
		<a
			class="post-card"
			href={ readerUrl }
			target="_blank"
			rel="noopener noreferrer"
			title="Open in Reader"
		>
			{ cardImage ? (
				<div
					class={ `post-card__image-wrapper${
						! featuredImage ? ' post-card__image-wrapper--mshot' : ''
					}` }
				>
					{ featuredImage && (
						<div class="post-card__image-bg" style={ { backgroundImage: `url(${ cardImage })` } } />
					) }
					<img class="post-card__image" src={ cardImage } alt="" loading="lazy" />
				</div>
			) : (
				<div class="post-card__image-wrapper post-card__image-wrapper--empty" />
			) }
			<div class="post-card__hover-overlay">
				<span class="post-card__hover-label">
					Open in Reader
					<svg
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</span>
			</div>
			<div class="post-card__body">
				{ title && <h3 class="post-card__title">{ title }</h3> }
				{ ! cardImage && excerpt && <p class="post-card__excerpt">{ excerpt }</p> }
				<div class="post-card__footer">
					<div class="post-card__source">
						{ avatarUrl ? (
							<img class="post-card__avatar" src={ avatarUrl } alt="" width="20" height="20" />
						) : (
							<div class="post-card__avatar post-card__avatar--placeholder" />
						) }
						<span class="post-card__site-name">{ siteName }</span>
						<span class="post-card__date">{ date }</span>
					</div>
					<div class="post-card__stats">
						<span class="post-card__stat">
							<svg viewBox="0 0 24 24" width="16" height="16">
								<path
									d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								/>
							</svg>
							{ likes }
						</span>
						<span class="post-card__stat">
							<svg viewBox="0 0 24 24" width="16" height="16">
								<path
									d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								/>
							</svg>
							{ comments }
						</span>
					</div>
				</div>
			</div>
		</a>
	);
}
