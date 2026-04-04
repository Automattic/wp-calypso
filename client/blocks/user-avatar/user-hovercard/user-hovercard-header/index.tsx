import './styles.scss';
import AutoDirection from 'calypso/components/auto-direction';
import PreloadedImage from 'calypso/components/preloaded-image';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { UserAvatarInfo } from '../..';

interface UserHovercardHeaderProps {
	user: UserAvatarInfo;
}

function UserHovercardHeader( { user }: UserHovercardHeaderProps ): JSX.Element {
	const name: string = user.display_name || user.name || '';
	const profilePageUrl = user.login ? `/reader/users/${ user.login }` : undefined; // Intentionally navigation only to the Reader Profile page. This keep the experience consistent.
	const avatarUrl = getProcessedAvatarUrl( user.avatar_URL );

	function getProcessedAvatarUrl( avatarUrl?: string ): string | null {
		if ( ! avatarUrl ) {
			return null;
		}

		try {
			const url = new URL( avatarUrl );
			url.searchParams.set( 'd', 'mm' );
			url.searchParams.set( 'r', 'G' );
			url.searchParams.set( 's', '208' );
			return url.toString();
		} catch {
			return null;
		}
	}

	return (
		<AutoDirection>
			<div className="user-hovercard__header">
				<div className="user-hovercard__avatar">
					<a href={ profilePageUrl }>
						{ avatarUrl ? (
							<PreloadedImage
								src={ avatarUrl }
								alt={ name }
								width={ 102 }
								height={ 102 }
								borderRadius="50%"
							/>
						) : (
							<UserAvatarDefaultIcon iconSize={ 102 } />
						) }
					</a>
				</div>

				{ name && (
					<div className="user-hovercard__name">
						<a href={ profilePageUrl }>
							<h4>{ name }</h4>
						</a>
					</div>
				) }

				{ user.description && (
					<div className="user-hovercard__description">{ user.description }</div>
				) }
			</div>
		</AutoDirection>
	);
}

export default UserHovercardHeader;
