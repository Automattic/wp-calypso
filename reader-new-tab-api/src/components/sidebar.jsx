const NAV_ITEMS = [
	{ label: 'Search', icon: 'search' },
	{ label: 'Discover', icon: 'discover' },
	{ label: 'Likes', icon: 'likes' },
	{ label: 'Conversations', icon: 'conversations' },
	{ label: 'Lists', icon: 'lists' },
	{ label: 'Tags', icon: 'tags' },
];

function NavIcon( { type } ) {
	const icons = {
		search: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M21 21l-5.2-5.2M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		discover: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		likes: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		conversations: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		lists: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		tags: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
		recent: (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
			</svg>
		),
	};
	return icons[ type ] || null;
}

export function Sidebar() {
	return (
		<nav class="sidebar">
			<h1 class="sidebar__title">Reader</h1>

			<div class="sidebar__section">
				<a class="sidebar__item sidebar__item--parent" href="#">
					<NavIcon type="recent" />
					<span>Recent</span>
				</a>
				<a class="sidebar__item sidebar__item--child sidebar__item--active" href="#">
					<span>All</span>
				</a>
			</div>

			<div class="sidebar__section">
				{ NAV_ITEMS.map( ( item ) => (
					<a key={ item.label } class="sidebar__item" href="#">
						<NavIcon type={ item.icon } />
						<span>{ item.label }</span>
					</a>
				) ) }
			</div>
		</nav>
	);
}
