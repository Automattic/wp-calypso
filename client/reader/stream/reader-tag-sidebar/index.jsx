import { useTranslate } from 'i18n-calypso';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';
import { useRelatedMetaByTag } from 'calypso/data/reader/use-related-meta-by-tag';
import ReaderListFollowingItem from 'calypso/reader/stream/reader-list-followed-sites/item';
import '../style.scss';

const ReaderTagSidebar = ( { tag } ) => {
	const translate = useTranslate();
	const relatedMetaByTag = useRelatedMetaByTag( tag );
	if ( relatedMetaByTag === undefined ) {
		return null;
	}

	const tagLinks = relatedMetaByTag.data?.related_tags
		.sort( ( a, b ) => b.score - a.score )
		.map( ( relatedTag ) => <TagLink tag={ relatedTag } key={ relatedTag.slug } /> );

	const relatedSitesLinks =
		relatedMetaByTag.data?.related_sites && relatedMetaByTag.data.related_sites.length > 0
			? relatedMetaByTag.data.related_sites.map( ( relatedSite ) => (
					<ReaderListFollowingItem key={ relatedSite.feed_ID } site={ relatedSite } path="/" />
			  ) )
			: null;

	return (
		<>
			{ tagLinks && (
				<div className="reader-tag-sidebar-related-tags">
					<h2>{ translate( 'Related Tags' ) }</h2>
					<div className="reader-post-card__tags">{ tagLinks }</div>
					<a className="reader-tag-sidebar-related-tags__link" href="/tags">
						{ translate( 'See all tags' ) }
					</a>
				</div>
			) }
			{ relatedSitesLinks && (
				<div className="reader-tag-sidebar-related-sites">
					<h2>{ translate( 'Related Sites' ) }</h2>
					{ relatedSitesLinks }
				</div>
			) }
		</>
	);
};

export default ReaderTagSidebar;
