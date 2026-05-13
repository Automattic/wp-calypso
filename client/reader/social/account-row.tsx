import './account-row.scss';

import { useTranslate } from 'i18n-calypso';
import { FollowButton } from './follow-button';

export interface SocialAccountRowFollowState {
	isFollowing: boolean;
	isFollowedBy: boolean;
	isRequested?: boolean;
	isPending?: boolean;
	onFollow: () => void;
	onUnfollow: () => void;
}

export interface SocialAccountRowProps {
	avatarUrl: string | null;
	displayName: string;
	handle: string;
	biography?: string;
	profileHref: string;
	isSelf?: boolean;
	followState?: SocialAccountRowFollowState;
	/**
	 * Suppress the "Follows you" badge. On a followers list every row
	 * trivially follows the viewer, so the badge is redundant. The follow
	 * button still uses `followState.isFollowedBy` to pick the "Follow back"
	 * label.
	 */
	hideFollowedByBadge?: boolean;
}

/**
 * Card-link layout: the row is a <div>; a single <a> wraps the display
 * name and renders a covering ::after overlay so the whole row is the
 * profile click target. Inner interactive elements (the follow button)
 * sit above the overlay via position: relative; z-index: 1, so each
 * control remains a single, non-nested, focusable element. Mirrors the
 * pattern used by PostCardLink in client/reader/social/components/post-card/.
 */
export function SocialAccountRow( props: SocialAccountRowProps ) {
	const translate = useTranslate();
	const {
		avatarUrl,
		displayName,
		handle,
		biography,
		profileHref,
		isSelf,
		followState,
		hideFollowedByBadge,
	} = props;

	return (
		<div className="social-account-row">
			<div className="social-account-row__avatar">
				{ /* The display name is rendered as a sibling text node; mark the
				   avatar decorative so screen readers don't double-announce it.
				   Mirrors the SocialProfileCard pattern at profile-card.tsx. */ }
				{ avatarUrl ? <img src={ avatarUrl } alt="" /> : null }
			</div>
			<div className="social-account-row__main">
				<div className="social-account-row__identity">
					<a className="social-account-row__display-name" href={ profileHref }>
						{ displayName }
					</a>
					<span className="social-account-row__handle">@{ handle }</span>
					{ followState?.isFollowedBy && ! hideFollowedByBadge && (
						<span className="social-account-row__followed-by-badge">
							{ translate( 'Follows you' ) }
						</span>
					) }
				</div>
				{ biography ? <div className="social-account-row__bio">{ biography }</div> : null }
			</div>
			{ ! isSelf && followState && (
				<div className="social-account-row__follow">
					<FollowButton
						isFollowing={ followState.isFollowing }
						isFollowedBy={ followState.isFollowedBy }
						isRequested={ followState.isRequested }
						isPending={ followState.isPending }
						actorHandle={ handle }
						onFollow={ followState.onFollow }
						onUnfollow={ followState.onUnfollow }
					/>
				</div>
			) }
		</div>
	);
}
