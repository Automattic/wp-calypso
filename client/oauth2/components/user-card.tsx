import { Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Gravatar from 'calypso/components/gravatar';
import type { AuthorizeMeta } from '../hooks/use-authorize-meta';

interface UserCardProps {
	user: NonNullable< AuthorizeMeta[ 'user' ] >;
	variant?: 'horizontal' | 'centered';
}

const UserCard = ( { user, variant = 'horizontal' }: UserCardProps ) => {
	const translate = useTranslate();

	const isCentered = variant === 'centered';

	const getUserDetails = () => {
		if ( isCentered ) {
			return user.email;
		}

		if ( user.username && user.site_count !== undefined ) {
			return translate( '%(username)s - %(count)d site', '%(username)s - %(count)d sites', {
				count: user.site_count,
				args: {
					username: user.username,
					count: user.site_count,
				},
			} );
		}

		return user.email;
	};

	return (
		<Card
			className={ clsx( 'oauth2-connect__user-card', {
				'oauth2-connect__user-card-centered': isCentered,
				'oauth2-connect__user-card-horizontal': ! isCentered,
			} ) }
		>
			<CardBody>
				<Gravatar
					user={ user }
					size={ isCentered ? 80 : 72 }
					imgSize={ isCentered ? 160 : 144 }
					className={ clsx( 'oauth2-connect__user-avatar', {
						'oauth2-connect__user-avatar-centered': isCentered,
					} ) }
				/>
				<div className="oauth2-connect__user-info">
					<div className="oauth2-connect__user-name">{ user.display_name }</div>
					<div className="oauth2-connect__user-details">{ getUserDetails() }</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default UserCard;
