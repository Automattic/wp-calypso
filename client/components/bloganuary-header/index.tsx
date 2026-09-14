import { followReadTagMutation, unfollowReadTagMutation } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import BloganuaryIcon from 'calypso/components/blogging-prompt-card/bloganuary-icon';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { toggleReaderSidebarTags } from 'calypso/state/reader-ui/sidebar/actions';
import { isTagsOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import './style.scss';

const BloganuaryHeader = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { data: followedTags, isSuccess } = useFollowedTags();
	// While the query is still loading we don't know yet — keep the follow
	// button disabled by returning `undefined` instead of `false`.
	const isFollowingBloganuary = isSuccess
		? followedTags.some( ( tag ) => tag.slug === 'bloganuary' )
		: undefined;
	const isTagsSidebarOpen = useSelector( isTagsOpen );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { mutate: followTag } = useMutation( followReadTagMutation( queryClient ) );
	const { mutate: unfollowTag } = useMutation( unfollowReadTagMutation( queryClient ) );

	useEffect( () => {
		recordTracksEvent( 'calypso_bloganuary_banner_view' );
	}, [] );

	const trackBloganuaryMoreInfoClick = () => {
		recordTracksEvent( 'calypso_bloganuary_banner_more_info_click' );
	};

	const followBloganuaryTag = () => {
		followTag( 'bloganuary', {
			onError: () => {
				dispatch(
					errorNotice(
						translate( 'Could not follow tag: %(tag)s', { args: { tag: 'bloganuary' } } )
					)
				);
			},
		} );
		if ( ! isTagsSidebarOpen ) {
			dispatch( toggleReaderSidebarTags() );
		}
		recordTracksEvent( 'calypso_bloganuary_banner_follow_tag' );
	};

	const unfollowBloganuaryTag = () => {
		unfollowTag( 'bloganuary', {
			onError: () => {
				dispatch(
					errorNotice(
						translate( 'Could not unfollow tag: %(tag)s', { args: { tag: 'bloganuary' } } )
					)
				);
			},
		} );
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
						following={ isFollowingBloganuary }
						onFollowToggle={ toggleFollowBloganuary }
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
