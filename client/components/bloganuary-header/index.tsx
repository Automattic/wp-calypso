import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BloganuaryIcon from 'calypso/components/blogging-prompt-card/bloganuary-icon';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import { Tag } from 'calypso/reader/list-manage/types';
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
				<Button
					className={ classNames( 'bloganuary-header__button', {
						'is-following': isFollowingBloganuary,
					} ) }
					onClick={ toggleFollowBloganuary }
					disabled={ isFollowingBloganuary === undefined }
				>
					{ isFollowingBloganuary
						? ReaderFollowingFeedIcon( { iconSize: 20 } )
						: ReaderFollowFeedIcon( { iconSize: 20 } ) }
					<span className="bloganuary-header__follow-label">
						{ isFollowingBloganuary ? translate( 'Following' ) : translate( 'Follow' ) }
					</span>
				</Button>
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
