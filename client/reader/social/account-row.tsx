import './account-row.scss';

import { useTranslate } from 'i18n-calypso';
import { MouseEvent } from 'react';
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
}

export function SocialAccountRow( props: SocialAccountRowProps ) {
	const translate = useTranslate();
	const { avatarUrl, displayName, handle, biography, profileHref, isSelf, followState } = props;

	const handleFollowAreaClick = ( event: MouseEvent< HTMLDivElement > ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<a className="social-account-row" href={ profileHref }>
			<div className="social-account-row__avatar">
				{ avatarUrl ? <img src={ avatarUrl } alt={ displayName } /> : null }
			</div>
			<div className="social-account-row__main">
				<div className="social-account-row__identity">
					<span className="social-account-row__display-name">{ displayName }</span>
					<span className="social-account-row__handle">@{ handle }</span>
					{ followState?.isFollowedBy && (
						<span className="social-account-row__followed-by-badge">
							{ translate( 'Follows you' ) }
						</span>
					) }
				</div>
				{ biography ? <div className="social-account-row__bio">{ biography }</div> : null }
			</div>
			{ ! isSelf && followState && (
				<div
					className="social-account-row__follow"
					onClick={ handleFollowAreaClick }
					onKeyDown={ ( e ) => e.stopPropagation() }
					role="presentation"
				>
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
		</a>
	);
}
