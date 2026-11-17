import { useUnsubscribeUndoNotice } from 'calypso/reader/data/site-subscriptions/use-unsubscribe-with-undo';
import ReaderFollowButton from 'calypso/reader/follow-button';
import type { ComponentProps } from 'react';

type Props = ComponentProps< typeof ReaderFollowButton > & { siteName?: string };

/**
 * A follow button that offers Undo once an unsubscribe goes through.
 */
export default function FollowButtonWithUndo( { siteName, ...props }: Props ) {
	const showUndoNotice = useUnsubscribeUndoNotice();

	return (
		<ReaderFollowButton
			{ ...props }
			onFollowSuccess={ ( isFollowing ) => {
				if ( ! isFollowing ) {
					showUndoNotice( { feedUrl: props.siteUrl, siteName, source: props.followSource } );
				}
			} }
		/>
	);
}
