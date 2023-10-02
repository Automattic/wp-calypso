import { bumpStatWithPageView } from 'calypso/lib/analytics/mc';
import debug from './debug';

export function pageViewForPost(
	blogId: number | null,
	blogUrl: string | null,
	postId: number | null,
	isPrivate: boolean | null
): void {
	if ( ! blogId || ! blogUrl || ! postId ) {
		return;
	}

	const params = {
		ref: 'http://wordpress.com/',
		reader: 1,
		host: blogUrl.replace( /.*?:\/\//g, '' ),
		blog: blogId,
		post: postId,
		priv: isPrivate ? 1 : undefined,
	};

	debug( 'reader page view for post', params );
	bumpStatWithPageView( params );
}
