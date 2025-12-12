import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Icon, chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getPermissionIcon } from '../utils/permission-icons';
import type { AuthorizeMeta } from '../hooks/use-authorize-meta';

interface PermissionsListProps {
	permissions: AuthorizeMeta[ 'permissions' ];
	clientTitle: string;
}

const INITIAL_VISIBLE_COUNT = 4;

const PermissionsList = ( { permissions, clientTitle }: PermissionsListProps ) => {
	const translate = useTranslate();
	const [ showAll, setShowAll ] = useState( false );

	const visiblePermissions = showAll ? permissions : permissions.slice( 0, INITIAL_VISIBLE_COUNT );
	const hiddenCount = permissions.length - INITIAL_VISIBLE_COUNT;
	const hasMorePermissions = permissions.length > INITIAL_VISIBLE_COUNT;

	return (
		<>
			<div className="oauth2-connect__permissions">
				<p className="oauth2-connect__permissions-heading">
					{ translate( '%(client)s is requesting access to:', {
						args: { client: clientTitle },
					} ) }
				</p>
				<div className="oauth2-connect__permissions-list">
					{ visiblePermissions.map( ( permission ) => {
						const icon = getPermissionIcon( permission.name );
						return (
							<div key={ permission.name } className="oauth2-connect__permission-item">
								{ icon && <Icon icon={ icon } size={ 20 } /> }
								<span>{ permission.description }</span>
							</div>
						);
					} ) }

					{ hasMorePermissions && (
						<Button
							onClick={ () => setShowAll( ! showAll ) }
							className="oauth2-connect__show-more"
							aria-expanded={ showAll }
							aria-label={
								showAll
									? translate( 'Show less permissions' )
									: translate( 'Show more permissions' )
							}
						>
							{ showAll
								? translate( 'Show less' )
								: translate( '%(count)d more', {
										args: { count: hiddenCount },
								  } ) }
							<Icon icon={ chevronDown } size={ 20 } className={ showAll ? 'is-rotated' : '' } />
						</Button>
					) }
				</div>
			</div>

			<div className="oauth2-connect__learn-more">
				<Button
					variant="link"
					href={ localizeUrl( 'https://wordpress.com/support/third-party-applications/' ) }
					target="_blank"
					rel="noopener noreferrer"
					className="oauth2-connect__learn-more-link"
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
