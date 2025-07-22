import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useRecommendedListMutation } from 'calypso/data/reader/recommendations/use-recommend-list-mutation';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import ReaderFollowFeedIcon from '../components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from '../components/icons/following-feed-icon';
import type { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import './style.scss';

interface Props {
	feedId: Feed[ 'feed_ID' ];
	isRecommended: boolean;
}

export const RecommendButton = ( { feedId, isRecommended = false }: Props ) => {
	const owner = useSelector( getCurrentUserName );
	const translate = useTranslate();
	const { add, remove } = useRecommendedListMutation( owner );

	const addOrRemoveFromRecommendedList = useCallback( () => {
		if ( isRecommended ) {
			remove( feedId );
		} else {
			add( feedId );
		}
	}, [ isRecommended, remove, feedId, add ] );

	const Icon = isRecommended ? ReaderFollowingFeedIcon : ReaderFollowFeedIcon;
	const classes = clsx( 'reader-recommend-button', {
		'is-recommended': isRecommended,
	} );

	return (
		<Button
			icon={ <Icon iconSize={ 24 } /> }
			className={ classes }
			onClick={ addOrRemoveFromRecommendedList }
			variant="secondary"
		>
			{ isRecommended ? translate( 'Recommended' ) : translate( 'Recommend this blog' ) }
		</Button>
	);
};
