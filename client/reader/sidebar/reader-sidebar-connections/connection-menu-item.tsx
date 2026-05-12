import { useConnectionQuery, useMastodonConnectionQuery } from '@automattic/api-queries';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';
import { getProtocolIcon, getProtocolLabel, type UnifiedConnection } from './types';

interface Props {
	connection: UnifiedConnection;
	isSelected: boolean;
	onClick: () => void;
}

/**
 * ATmosphere and Mastodon list endpoints return `avatar: null` and an
 * empty `display_name` until the per-id endpoint is queried. Mirror the
 * lazy fetch the previous per-protocol sidebar rows did so the unified
 * list shows real avatars and display names once they resolve. Fediverse
 * already returns the icon + name on the list payload so it doesn't
 * need a follow-up fetch.
 */
function useResolvedConnection( connection: UnifiedConnection ): {
	avatarUrl: string | null;
	displayName: string;
} {
	const atmosphereId = connection.protocol === 'atmosphere' ? connection.id : null;
	const mastodonId = connection.protocol === 'mastodon' ? connection.id : null;

	const atmosphere = useConnectionQuery( atmosphereId ?? 0, {
		enabled: atmosphereId !== null,
	} );
	const mastodon = useMastodonConnectionQuery( mastodonId ?? 0, {
		enabled: mastodonId !== null,
	} );

	if ( connection.protocol === 'atmosphere' ) {
		return {
			avatarUrl: atmosphere.data?.avatar ?? connection.avatarUrl ?? null,
			displayName: atmosphere.data?.display_name || connection.displayName,
		};
	}
	if ( connection.protocol === 'mastodon' ) {
		return {
			avatarUrl: mastodon.data?.avatar ?? connection.avatarUrl ?? null,
			displayName: mastodon.data?.display_name || connection.displayName,
		};
	}
	return { avatarUrl: connection.avatarUrl, displayName: connection.displayName };
}

export function ConnectionMenuItem( { connection, isSelected, onClick }: Props ) {
	const { avatarUrl, displayName } = useResolvedConnection( connection );
	const protocolLabel = getProtocolLabel( connection.protocol );

	return (
		<MenuItem
			selected={ isSelected }
			className="sidebar-social__account-item sidebar-connections__account-item"
		>
			<MenuItemLink
				className="sidebar__menu-link sidebar-connections__link"
				href={ connection.href }
				onClick={ onClick }
			>
				<span className="sidebar-connections__avatar-wrap">
					{ avatarUrl ? (
						// Raw <img>: external CDNs don't survive Photon routing,
						// matching the SocialAccountMenuItem choice.
						<img
							className="sidebar-social__account-avatar"
							src={ avatarUrl }
							alt=""
							width={ 22 }
							height={ 22 }
							loading="lazy"
							decoding="async"
						/>
					) : (
						<SiteIcon iconUrl={ null } size={ 22 } />
					) }
					<span
						className={ `sidebar-connections__badge sidebar-connections__badge--${ connection.protocol }` }
						aria-hidden="true"
					>
						{ getProtocolIcon( connection.protocol ) }
					</span>
				</span>
				<div className="sidebar-social__account-text">
					<div className="sidebar__menu-item-title" title={ displayName }>
						{ displayName }
					</div>
					<div className="sidebar-social__account-handle" title={ connection.handle }>
						{ connection.handle }
					</div>
				</div>
				<span className="screen-reader-text">{ protocolLabel }</span>
			</MenuItemLink>
		</MenuItem>
	);
}
