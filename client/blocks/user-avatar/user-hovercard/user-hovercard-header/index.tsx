import './styles.scss';
import page from '@automattic/calypso-router';
import AutoDirection from 'calypso/components/auto-direction';
import PreloadedImage from 'calypso/components/preloaded-image';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { GetReaderUserResponse } from 'calypso/reader/user-profile/queries/useGetReaderUserQuery';
import { getProcessedGravatarUrl } from '../../utils';

interface UserHovercardHeaderProps {
	user: GetReaderUserResponse;
}

function UserHovercardHeader( { user }: UserHovercardHeaderProps ): JSX.Element {
	const name: string =
		user.display_name ||
		( user.first_name && user.last_name ? `${ user.first_name } ${ user.last_name }` : '' ) ||
		'';
	const profilePageUrl = user.user_login ? `/reader/users/${ user.user_login }` : undefined; // Only navigate to profile page. Avoid navigating to any external links to keep UX consistent.
	const avatarUrl = getProcessedGravatarUrl( user.avatar_URL );

	function handleUserProfileClick(): void {
		if ( profilePageUrl ) {
			page( profilePageUrl );
		}
	}

	return (
		<AutoDirection>
			<div className="user-hovercard__header">
				<div className="user-hovercard__avatar">
					<a href={ profilePageUrl } onClick={ handleUserProfileClick }>
						{ avatarUrl ? (
							<PreloadedImage
								src={ avatarUrl }
								alt={ name }
								width={ 102 }
								height={ 102 }
								imgStyles={ { borderRadius: '50%' } }
							/>
						) : (
							<UserAvatarDefaultIcon iconSize={ 102 } />
						) }
					</a>
				</div>

				{ name && (
					<div className="user-hovercard__name">
						<a href={ profilePageUrl } onClick={ handleUserProfileClick }>
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
