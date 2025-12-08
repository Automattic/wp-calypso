import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getPermissionIcon } from '../utils/permission-icons';
import type { AuthorizeMeta } from '../hooks/use-authorize-meta';

interface PermissionsListProps {
	permissions: AuthorizeMeta[ 'permissions' ];
	clientTitle: string;
}

const PermissionsList = ( { permissions, clientTitle }: PermissionsListProps ) => {
	const translate = useTranslate();

	return (
		<>
			<div className="oauth2-connect__permissions">
				<p className="oauth2-connect__permissions-heading">
					{ translate( '%(client)s is requesting access to:', {
						args: { client: clientTitle },
					} ) }
				</p>
				<div className="oauth2-connect__permissions-grid">
					{ permissions.map( ( permission ) => {
						const icon = getPermissionIcon( permission.name );
						return (
							<div key={ permission.name } className="oauth2-connect__permission-item">
								{ icon && <Icon icon={ icon } size={ 20 } /> }
								<span>{ permission.description }</span>
							</div>
						);
					} ) }
				</div>
			</div>

			<div className="oauth2-connect__learn-more">
				<Button
					variant="link"
					href={ localizeUrl( 'https://wordpress.com/support/third-party-applications/' ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Learn more about how %(client)s uses your data', {
						args: { client: clientTitle },
					} ) }
				</Button>
			</div>
		</>
	);
};

export default PermissionsList;
