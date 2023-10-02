import { localeRegexString } from '@automattic/i18n-utils';

export function getLocation( path?: string ): string {
	if ( path === undefined || path === '' ) {
		return 'unknown';
	}
	if ( path === '/read' ) {
		return 'following';
	}
	if ( path.indexOf( '/read/a8c' ) === 0 ) {
		return 'following_a8c';
	}
	if ( path.indexOf( '/read/p2' ) === 0 ) {
		return 'following_p2';
	}
	if ( path.indexOf( '/tag/' ) === 0 ) {
		return 'topic_page';
	}
	if ( path.match( /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i ) ) {
		return 'single_post';
	}
	if ( path.match( /^\/read\/(blogs|feeds)\/([0-9]+)$/i ) ) {
		return 'blog_page';
	}
	if ( path.indexOf( '/read/list/' ) === 0 ) {
		return 'list';
	}
	if ( path.indexOf( '/activities/likes' ) === 0 ) {
		return 'postlike';
	}
	if ( path.indexOf( '/recommendations/mine' ) === 0 ) {
		return 'recommended_foryou';
	}
	if ( path.indexOf( '/following/edit' ) === 0 ) {
		return 'following_edit';
	}
	if ( path.indexOf( '/following/manage' ) === 0 ) {
		return 'following_manage';
	}
	if ( path.indexOf( '/discover' ) === 0 ) {
		const searchParams = new URLSearchParams( window.location.search );
		const selectedTab = searchParams.get( 'selectedTab' );
		if ( ! selectedTab || selectedTab === 'recommended' ) {
			return 'discover_recommended';
		} else if ( selectedTab === 'latest' ) {
			return 'discover_latest';
		} else if ( selectedTab === 'firstposts' ) {
			return 'discover_firstposts';
		}
		return `discover_tag:${ selectedTab }`;
	}
	if ( path.indexOf( '/read/recommendations/posts' ) === 0 ) {
		return 'recommended_posts';
	}
	if ( path.match( new RegExp( `^(/${ localeRegexString })?/read/search` ) ) ) {
		return 'search';
	}
	if ( path.indexOf( '/read/conversations/a8c' ) === 0 ) {
		return 'conversations_a8c';
	}
	if ( path.indexOf( '/read/conversations' ) === 0 ) {
		return 'conversations';
	}
	return 'unknown';
}
