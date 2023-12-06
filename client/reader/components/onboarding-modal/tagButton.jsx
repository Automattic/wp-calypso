import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import { useDispatch, useSelector } from 'calypso/state';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderTagBySlug } from 'calypso/state/reader/tags/selectors';
import ReaderFollowFeedIcon from '../icons/follow-feed-icon';
import ReaderFollowingFeedIcon from '../icons/following-feed-icon';

const TagButton = ( { title, slug } ) => {
	const isFollowing = useSelector( ( state ) => getReaderTagBySlug( state, slug )?.isFollowing );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const addTag = () => {
		if ( ! isFollowing ) {
			dispatch( requestFollowTag( slug ) );
		}
	};

	return (
		<FollowButton
			followLabel={ translate( 'Follow: ' ) + title }
			followingLabel={ translate( 'Following: ' ) + title }
			following={ isFollowing }
			onFollowToggle={ addTag }
			followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
			followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
		/>
	);
};

export default TagButton;
