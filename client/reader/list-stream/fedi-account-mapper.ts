import type { PublicListItem } from './use-public-list-query';
import type { FediAccount } from 'calypso/lib/fediverse';

/**
 * Parse a Fediverse handle like "@user@mastodon.social" into username and instance.
 */
export function parseFediverseHandle(
	handle: string
): { username: string; instance: string } | null {
	const match = handle.match( /^@?([^@]+)@(.+)$/ );
	if ( ! match ) {
		return null;
	}
	return { username: match[ 1 ], instance: match[ 2 ] };
}

/**
 * Convert PublicListItems with fediverse_handle to FediAccount objects.
 */
export function publicListItemsToFediAccounts( items: PublicListItem[] ): FediAccount[] {
	const accounts: FediAccount[] = [];
	for ( const item of items ) {
		if ( ! item.fediverse_handle ) {
			continue;
		}
		const parsed = parseFediverseHandle( item.fediverse_handle );
		if ( ! parsed ) {
			continue;
		}
		accounts.push( {
			username: parsed.username,
			instance: parsed.instance,
			displayName: item.site_name || '',
			bio: '',
			avatarUrl: '',
			feedUrl: item.site_url || undefined,
		} );
	}
	return accounts;
}
