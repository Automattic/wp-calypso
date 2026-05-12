import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import { ReaderFediverseIcon } from 'calypso/reader/components/icons/fediverse-icon';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';

export type ConnectionProtocol = 'atmosphere' | 'mastodon' | 'fediverse';

export interface UnifiedConnection {
	protocol: ConnectionProtocol;
	id: number;
	displayName: string;
	handle: string;
	avatarUrl: string | null;
	href: string;
}

export function getProtocolIcon( protocol: ConnectionProtocol ): JSX.Element {
	if ( protocol === 'atmosphere' ) {
		return <ReaderBlueskyIcon />;
	}
	if ( protocol === 'mastodon' ) {
		return <ReaderMastodonIcon />;
	}
	return <ReaderFediverseIcon />;
}

export function getProtocolLabel( protocol: ConnectionProtocol ): string {
	if ( protocol === 'atmosphere' ) {
		return 'Bluesky';
	}
	if ( protocol === 'mastodon' ) {
		return 'Mastodon';
	}
	return 'Fediverse';
}
