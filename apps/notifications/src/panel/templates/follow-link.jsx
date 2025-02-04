import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useSafe from '../helpers/use-safe';
import { bumpStat } from '../rest-client/bump-stat';
import { wpcom } from '../rest-client/wpcom';
import Gridicon from './gridicons';

const followStatTypes = {
	comment: 'note_commented_post',
	comment_like: 'note_liked_comment',
	like: 'note_liked_post',
	follow: 'note_followed',
	reblog: 'note_reblog_post',
};

export const FollowLink = ( { site, noteType, isFollowing: initialIsFollowing } ) => {
	const translate = useTranslate();

	const [ isRequestRunning, setIsRequestRunning ] = useState( false );
	const [ isFollowing, setIsFollowing ] = useState( initialIsFollowing );

	const safeSetIsFollowing = useSafe( setIsFollowing );
	const safeSetIsRequestRunning = useSafe( setIsRequestRunning );

	function toggleFollowStatus() {
		if ( isRequestRunning ) {
			return;
		}

		const follower = wpcom().site( site ).follow();
		setIsRequestRunning( true );

		// optimistically update local state
		const previousState = isFollowing;
		setIsFollowing( ! isFollowing );

		const updateState = ( error, data ) => {
			safeSetIsRequestRunning( false );
			if ( error ) {
				safeSetIsFollowing( previousState );
				throw error;
			}
			safeSetIsFollowing( data.is_following );
		};

		if ( isFollowing ) {
			follower.del( updateState );
			bumpStat( 'notes-click-action', 'unfollow' );
		} else {
			follower.add( updateState );

			const stats = { 'notes-click-action': 'follow' };
			stats.follow_source = followStatTypes[ noteType ];
			bumpStat( stats );
		}
	}

	const icon = isFollowing ? 'reader-following' : 'reader-follow';
	const linkText = isFollowing
		? translate( 'Subscribed', { context: 'you are subscribing' } )
		: translate( 'Subscribe', { context: 'verb: imperative' } );

	return (
		<button className="follow-link" onClick={ toggleFollowStatus }>
			<Gridicon icon={ icon } size={ 18 } />
			{ linkText }
		</button>
	);
};

FollowLink.propTypes = {
	site: PropTypes.number,
	isFollowing: PropTypes.bool,
};

export default FollowLink;
