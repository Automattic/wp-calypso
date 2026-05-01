import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export interface FollowButtonProps {
	/** Whether the viewer currently follows the target. */
	isFollowing: boolean;
	/** Whether the target follows the viewer. Drives the "Follow back" affordance. */
	isFollowedBy: boolean;
	/** Disable the button while a follow / unfollow request is in flight. */
	isPending?: boolean;
	onFollow: () => void;
	onUnfollow: () => void;
}

/**
 * Protocol-agnostic Follow / Follow back / Following button. Consumers
 * pass mutation handlers in as props so this component stays decoupled
 * from the per-protocol API layer (Bluesky today, Mastodon next).
 *
 * Three states:
 * - `isFollowing: false, isFollowedBy: false` → "Follow" (primary)
 * - `isFollowing: false, isFollowedBy: true`  → "Follow back" (primary)
 * - `isFollowing: true`                       → "Following" (secondary)
 *
 * (The Following state is implemented in a follow-up task; this slice
 * covers Follow and Follow back only.)
 */
export function FollowButton( {
	isFollowing,
	isFollowedBy,
	isPending = false,
	onFollow,
	onUnfollow,
}: FollowButtonProps ) {
	const translate = useTranslate();

	if ( isFollowing ) {
		// Following state lands in a follow-up task; render the same
		// secondary affordance with the Unfollow handler in the meantime
		// so consumers passing isFollowing get a sensible click target
		// rather than nothing.
		return (
			<Button
				variant="secondary"
				disabled={ isPending }
				onClick={ onUnfollow }
				className="follow-button follow-button--following"
			>
				{ translate( 'Following' ) }
			</Button>
		);
	}

	const label = isFollowedBy ? translate( 'Follow back' ) : translate( 'Follow' );
	return (
		<Button variant="primary" disabled={ isPending } onClick={ onFollow } className="follow-button">
			{ label }
		</Button>
	);
}
