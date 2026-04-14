function NavIcon( { type } ) {
	const icons = {
		recent: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M11.998 5.09c-2.655 0-4.91 1.707-5.726 4.085H4.381v1.65h1.89c.816 2.378 3.072 4.085 5.727 4.085s4.91-1.707 5.726-4.085h1.895v-1.65h-1.895c-.816-2.378-3.071-4.085-5.726-4.085Zm0 1.5c2.14 0 3.91 1.51 4.34 3.518h-2.126l-1.217-2.105-.64-1.107-.639 1.107-1.73 2.995h-.574l-.655-1.135-.64-1.107-.638 1.107-1.016 1.76c.82-1.762 2.55-2.993 4.535-2.993v-.04Zm-4.344 5.168c-.044-.24-.074-.483-.09-.732l1.376-2.383.694 1.2.641 1.108.638-1.107 1.73-2.995h.574l1.164 2.013.641 1.108.638-1.107.52-.899c-.821 1.757-2.548 2.984-4.53 2.984-1.284 0-2.456-.45-3.38-1.196l-.016.005Z"
					fill="currentColor"
				/>
			</svg>
		),
		search: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M13.5 6C10.5 6 8 8.5 8 11.5c0 1.1.3 2.1.9 3l-3.4 3 1 1.1 3.4-2.9c1 .9 2.2 1.4 3.6 1.4 3 0 5.5-2.5 5.5-5.5S16.5 6 13.5 6zm0 9.5c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
					fill="currentColor"
				/>
			</svg>
		),
		discover: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
		),
		likes: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
		),
		conversations: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
		),
		lists: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		),
		tags: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
				<path
					d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
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
				<a
					class="sidebar__item sidebar__item--parent"
					href="https://wordpress.com/reader"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="recent" />
					<span>Recent</span>
				</a>
			</div>

			<div class="sidebar__section">
				<a
					class="sidebar__item"
					href="https://wordpress.com/reader/search"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="search" />
					<span>Search</span>
				</a>
				<a
					class="sidebar__item"
					href="https://wordpress.com/discover"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="discover" />
					<span>Discover</span>
				</a>
				<a
					class="sidebar__item"
					href="https://wordpress.com/activities/likes"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="likes" />
					<span>Likes</span>
				</a>
				<a
					class="sidebar__item"
					href="https://wordpress.com/reader/conversations"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="conversations" />
					<span>Conversations</span>
				</a>
			</div>

			<div class="sidebar__section">
				<a
					class="sidebar__item"
					href="https://wordpress.com/reader/list"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="lists" />
					<span>Lists</span>
				</a>
				<a
					class="sidebar__item"
					href="https://wordpress.com/reader/tags"
					target="_blank"
					rel="noopener noreferrer"
				>
					<NavIcon type="tags" />
					<span>Tags</span>
				</a>
			</div>
		</nav>
	);
}
