import { useMastodonConnectionQuery } from '@automattic/api-queries';
import { TimelineComposePill, useOptionalComposer } from 'calypso/reader/social/composer';
import { MastodonAuthorProfilePanel } from './author-profile-panel';
import type { MastodonConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: MastodonConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const composer = useOptionalComposer();
	// Same pattern as the timeline panel — fetch the details endpoint to
	// hydrate the avatar (the list endpoint that supplied `connection`
	// always returns `null` for it). React Query dedupes the request with
	// the inner author-profile query.
	const { data } = useMastodonConnectionQuery( connection.id );

	return (
		<>
			{ composer && data && (
				<TimelineComposePill
					avatar={ data.avatar ?? connection.avatar }
					entryPoint="profile_inline"
				/>
			) }
			<MastodonAuthorProfilePanel
				connection={ connection }
				actor={ connection.handle }
				subtabBasePath={ `/reader/mastodon/${ connection.id }/profile` }
			/>
		</>
	);
}
