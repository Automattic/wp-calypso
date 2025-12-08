import { useTranslate } from 'i18n-calypso';
import Gravatar from 'calypso/components/gravatar';
import type { AuthorizeMeta } from '../hooks/use-authorize-meta';

interface UserCardProps {
	user: NonNullable< AuthorizeMeta[ 'user' ] >;
}

const UserCard = ( { user }: UserCardProps ) => {
	const translate = useTranslate();

	return (
		<div className="oauth2-connect__user-card">
			<Gravatar user={ user } size={ 72 } imgSize={ 144 } className="oauth2-connect__user-avatar" />
			<div className="oauth2-connect__user-info">
				<div className="oauth2-connect__user-name">{ user.display_name }</div>
				<div className="oauth2-connect__user-details">
					{ user.username && user.site_count !== undefined
						? translate( '%(username)s - %(count)d site', '%(username)s - %(count)d sites', {
								count: user.site_count,
								args: {
									username: user.username,
									count: user.site_count,
								},
						  } )
						: user.email }
				</div>
			</div>
		</div>
	);
};

export default UserCard;
