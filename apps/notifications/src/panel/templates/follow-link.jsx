/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { wpcom } from '../rest-client/wpcom';
import { bumpStat } from '../rest-client/bump-stat';
import Gridicon from './gridicons';
import useSafe from '../helpers/use-safe';

const followStatTypes = {
	comment: 'note_commented_post',
	comment_like: 'note_liked_comment',
	like: 'note_liked_post',
	follow: 'note_followed',
	reblog: 'note_reblog_post',
};

export const FollowLink = ( { site, noteType, isFollowing: initialIsFollowing } ) => {
	const translate = useTranslate();

	const [ isRequestRunning, setIsRequestRunning ] = React.useState( false );
	const [ isFollowing, setIsFollowing ] = React.useState( initialIsFollowing );

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
		? translate( 'Following', { context: 'you are following' } )
		: translate( 'Follow', { context: 'verb: imperative' } );

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
