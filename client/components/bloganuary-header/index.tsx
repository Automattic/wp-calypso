import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BloganuaryIcon from 'calypso/components/blogging-prompt-card/bloganuary-icon';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { Tag } from 'calypso/reader/list-manage/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { requestFollowTag } from 'calypso/state/reader/tags/items/actions';
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
	const prevIsFollowingBloganuary = useRef( containsBloganuary( followedTags ) );
	const isFollowingBloganuary = containsBloganuary( followedTags );
	const isTagsSidebarOpen = useSelector( isTagsOpen );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_reader_bloganuary_banner_view' ) );
	}, [ dispatch ] );

	// Handle successfully subscribing to 'bloganuary' the redux-y way
	// Errors are handled in client/state/data-layer/wpcom/read/tags/mine/new/index.js:receiveError
	useEffect( () => {
		// tripple equals check is needed because 'undefined' means the value has not been loaded yet.
		if ( prevIsFollowingBloganuary.current === false && isFollowingBloganuary ) {
			dispatch( successNotice( translate( 'Subscribed to bloganuary tag' ) ) );
		}
		prevIsFollowingBloganuary.current = isFollowingBloganuary;
	}, [ isFollowingBloganuary, prevIsFollowingBloganuary, dispatch, translate ] );

	const trackBloganuaryMoreInfoClick = () => {
		dispatch( recordTracksEvent( 'calypso_reader_bloganuary_banner_more_info_click' ) );
	};

	const subscribeToBloganuaryTag = () => {
		dispatch( requestFollowTag( 'bloganuary' ) );
		if ( ! isTagsSidebarOpen ) {
			dispatch( toggleReaderSidebarTags() );
		}
		dispatch( recordTracksEvent( 'calypso_reader_bloganuary_banner_subscribe_to_tag' ) );
	};

	return (
		<div className="bloganuary-header">
			<div>
				<BloganuaryIcon />
				<span className="bloganuary-header__title">{ translate( 'Bloganuary' ) }</span>
			</div>
			<div>
				<Button
					className="bloganuary-header__button"
					onClick={ subscribeToBloganuaryTag }
					disabled={ isFollowingBloganuary }
				>
					{ isFollowingBloganuary ? translate( 'Subscribed' ) : translate( 'Subscribe' ) }
				</Button>
				<a
					href="https://wordpress.com/bloganuary"
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
