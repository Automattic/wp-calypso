import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus, published } from '@wordpress/icons';
import { useState } from 'react';
import useSafe from '../../panel/helpers/use-safe';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';

export const followStatTypes = {
	comment: 'note_commented_post',
	comment_like: 'note_liked_comment',
	like: 'note_liked_post',
	follow: 'note_followed',
	reblog: 'note_reblog_post',
};

export const FollowLink = ( {
	site,
	noteType,
	isFollowing: initialIsFollowing,
}: {
	site: number;
	noteType: keyof typeof followStatTypes;
	isFollowing: boolean;
} ) => {
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

		const updateState = ( error: Error | null, data: { is_following: boolean } ) => {
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

			bumpStat( {
				'notes-click-action': 'follow',
				follow_source: followStatTypes[ noteType ],
			} );
		}
	}

	return (
		<Button
			variant="tertiary"
			size="small"
			icon={ isFollowing ? published : plus }
			iconSize={ 16 }
			style={ { padding: 0 } }
			onClick={ toggleFollowStatus }
		>
			{ isFollowing ? __( 'Subscribed' ) : __( 'Subscribe' ) }
		</Button>
	);
};

export default FollowLink;
