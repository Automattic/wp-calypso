import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/reader/sites/actions';

function RecommendedBlogItem( { blog } ) {
	const dispatch = useDispatch();

	const { image, name, feed_URL: feedUrl, blog_ID: siteId } = blog.meta?.data?.feed || {};

	if ( siteId ) {
		dispatch( requestSite( siteId ) );
	}

	// The default feed image for sites with no icon is
	// awful for this case, treat it as no image to fallback
	// to the globe icon.
	const siteIcon = image?.includes( '/i/buttonw-com.png' ) ? null : image;

	return (
		<li className="gravatar-hovercard__recommended-blog-item">
			<ReaderAvatar
				isCompact
				siteIcon={ siteIcon }
				className="gravatar-hovercard__recommended-blog-site-icon"
			/>
			<p className="gravatar-hovercard__recommended-blog-site-name">{ name || feedUrl }</p>
			<ReaderFollowButton
				className="gravatar-hovercard__recommended-blog-subscribe-button"
				siteUrl={ feedUrl }
				followSource="gravatar-hovercard__recommended-blog-item"
				isButtonOnly
			/>
		</li>
	);
}

export default RecommendedBlogItem;
