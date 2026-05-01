import './follow-button.scss';

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
 * - `isFollowing: true`                       → "Following" (secondary); on hover/focus, reveals "Unfollow" label
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
		return (
			<Button
				variant="secondary"
				disabled={ isPending }
				onClick={ onUnfollow }
				className="follow-button follow-button--following"
			>
				<span className="follow-button__label-following">{ translate( 'Following' ) }</span>
				<span className="follow-button__label-unfollow">{ translate( 'Unfollow' ) }</span>
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
