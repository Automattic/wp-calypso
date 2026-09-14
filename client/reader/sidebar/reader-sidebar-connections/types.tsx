import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import { ReaderFediverseIcon } from 'calypso/reader/components/icons/fediverse-icon';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
import type { JSX } from 'react';

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
	switch ( protocol ) {
		case 'atmosphere':
			// Filled glyph reads better at the 10px badge size — outline strokes
			// lose fidelity past the rasterisation threshold.
			return <ReaderBlueskyIcon filled />;
		case 'mastodon':
			return <ReaderMastodonIcon />;
		case 'fediverse':
			return <ReaderFediverseIcon />;
		default: {
			const exhaustive: never = protocol;
			return exhaustive;
		}
	}
}

export function getProtocolLabel( protocol: ConnectionProtocol ): string {
	switch ( protocol ) {
		case 'atmosphere':
			return 'ATmosphere';
		case 'mastodon':
			return 'Mastodon';
		case 'fediverse':
			return 'Fediverse';
		default: {
			const exhaustive: never = protocol;
			return exhaustive;
		}
	}
}
