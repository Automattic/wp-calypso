import { useTranslate } from 'i18n-calypso';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { READER_SEARCH_POPULAR_SITES } from 'calypso/reader/follow-sources';
import '../style.scss';

function unescape( str ) {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

// create function to transform item into a site object
const getSiteFromItem = ( item ) => {
	if ( item.site_name === undefined || item.site_description === undefined ) {
		return null;
	}
	return {
		feed_ID: item.feed_ID,
		blog_ID: item.blogId,
		URL: item.feed_URL ?? item.url,
		name: unescape( item?.site_name ),
		site_icon: item.site_icon ?? null,
		description: unescape( item?.site_description ),
		last_updated: 0,
		unseen_count: 0,
	};
};

const ReaderSearchSidebar = ( { items } ) => {
	const translate = useTranslate();

	const sites = items
		.map( ( item ) => getSiteFromItem( item ) )
		.filter( ( site ) => site !== null );

	const popularSitesLinks = sites.map( ( site ) => (
		<ConnectedReaderSubscriptionListItem
			key={ site.feed_ID }
			feedId={ site.feed_ID }
			siteId={ site.blog_ID }
			site={ site }
			url={ site.URL }
			showLastUpdatedDate={ false }
			showNotificationSettings={ false }
			showFollowedOnDate={ false }
			followSource={ READER_SEARCH_POPULAR_SITES }
		/>
	) );

	if ( ! popularSitesLinks.length ) {
		return null;
	}

	return (
		<div className="reader-tag-sidebar-recommended-sites">
			<h2>{ translate( 'Popular Sites' ) }</h2>
			{ popularSitesLinks }
		</div>
	);
};

export default ReaderSearchSidebar;
