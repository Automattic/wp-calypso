import ReaderAvatar from 'calypso/blocks/reader-avatar';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/reader/sites/selectors';

// A blog from a list may have either a site or feed object, and the data is structured in different
// property names. This function normalizes the data to a consistent format.
const getBlogData = ( blog ) => {
	if ( blog.meta?.data?.site ) {
		const { name, feed_URL: feedUrl, ID: siteId, icon } = blog.meta.data.site;
		return {
			image: icon?.img || icon?.ico,
			name,
			feedUrl,
			siteId,
		};
	}
	const { image, name, feed_URL: feedUrl, blog_ID: siteId } = blog.meta?.data?.feed || {};
	return { image, name, feedUrl, siteId };
};

function RecommendedBlogItem( { blog } ) {
	const { image, name, feedUrl, siteId } = getBlogData( blog );

	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const siteIcon = site?.icon?.img || site?.icon?.ico || image;

	return (
		<li className="gravatar-hovercard__recommended-blog-item">
			{ /* Query the site not just for the icon, but to ensure it is properly loaded in follows state.
				One example being mapped domains: initial follows state may list by wpcom subdomain, and
				the url here might be of a mapped domain. The site request success also updates follows
				state, and can bridge the gap to appropriately determine if a site from this list is
				followed.
			*/ }
			<QueryReaderSite siteId={ siteId } />
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
