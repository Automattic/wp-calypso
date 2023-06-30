import { Gridicon } from '@automattic/components';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';
import ReaderSiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import formatNumberCompact from 'calypso/lib/format-number-compact';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { isEligibleForUnseen, getSiteUrl } from 'calypso/reader/get-helpers';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useSelector } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { hasReaderFollowOrganization, isFollowing } from 'calypso/state/reader/follows/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
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
	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );
	const siteUrl = getSiteUrl( { feed, site } );

	const { following, hasOrganization, isEmailBlocked, isWPForTeamsItem, siteId } = useSelector(
		( state ) => {
			let _siteId = site?.ID;
			let _feedId = feed?.feed_ID;
			let _feed = _feedId ? getFeed( state, _feedId ) : undefined;
			let _site = _siteId ? getSite( state, _siteId ) : undefined;

			if ( feed && ! _siteId ) {
				_siteId = _feed.blog_ID || undefined;
				_site = _siteId ? getSite( state, _feed.blog_ID ) : undefined;
			}

			if ( _site && ! _feedId ) {
				_feedId = _site.feed_ID;
				_feed = _feedId ? getFeed( state, _site.feed_ID ) : undefined;
			}

			return {
				isWPForTeamsItem: isSiteWPForTeams( state, _siteId ) || isFeedWPForTeams( state, _feedId ),
				hasOrganization: hasReaderFollowOrganization( state, _feedId, _siteId ),
				following: _feed && isFollowing( state, { feedUrl: _feed.feed_URL } ),
				isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
				siteId: _siteId,
			};
		}
	);

	const markAllAsSeen = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );

		dispatch(
			requestMarkAllAsSeen( {
				identifier: streamKey,
				feedIds: [ feed.feed_ID ],
				feedUrls: [ feed.URL ],
			} )
		);
	};

	const openSuggestedFollowsModal = ( followClicked ) => {
		setIsSuggestedFollowsModalOpen( followClicked );
	};

	const onCloseSuggestedFollowModal = () => {
		setIsSuggestedFollowsModalOpen( false );
	};

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
					<>
						<div className="reader-feed-header__follow-and-settings">
							{ siteUrl && (
								<div className="reader-feed-header__follow-button">
									<ReaderFollowButton
										siteUrl={ siteUrl }
										hasButtonStyle={ true }
										iconSize={ 24 }
										onFollowToggle={ openSuggestedFollowsModal }
									/>
								</div>
							) }

							{ site && following && ! isEmailBlocked && (
								<div className="reader-feed-header__email-settings">
									<ReaderSiteNotificationSettings
										iconSize={ 24 }
										showLabel={ false }
										siteId={ siteId }
									/>
								</div>
							) }
						</div>
						{ isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) && feed && (
							<button
								onClick={ markAllAsSeen }
								className="reader-feed-header__seen-button"
								disabled={ feed.unseen_count === 0 }
							>
								<Gridicon icon="visible" size={ 24 } />
								<span
									className="reader-feed-header__visibility"
									title={ translate( 'Mark all as seen' ) }
								>
									{ translate( 'Mark all as seen' ) }
								</span>
							</button>
						) }
					</>
				) }
			</div>
			{ siteId && (
				<ReaderSuggestedFollowsDialog
					onClose={ onCloseSuggestedFollowModal }
					siteId={ +siteId }
					isVisible={ isSuggestedFollowsModalOpen }
				/>
			) }
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
								{ followerCount.toLocaleString( getLocaleSlug() ) }
							</span>
							<span className="reader-tag-sidebar-stats__title">
								{ translate( 'Follower', 'Followers', { count: followerCount } ) }
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
