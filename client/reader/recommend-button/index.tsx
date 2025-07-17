import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useRecommendedSite } from 'calypso/landing/subscriptions/hooks/use-recommended-site';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { requestRecommendedBlogsListItems } from 'calypso/state/reader/lists/actions';
import {
	hasRequestedUserRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';
import ReaderFollowFeedIcon from '../components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from '../components/icons/following-feed-icon';
import type { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import './style.scss';

interface Props {
	feedId: Feed[ 'feed_ID' ];
}

export const RecommendButton = ( { feedId }: Props ) => {
	const { isRecommended, toggleRecommended } = useRecommendedSite( feedId );
	const owner = useSelector( getCurrentUserName );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isRequesting = useSelector( ( state ) => isRequestingUserRecommendedBlogs( state, owner ) );
	const hasRequested = useSelector( ( state ) => hasRequestedUserRecommendedBlogs( state, owner ) );

	useEffect( () => {
		if ( ! hasRequested && ! isRequesting ) {
			dispatch( requestRecommendedBlogsListItems( owner ) );
		}
	}, [ dispatch, hasRequested, isRequesting ] );

	const Icon = isRecommended ? ReaderFollowingFeedIcon : ReaderFollowFeedIcon;
	const classes = clsx( 'reader-recommend-button', {
		'is-recommended': isRecommended,
		'is-requesting': isRequesting,
	} );

	return (
		<Button
			icon={ <Icon iconSize={ 24 } /> }
			className={ classes }
			onClick={ toggleRecommended }
			variant="secondary"
			disabled={ isRequesting }
		>
			{ isRecommended ? translate( 'Recommended' ) : translate( 'Recommended this blog' ) }
		</Button>
	);
};
