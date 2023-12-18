import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import BloganuaryIcon from 'calypso/components/blogging-prompt-card/bloganuary-icon';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import { Tag } from 'calypso/reader/list-manage/types';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import { toggleReaderSidebarTags } from 'calypso/state/reader-ui/sidebar/actions';
import { isTagsOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import './style.scss';

const containsBloganuary = ( followedTags: Tag[] | undefined ): boolean | undefined => {
	return followedTags?.some( ( tag: Tag ) => tag.slug === 'bloganuary' );
};

const BloganuaryHeader = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const followedTags = useSelector( getReaderFollowedTags ) as Tag[];
	const isFollowingBloganuary = containsBloganuary( followedTags );
	const isTagsSidebarOpen = useSelector( isTagsOpen );
	const isLoggedIn = useSelector( isUserLoggedIn );
	useEffect( () => {
		recordTracksEvent( 'calypso_bloganuary_banner_view' );
	}, [] );

	const trackBloganuaryMoreInfoClick = () => {
		recordTracksEvent( 'calypso_bloganuary_banner_more_info_click' );
	};

	const followBloganuaryTag = () => {
		dispatch( requestFollowTag( 'bloganuary' ) );
		if ( ! isTagsSidebarOpen ) {
			dispatch( toggleReaderSidebarTags() );
		}
		recordTracksEvent( 'calypso_bloganuary_banner_follow_tag' );
	};

	const unfollowBloganuaryTag = () => {
		dispatch( requestUnfollowTag( 'bloganuary' ) );
		if ( ! isTagsSidebarOpen ) {
			dispatch( toggleReaderSidebarTags() );
		}
		recordTracksEvent( 'calypso_bloganuary_banner_unfollow_tag' );
	};

	const toggleFollowBloganuary = () => {
		if ( isFollowingBloganuary ) {
			unfollowBloganuaryTag();
		} else {
			followBloganuaryTag();
		}
	};

	return (
		<div className="bloganuary-header">
			<div>
				<BloganuaryIcon />
				<span className="bloganuary-header__title">{ translate( 'Bloganuary' ) }</span>
			</div>
			<div>
				{ isLoggedIn && (
					<FollowButton
						followLabel={ translate( 'Follow' ) }
						followingLabel={ translate( 'Following' ) }
						iconSize={ 24 }
						following={ isFollowingBloganuary }
						onFollowToggle={ toggleFollowBloganuary }
						followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
						followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
						className="bloganuary-header__button"
						disabled={ isFollowingBloganuary === undefined }
					/>
				) }
				<a
					href={ localizeUrl( 'https://wordpress.com/bloganuary' ) }
					className="bloganuary-header__link"
					target="_blank"
					rel="noopener noreferrer"
					onClick={ trackBloganuaryMoreInfoClick }
				>
					{ translate( 'Learn more' ) }
				</a>
			</div>
		</div>
	);
};

const BloganuaryHeaderWrapper = () => {
	if ( ! isBloganuary() ) {
		return null;
	}

	return <BloganuaryHeader />;
};

export default BloganuaryHeaderWrapper;
