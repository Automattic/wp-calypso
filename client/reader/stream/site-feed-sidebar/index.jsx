import { formatNumberCompact } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderFeedHeaderFollow from 'calypso/blocks/reader-feed-header/follow';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import '../style.scss';

const FeedStreamSidebar = ( {
	feed,
	followerCount,
	postCount,
	showFollow,
	site,
	streamKey,
	tags,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleTagSidebarClick = ( tag ) => {
		recordAction( 'clicked_reader_sidebar_tag' );
		recordGaEvent( 'Clicked Reader Sidebar Tag' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_tag_clicked', {
				tag: decodeURIComponent( tag.slug ),
			} )
		);
	};

	const trackTagsPageLinkClick = () => {
		recordAction( 'clicked_reader_sidebar_tags_page_link' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_tags_page_link_clicked' ) );
	};

	return (
		<>
			<div className="reader-feed-header__follow">
				{ showFollow && (
					<ReaderFeedHeaderFollow feed={ feed } site={ site } streamKey={ streamKey } />
				) }
			</div>
			{ ( postCount || followerCount ) && (
				<div className="reader-tag-sidebar-stats">
					{ postCount && (
						<div className="reader-tag-sidebar-stats__item">
							<span className="reader-tag-sidebar-stats__count">
								{ formatNumberCompact( postCount ) }
							</span>
							<span className="reader-tag-sidebar-stats__title">
								{ translate( 'Post', 'Posts', { count: postCount } ) }
							</span>
						</div>
					) }
					{ followerCount && (
						<div className="reader-tag-sidebar-stats__item">
							<span className="reader-tag-sidebar-stats__count">
								{ formatNumberCompact( followerCount ) }
							</span>
							<span className="reader-tag-sidebar-stats__title">
								{ translate( 'Subscriber', 'Subscribers', { count: followerCount } ) }
							</span>
						</div>
					) }
				</div>
			) }
			{ tags && tags.length > 0 && (
				<>
					<div className="reader-tag-sidebar-related-tags">
						<h2>{ translate( 'Tags' ) }</h2>
						<div className="reader-post-card__tags">
							{ tags.map( ( tag ) => (
								<TagLink tag={ tag } key={ tag.slug } onClick={ handleTagSidebarClick } />
							) ) }
						</div>
					</div>
					<a
						className="reader-tag-sidebar-tags-page"
						href="/tags"
						onClick={ trackTagsPageLinkClick }
					>
						{ translate( 'See all tags' ) }
					</a>
				</>
			) }
		</>
	);
};

export default FeedStreamSidebar;
