import { useTranslate } from 'i18n-calypso';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';
import { useRelatedMetaByTag } from 'calypso/data/reader/use-related-meta-by-tag';
import formatNumberCompact from 'calypso/lib/format-number-compact';
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
			{ relatedMetaByTag.data?.total_post_count > 0 && (
				<div className="reader-tag-sidebar-totals">
					<ul>
						<li>
							<span className="reader-tag-sidebar__count">
								{ formatNumberCompact( relatedMetaByTag.data.total_post_count ) }
							</span>
							<span className="reader-tag-sidebar__title">{ translate( 'Posts' ) }</span>
						</li>
					</ul>
				</div>
			) }
			{ tagLinks && (
				<div className="reader-tag-sidebar-related-tags">
					<h1>{ translate( 'Related Tags' ) }</h1>
					{ tagLinks }
					<a href="/tags">{ translate( 'See all tags' ) }</a>
				</div>
			) }
			{ relatedSitesLinks && (
				<div className="reader-tag-sidebar-related-sites">
					<h1>{ translate( 'Related Sites' ) }</h1>
					{ relatedSitesLinks }
				</div>
			) }
		</>
	);
};

export default ReaderTagSidebar;
