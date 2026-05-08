import { FediverseAuthorProfilePanel } from './author-profile-panel';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	connection: FediverseConnection;
}

/**
 * Connected user's `/profile` page. Mirrors the Mastodon pattern:
 * delegates to the same `FediverseAuthorProfilePanel` used for
 * `/profile/<actor>`, just passing the user's own webfinger handle as
 * the actor. The shared panel renders the profile header plus the
 * actor's authored feed, so users see their own posts inline rather
 * than just a slim verification card.
 */
export function ProfilePanel( { connection }: Props ) {
	// `webfinger` is emitted with a leading `@` (e.g. `@alice@example.com`).
	// Strip it before forwarding so the panel's empty-title format (which
	// prefixes its own `@`) and Tracks props don't end up with `@@user@host`.
	const actor = connection.webfinger.startsWith( '@' )
		? connection.webfinger.slice( 1 )
		: connection.webfinger;
	return <FediverseAuthorProfilePanel connection={ connection } actor={ actor } />;
}
