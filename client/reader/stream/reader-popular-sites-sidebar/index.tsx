import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import '../style.scss';

interface PopularSitesSidebarProps {
	followSource: string;
	items: PopularSiteItemProp[];
}

/**
 * Represents a popular site item which is passed as a prop to the ReaderPopularSitesSidebar component.
 */
interface PopularSiteItemProp {
	blogId: number;
	feed_ID: number;
	feed_URL: string;
	site_name: string;
	site_description: string;
	site_icon: string;
	url: string;
}

/**
 * Represents a popular site which is displayed in the ReaderPopularSitesSidebar component.
 */
interface ReaderPopularSite {
	blog_ID: number;
	description: string;
	feed_ID: number;
	name: string;
	site_icon: string;
	URL: string;
}

function unescape( str: string ): string {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

// create function to transform item into a site object
const getSiteFromItem = ( item: PopularSiteItemProp ): ReaderPopularSite | null => {
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
	};
};

const ReaderPopularSitesSidebar = ( props: PopularSitesSidebarProps ) => {
	const { followSource, items } = props;
	const sites = items
		.map( ( item ): ReaderPopularSite | null => getSiteFromItem( item ) )
		.filter( ( site ): site is ReaderPopularSite => site !== null );

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
			followSource={ followSource }
		/>
	) );

	if ( ! popularSitesLinks.length ) {
		return null;
	}

	return <div className="reader-tag-sidebar-recommended-sites">{ popularSitesLinks }</div>;
};

export default ReaderPopularSitesSidebar;
