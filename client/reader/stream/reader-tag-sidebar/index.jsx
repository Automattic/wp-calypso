import { Button } from '@automattic/components';
import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { connect, useDispatch, useSelector } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';
import { useBloggingPrompts } from 'calypso/data/blogging-prompt/use-blogging-prompts';
import { useRelatedMetaByTag } from 'calypso/data/reader/use-related-meta-by-tag';
import { useTagStats } from 'calypso/data/reader/use-tag-stats';
import formatNumberCompact from 'calypso/lib/format-number-compact';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import ReaderListFollowingItem from 'calypso/reader/stream/reader-list-followed-sites/item';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderTagBySlug } from 'calypso/state/reader/tags/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import '../style.scss';

const ReaderTagSidebar = ( {
	tag,
	showFollow,
	registerLastActionRequiresLogin: registerLastActionRequiresLoginProp,
} ) => {
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );
	const translate = useTranslate();
	const relatedMetaByTag = useRelatedMetaByTag( tag );
	const tagStats = useTagStats( tag );
	const dispatch = useDispatch();
	const isFollowing = useSelector( ( state ) => getReaderTagBySlug( state, tag )?.isFollowing );
	const isLoggedIn = useSelector( ( state ) => isUserLoggedIn( state ) );
	const { data: prompts } = useBloggingPrompts( primarySiteId, 10 );

	if ( relatedMetaByTag === undefined ) {
		return null;
	}

	const showRecentPrompts = tag.indexOf( 'dailyprompt' ) === 0 || tag.indexOf( 'bloganuary' ) === 0;

	const handleRecentPromptClick = ( prompt ) => {
		recordAction( 'clicked_reader_sidebar_recent_prompt' );
		recordGaEvent( 'Clicked Reader Sidebar Recent Blogging Prompt' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_recent_prompt_clicked', {
				prompt_id: prompt.id,
			} )
		);
	};

	const handleTagSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_tag' );
		recordGaEvent( 'Clicked Reader Sidebar Tag' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_tag_clicked', {
				tag: decodeURIComponent( tag ),
			} )
		);
	};

	const trackTagsPageLinkClick = () => {
		recordAction( 'clicked_reader_sidebar_tags_page_link' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_tags_page_link_clicked' ) );
	};

	const trackSignupClick = () => {
		if ( ! isLoggedIn ) {
			recordAction( 'clicked_reader_sidebar_signup' );
			dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_signup_clicked' ) );
			registerLastActionRequiresLoginProp( {
				type: 'sidebar-signup',
				tag: tag,
			} );
		}
	};

	const tagLinks = relatedMetaByTag.data?.related_tags?.map( ( relatedTag ) => (
		<TagLink tag={ relatedTag } key={ relatedTag.slug } onClick={ handleTagSidebarClick } />
	) );
	const relatedSitesLinks = relatedMetaByTag.data?.related_sites?.map( ( relatedSite ) => (
		<ReaderListFollowingItem key={ relatedSite.feed_ID } follow={ relatedSite } path="/" />
	) );
	const tagsPageUrl = addLocaleToPathLocaleInFront( '/tags' );

	const toggleFollowing = () => {
		const toggleAction = isFollowing ? requestUnfollowTag : requestFollowTag;
		if ( ! isLoggedIn ) {
			return registerLastActionRequiresLoginProp( {
				type: 'follow-tag',
				tag: tag,
			} );
		}

		dispatch( toggleAction( tag ) );
		recordAction( isFollowing ? 'unfollowed_topic' : 'followed_topic' );
		recordGaEvent( isFollowing ? 'Clicked Unfollow Topic' : 'Clicked Follow Topic', tag );
		dispatch(
			recordReaderTracksEvent(
				isFollowing ? 'calypso_reader_reader_tag_unfollowed' : 'calypso_reader_reader_tag_followed',
				{
					tag: tag,
				}
			)
		);
	};
	return (
		<>
			{ tagStats && (
				<div className="reader-tag-sidebar-stats">
					<div className="reader-tag-sidebar-stats__item">
						<span className="reader-tag-sidebar-stats__count">
							{ formatNumberCompact( tagStats?.data?.total_posts ) }
						</span>
						<span className="reader-tag-sidebar-stats__title">{ translate( 'Posts' ) }</span>
					</div>
					<div className="reader-tag-sidebar-stats__item">
						<span className="reader-tag-sidebar-stats__count">
							{ formatNumberCompact( tagStats?.data?.total_sites ) }
						</span>
						<span className="reader-tag-sidebar-stats__title">{ translate( 'Sites' ) }</span>
					</div>
				</div>
			) }
			{ showFollow && (
				<div className="reader-tag-sidebar-related-tags__follow-button">
					<FollowButton
						followLabel={ translate( 'Follow tag' ) }
						followingLabel={ translate( 'Following tag' ) }
						following={ isFollowing }
						onFollowToggle={ toggleFollowing }
						followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
						followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
					/>
				</div>
			) }
			{ tagLinks && (
				<div className="reader-tag-sidebar-related-tags">
					<h2>{ translate( 'Related Tags' ) }</h2>
					<div className="reader-post-card__tags">{ tagLinks }</div>
				</div>
			) }
			<a
				className="reader-tag-sidebar-tags-page"
				href={ tagsPageUrl }
				onClick={ trackTagsPageLinkClick }
			>
				{ translate( 'See all tags' ) }
			</a>
			{ relatedSitesLinks && (
				<div className="reader-tag-sidebar-related-sites">
					<h2>{ translate( 'Related Sites' ) }</h2>
					{ relatedSitesLinks }
				</div>
			) }
			{ ! isLoggedIn && (
				<div>
					<Button primary onClick={ trackSignupClick }>
						{ translate( 'Join the WordPress.com community' ) }
					</Button>
				</div>
			) }
			{ showRecentPrompts && prompts && (
				<div className="reader-tag-sidebar__recent-prompts">
					<h2>{ translate( 'Recent Prompts' ) }</h2>
					{ prompts.map( ( prompt ) => (
						<div key={ 'prompt-link-' + prompt.id }>
							<a
								className="reader-tag-sidebar__recent-prompt-link"
								href={ '/tag/dailyprompt-' + encodeURIComponent( prompt.id ) }
								onClick={ () => {
									handleRecentPromptClick( prompt );
								} }
							>
								{ ' ' }
								{ prompt.text }{ ' ' }
							</a>
						</div>
					) ) }
				</div>
			) }
		</>
	);
};

export default connect( null, { registerLastActionRequiresLogin } )( ReaderTagSidebar );
