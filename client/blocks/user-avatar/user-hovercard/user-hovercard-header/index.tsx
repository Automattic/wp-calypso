import './styles.scss';
import { UserResponse } from '@automattic/api-core';
import AutoDirection from 'calypso/components/auto-direction';
import PreloadedImage from 'calypso/components/preloaded-image';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { getProcessedGravatarUrl } from '../../utils';

interface UserHovercardHeaderProps {
	user: UserResponse;
}

function UserHovercardHeader( { user }: UserHovercardHeaderProps ): JSX.Element {
	const name: string =
		user.display_name ||
		( user.first_name && user.last_name ? `${ user.first_name } ${ user.last_name }` : '' );
	const profilePageUrl = user.user_login ? `/reader/users/${ user.user_login }` : undefined; // Only navigate to profile page. Avoid navigating to any external links to keep UX consistent.
	const avatarUrl = getProcessedGravatarUrl( user.avatar_URL );
	const avatarImg = avatarUrl ? (
		<PreloadedImage
			src={ avatarUrl }
			alt={ name }
			width={ 102 }
			height={ 102 }
			imgStyles={ { borderRadius: '50%' } }
			fallbackIcon={ <UserAvatarDefaultIcon iconSize={ 102 } /> }
		/>
	) : (
		<UserAvatarDefaultIcon iconSize={ 102 } />
	);

	return (
		<AutoDirection>
			<div className="user-hovercard__header">
				<div className="user-hovercard__avatar">
					{ profilePageUrl ? <a href={ profilePageUrl }>{ avatarImg }</a> : avatarImg }
				</div>

				{ name && (
					<div className="user-hovercard__name">
						<h4>{ profilePageUrl ? <a href={ profilePageUrl }>{ name }</a> : name }</h4>
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
