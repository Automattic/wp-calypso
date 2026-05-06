import { useMastodonConnectionQuery } from '@automattic/api-queries';
import { TimelineComposePill, useOptionalComposer } from 'calypso/reader/social/composer';
import { VerifyPanel } from './verify-panel';
import type { MastodonConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: MastodonConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const composer = useOptionalComposer();
	// Same pattern as the timeline panel — fetch the details endpoint to
	// hydrate the avatar (the list endpoint that supplied `connection`
	// always returns `null` for it). React Query dedupes the request with
	// VerifyPanel below, which uses the same key.
	const verify = useMastodonConnectionQuery( connection.id );
	return (
		<>
			{ composer && verify.data && (
				<TimelineComposePill
					avatar={ verify.data.avatar ?? connection.avatar }
					entryPoint="profile_inline"
				/>
			) }
			<VerifyPanel
				data={ verify.data ?? null }
				error={ verify.error ?? null }
				isLoading={ verify.isLoading }
			/>
		</>
	);
}
