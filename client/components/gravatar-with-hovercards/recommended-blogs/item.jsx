import page from '@automattic/calypso-router';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
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
			feedId: blog.feed_ID,
		};
	}
	const { image, name, feed_URL: feedUrl, blog_ID: siteId } = blog.meta?.data?.feed || {};
	return { image, name, feedUrl, siteId, feedId: blog.feed_ID };
};

function RecommendedBlogItem( { blog, classPrefix, compact = false, onLinkClick = () => {} } ) {
	const { image, name, feedUrl, siteId, feedId } = getBlogData( blog );

	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const siteIcon = site?.icon?.img || site?.icon?.ico || image;

	const linkUrl = feedId ? `/reader/feeds/${ feedId }` : feedUrl;

	const anchorProps = {
		href: linkUrl,
		onClick: ( e ) => {
			e.preventDefault();
			onLinkClick();
			page( linkUrl );
		},
	};

	return (
		<li className={ `${ classPrefix }__recommended-blog-item` }>
			{ /* Query the site not just for the icon, but to ensure it is properly loaded in follows state.
				One example being mapped domains: initial follows state may list by wpcom subdomain, and
				the url here might be of a mapped domain. The site request success also updates follows
				state, and can bridge the gap to appropriately determine if a site from this list is
				followed.
			*/ }
			<QueryReaderSite siteId={ siteId } />

			<a { ...anchorProps }>
				<ReaderAvatar
					isCompact={ compact }
					siteIcon={ siteIcon }
					iconSize={ 30 }
					className={ `${ classPrefix }__recommended-blog-site-icon` }
				/>
			</a>
			<AutoDirection>
				<div className={ `${ classPrefix }__recommended-blog-site-info` }>
					<a { ...anchorProps }>
						<h6 className={ `${ classPrefix }__recommended-blog-site-name` }>
							{ name || feedUrl }
						</h6>
					</a>
					{ ! compact && site?.description && (
						<p className={ `${ classPrefix }__recommended-blog-site-description` }>
							{ site.description }
						</p>
					) }
				</div>
			</AutoDirection>

			<ReaderFollowButton
				className={ `${ classPrefix }__recommended-blog-subscribe-button` }
				siteUrl={ feedUrl }
				followSource={ `${ classPrefix }__recommended-blog-item` }
				isButtonOnly={ compact }
			/>
		</li>
	);
}

export default RecommendedBlogItem;
