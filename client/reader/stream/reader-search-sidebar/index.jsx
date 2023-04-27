import { useTranslate } from 'i18n-calypso';
import ReaderListFollowingItem from 'calypso/reader/stream/reader-list-followed-sites/item';
import '../style.scss';

function unescape( str ) {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
}

// create function to transform item into a site object
const getSiteFromItem = ( item ) => {
	console.log( 'item', item );
	return {
		feed_ID: item.feed_ID,
		blog_ID: item.blogId,
		URL: item.feed_URL ?? item.url,
		name: unescape( item.site_name ),
		site_icon: item.site_icon ?? null,
		description: unescape( item.site_description ),
		last_updated: 0,
		unseen_count: 0,
	};
};

const ReaderSearchSidebar = ( { items } ) => {
	const translate = useTranslate();

	const sites = items.map( ( item ) => getSiteFromItem( item ) );
	console.log( 'sites', sites );

	const recommendedSitesLinks = sites.map( ( site ) => (
		<ReaderListFollowingItem key={ site.feed_ID } site={ site } path="/" />
	) );

	if ( ! recommendedSitesLinks.length ) {
		return null;
	}

	return (
		<div className="reader-tag-sidebar-recommended-sites">
			<h2>{ translate( 'Recommended Sites' ) }</h2>
			{ recommendedSitesLinks }
		</div>
	);
};

export default ReaderSearchSidebar;
