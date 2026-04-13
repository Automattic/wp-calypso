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

export function PostItem( { post } ) {
	const excerpt = stripHtml( post.excerpt || post.title || '' ).slice( 0, 200 );
	const siteName = post.site_name || 'Unknown site';
	const authorName = post.author?.name || '';
	const avatarUrl = post.author?.avatar_URL || '';
	const date = post.date ? timeAgo( post.date ) : '';

	return (
		<a class="post-item" href={ post.URL } target="_blank" rel="noopener noreferrer">
			<div class="post-item__header">
				<div class="post-item__author">
					{ avatarUrl ? (
						<img class="post-item__avatar" src={ avatarUrl } alt="" width="36" height="36" />
					) : (
						<div class="post-item__avatar post-item__avatar--placeholder" />
					) }
					<div class="post-item__meta">
						<span class="post-item__site-name">{ siteName }</span>
						<span class="post-item__author-name">{ authorName }</span>
						<span class="post-item__date">{ date }</span>
					</div>
				</div>
				<button
					class="post-item__menu"
					onClick={ ( e ) => e.preventDefault() }
					aria-label="More options"
				>
					<svg viewBox="0 0 24 24" width="20" height="20">
						<circle cx="12" cy="5" r="1.5" fill="#646970" />
						<circle cx="12" cy="12" r="1.5" fill="#646970" />
						<circle cx="12" cy="19" r="1.5" fill="#646970" />
					</svg>
				</button>
			</div>
			<p class="post-item__excerpt">{ excerpt }</p>
			<div class="post-item__actions">
				<svg viewBox="0 0 24 24" width="20" height="20">
					<path
						d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
						fill="none"
						stroke="#646970"
						stroke-width="1.5"
					/>
				</svg>
				<svg viewBox="0 0 24 24" width="20" height="20">
					<path
						d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
						fill="none"
						stroke="#646970"
						stroke-width="1.5"
					/>
				</svg>
			</div>
		</a>
	);
}
