import './follow-button.scss';

import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export interface FollowButtonProps {
	/** Whether the viewer currently follows the target. */
	isFollowing: boolean;
	/** Whether the target follows the viewer. Drives the "Follow back" affordance. */
	isFollowedBy: boolean;
	/**
	 * Whether the viewer has a pending follow request awaiting the
	 * target's approval. Mastodon's locked-account state. Renders as
	 * "Requested" with hover/focus-swap to "Cancel request"; click invokes
	 * `onUnfollow` (Mastodon's unfollow endpoint also cancels pending
	 * requests). Defaults to `false`; ATmosphere callers can ignore.
	 */
	isRequested?: boolean;
	/** Disable the button while a follow / unfollow request is in flight. */
	isPending?: boolean;
	/**
	 * Optional handle of the target actor (without leading `@`). When supplied,
	 * the Following / Requested-state button announces the action it performs
	 * to assistive tech so screen-reader and touch-AT users hear what the
	 * click will do rather than just the current state.
	 */
	actorHandle?: string;
	onFollow: () => void;
	onUnfollow: () => void;
}

/**
 * Protocol-agnostic Follow / Follow back / Following / Requested button.
 * Consumers pass mutation handlers in as props so this component stays
 * decoupled from the per-protocol API layer.
 *
 * Precedence order (top wins):
 * - `isFollowing: true`            → "Following" (secondary), hover-swap "Unfollow"
 * - `isRequested: true`            → "Requested" (secondary), hover-swap "Cancel request"
 * - `isFollowedBy: true`           → "Follow back" (primary)
 * - else                            → "Follow" (primary)
 */
export function FollowButton( {
	isFollowing,
	isFollowedBy,
	isRequested = false,
	isPending = false,
	actorHandle,
	onFollow,
	onUnfollow,
}: FollowButtonProps ) {
	const translate = useTranslate();

	if ( isFollowing ) {
		const unfollowLabel = actorHandle
			? translate( 'Unfollow @%(handle)s', { args: { handle: actorHandle } } )
			: translate( 'Unfollow' );
		return (
			<Button
				variant="secondary"
				disabled={ isPending }
				onClick={ onUnfollow }
				className="follow-button follow-button--following"
				aria-label={ String( unfollowLabel ) }
			>
				<span aria-hidden="true" className="follow-button__label-following">
					{ translate( 'Following' ) }
				</span>
				<span aria-hidden="true" className="follow-button__label-unfollow">
					{ translate( 'Unfollow' ) }
				</span>
			</Button>
		);
	}

	if ( isRequested ) {
		const cancelLabel = actorHandle
			? translate( 'Cancel follow request to @%(handle)s', {
					args: { handle: actorHandle },
			  } )
			: translate( 'Cancel follow request' );
		return (
			<Button
				variant="secondary"
				disabled={ isPending }
				onClick={ onUnfollow }
				className="follow-button follow-button--following follow-button--requested"
				aria-label={ String( cancelLabel ) }
			>
				<span aria-hidden="true" className="follow-button__label-following">
					{ translate( 'Requested' ) }
				</span>
				<span aria-hidden="true" className="follow-button__label-unfollow">
					{ translate( 'Cancel request' ) }
				</span>
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
